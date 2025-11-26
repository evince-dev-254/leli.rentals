import { supabase } from './supabase'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  read: boolean
  listing_id?: string
  booking_id?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  listing_id?: string
  listing_title?: string
  listing_image?: string
  booking_id?: string
  last_message_id?: string
  last_message_content?: string
  last_message_at?: string
  created_at: string
  updated_at: string
}

export interface ConversationWithDetails extends Conversation {
  participant_name: string
  participant_avatar: string
  participant_phone?: string
  participant_rating?: number
  participant_verified?: boolean
  unread_count: number
  last_message?: Message
}

class MessagesServiceSupabase {
  /**
   * Create or get existing conversation between two users
   */
  async getOrCreateConversation(
    user1Id: string,
    user2Id: string,
    listingId?: string,
    listingTitle?: string,
    listingImage?: string
  ): Promise<{ success: boolean; conversation?: Conversation; error?: string }> {
    try {
      // Check if conversation already exists
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${user1Id},participant_2_id.eq.${user2Id}),and(participant_1_id.eq.${user2Id},participant_2_id.eq.${user1Id})`)
        .maybeSingle()

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError
      }

      if (existing) {
        return { success: true, conversation: existing }
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user1Id,
          participant_2_id: user2Id,
          listing_id: listingId,
          listing_title: listingTitle,
          listing_image: listingImage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return { success: true, conversation: newConversation }
    } catch (error) {
      console.error('Error creating conversation:', error)
      return { success: false, error: 'Failed to create conversation' }
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<{ success: boolean; conversations?: ConversationWithDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!inner (
            id,
            content,
            created_at,
            sender_id,
            read
          )
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      // TODO: Fetch participant details from Clerk or user_profiles table
      const conversationsWithDetails: ConversationWithDetails[] = (data || []).map((conv: any) => ({
        ...conv,
        participant_name: 'User', // TODO: Fetch from Clerk
        participant_avatar: '/placeholder-user.jpg',
        participant_phone: '+254700000000',
        participant_rating: 4.5,
        participant_verified: false,
        unread_count: conv.messages?.filter((m: any) => !m.read && m.sender_id !== userId).length || 0,
        last_message: conv.messages?.[0]
      }))

      return { success: true, conversations: conversationsWithDetails }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return { success: false, error: 'Failed to fetch conversations' }
    }
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId: string): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return { success: true, messages: data || [] }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return { success: false, error: 'Failed to fetch messages' }
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    listingId?: string,
    bookingId?: string
  ): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_type: messageType,
          read: false,
          listing_id: listingId,
          booking_id: bookingId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message_id: data.id,
          last_message_content: content,
          last_message_at: data.created_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      return { success: true, message: data }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error: 'Failed to send message' }
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return { success: false, error: 'Failed to mark messages as read' }
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
  }
}

export const messagesServiceSupabase = new MessagesServiceSupabase()

