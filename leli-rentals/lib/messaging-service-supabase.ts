import { supabase } from './supabase'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
  type: 'text' | 'image' | 'file'
  bookingId?: string
  listingId?: string
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
    imageUrl?: string
  }
}

export interface ChatSession {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  participantPhone?: string
  participantRating?: number
  participantVerified?: boolean
  lastMessage?: Message
  unreadCount: number
  listingTitle?: string
  listingImage?: string
  bookingId?: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived' | 'blocked'
}

class MessagingServiceSupabase {
  // Create a new chat session
  async createChatSession(userId: string, sessionData: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          participant_id: sessionData.participantId,
          participant_name: sessionData.participantName,
          participant_avatar: sessionData.participantAvatar,
          participant_phone: sessionData.participantPhone || null,
          participant_rating: sessionData.participantRating || null,
          participant_verified: sessionData.participantVerified || false,
          listing_title: sessionData.listingTitle || null,
          listing_image: sessionData.listingImage || null,
          booking_id: sessionData.bookingId || null,
          unread_count: sessionData.unreadCount || 0,
          status: 'active'
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating chat session:', error)
      throw new Error('Failed to create chat session')
    }
  }

  // Get chat sessions for a user
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      // Get chat sessions where user is EITHER the user_id OR participant_id
      // This ensures both renters and owners can see their conversations
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .or(`user_id.eq.${userId},participant_id.eq.${userId}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

      if (sessionsError) throw sessionsError
      if (!sessions || sessions.length === 0) return []

      // Get last message for each session
      const sessionIds = sessions.map(s => s.id)
      const { data: lastMessages } = await supabase
        .from('messages')
        .select('chat_session_id, content, created_at, sender_id, read_status')
        .in('chat_session_id', sessionIds)
        .order('created_at', { ascending: false })

      // Group last messages by session
      const lastMessagesMap = new Map<string, any>()
      if (lastMessages) {
        for (const msg of lastMessages) {
          if (!lastMessagesMap.has(msg.chat_session_id)) {
            lastMessagesMap.set(msg.chat_session_id, msg)
          }
        }
      }

      const result: ChatSession[] = sessions.map(session => {
        const lastMsg = lastMessagesMap.get(session.id)

        // Determine who the "other person" is in this conversation
        const isUserTheOwner = session.participant_id === userId
        const otherPersonId = isUserTheOwner ? session.user_id : session.participant_id
        const otherPersonName = isUserTheOwner ? 'Renter' : session.participant_name
        const otherPersonAvatar = isUserTheOwner ? '/placeholder-user.jpg' : session.participant_avatar

        return {
          id: session.id,
          participantId: otherPersonId,
          participantName: otherPersonName,
          participantAvatar: otherPersonAvatar,
          participantPhone: session.participant_phone,
          participantRating: session.participant_rating,
          participantVerified: session.participant_verified,
          listingTitle: session.listing_title,
          listingImage: session.listing_image,
          bookingId: session.booking_id,
          unreadCount: session.unread_count || 0,
          status: session.status,
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
          lastMessage: lastMsg ? {
            id: lastMsg.chat_session_id,
            senderId: lastMsg.sender_id,
            receiverId: userId,
            content: lastMsg.content,
            timestamp: new Date(lastMsg.created_at),
            read: lastMsg.read_status || false,
            type: 'text' as const
          } : undefined
        }
      })

      return result
    } catch (error) {
      console.error('Error getting chat sessions:', error)
      return [] // Return empty array instead of throwing to prevent UI crashes
    }
  }

  // Get messages for a specific chat session
  async getMessages(chatSessionId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', chatSessionId)
        .order('created_at', { ascending: true })
        .limit(limitCount)

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        timestamp: new Date(row.created_at),
        read: row.read_status || false,
        type: row.message_type || 'text',
        bookingId: row.booking_id,
        listingId: row.listing_id,
        metadata: row.metadata || {}
      }))
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  }

  // Send a message
  async sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      // Insert the message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_session_id: messageData.chatSessionId,
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId,
          content: messageData.content,
          message_type: messageData.type || 'text',
          metadata: messageData.metadata || {},
          read_status: false,
          booking_id: messageData.bookingId || null,
          listing_id: messageData.listingId || null
        })
        .select('id')
        .single()

      if (messageError) throw messageError

      // Update chat session with last message and increment unread count
      const { error: updateError } = await supabase.rpc('increment_chat_unread', {
        session_id: messageData.chatSessionId,
        receiver_id: messageData.receiverId
      })

      // If RPC doesn't exist, do manual update
      if (updateError) {
        const { data: session } = await supabase
          .from('chat_sessions')
          .select('unread_count, participant_id')
          .eq('id', messageData.chatSessionId)
          .single()

        if (session) {
          const newUnreadCount = session.participant_id === messageData.receiverId
            ? (session.unread_count || 0) + 1
            : session.unread_count || 0

          await supabase
            .from('chat_sessions')
            .update({
              unread_count: newUnreadCount,
              updated_at: new Date().toISOString()
            })
            .eq('id', messageData.chatSessionId)
        }
      }

      return message.id
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatSessionId: string, userId: string): Promise<void> {
    try {
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('chat_session_id', chatSessionId)
        .eq('receiver_id', userId)
        .eq('read_status', false)

      // Reset unread count in chat session
      await supabase
        .from('chat_sessions')
        .update({ unread_count: 0 })
        .eq('id', chatSessionId)
        .eq('user_id', userId)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Get or create chat session between two users
  async getOrCreateChatSession(userId1: string, userId2: string, listingData?: {
    title: string
    image: string
    bookingId?: string
  }): Promise<string> {
    try {
      // Check if chat session already exists
      const { data: existing } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId1)
        .eq('participant_id', userId2)
        .maybeSingle()

      if (existing) {
        return existing.id
      }

      // Get participant info from user profile if possible
      let participantName = 'Unknown User'
      let participantAvatar = '/placeholder-user.jpg'

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, avatar')
          .eq('id', userId2)
          .maybeSingle()

        if (profile) {
          participantName = profile.name || participantName
          participantAvatar = profile.avatar || participantAvatar
        }
      } catch (error) {
        console.error('Error fetching participant profile:', error)
      }

      // Create new chat session
      const sessionData = {
        participantId: userId2,
        participantName,
        participantAvatar,
        unreadCount: 0,
        listingTitle: listingData?.title,
        listingImage: listingData?.image,
        bookingId: listingData?.bookingId
      }

      return await this.createChatSession(userId1, sessionData)
    } catch (error) {
      console.error('Error getting or creating chat session:', error)
      throw new Error('Failed to get or create chat session')
    }
  }
}

export const messagingServiceSupabase = new MessagingServiceSupabase()
export default messagingServiceSupabase

