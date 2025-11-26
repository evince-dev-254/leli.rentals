// Firebase removed - all imports removed
import { query as dbQuery, transaction } from './database'

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

class MessagingService {
  // Create a new chat session
  async createChatSession(userId: string, sessionData: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const result = await dbQuery(`
        INSERT INTO chat_sessions (
          user_id, participant_id, participant_name, participant_avatar, 
          participant_phone, participant_rating, participant_verified,
          listing_title, listing_image, booking_id, unread_count, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        userId, // The user who owns this chat session
        sessionData.participantId, // The participant (the other user)
        sessionData.participantName,
        sessionData.participantAvatar,
        sessionData.participantPhone || null,
        sessionData.participantRating || null,
        sessionData.participantVerified || false,
        sessionData.listingTitle || null,
        sessionData.listingImage || null,
        sessionData.bookingId || null,
        sessionData.unreadCount || 0,
        'active'
      ])

      return result.rows[0].id
    } catch (error) {
      console.error('Error creating chat session:', error)
      throw new Error('Failed to create chat session')
    }
  }

  // Get chat sessions for a user
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const result = await dbQuery(`
        SELECT 
          cs.*,
          m.content as last_message_content,
          m.created_at as last_message_timestamp,
          m.sender_id as last_message_sender_id,
          m.read_status as last_message_read
        FROM chat_sessions cs
        LEFT JOIN LATERAL (
          SELECT content, created_at, sender_id, read_status
          FROM messages 
          WHERE chat_session_id = cs.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) m ON true
        WHERE cs.user_id = $1
        ORDER BY cs.updated_at DESC
      `, [userId])

      const sessions: ChatSession[] = result.rows.map(row => ({
        id: row.id,
        participantId: row.participant_id,
        participantName: row.participant_name,
        participantAvatar: row.participant_avatar,
        participantPhone: row.participant_phone,
        participantRating: row.participant_rating,
        participantVerified: row.participant_verified,
        listingTitle: row.listing_title,
        listingImage: row.listing_image,
        bookingId: row.booking_id,
        unreadCount: row.unread_count,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastMessage: row.last_message_content ? {
          id: 'temp',
          senderId: row.last_message_sender_id,
          receiverId: userId,
          content: row.last_message_content,
          timestamp: row.last_message_timestamp,
          read: row.last_message_read,
          type: 'text' as const
        } : undefined
      }))

      return sessions
    } catch (error) {
      console.error('Error getting chat sessions:', error)
      throw new Error('Failed to get chat sessions')
    }
  }

  // Get messages for a specific chat session
  async getMessages(chatSessionId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const result = await dbQuery(`
        SELECT * FROM messages 
        WHERE chat_session_id = $1 
        ORDER BY created_at ASC 
        LIMIT $2
      `, [chatSessionId, limitCount])

      const messages: Message[] = result.rows.map(row => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        timestamp: row.created_at,
        read: row.read_status,
        type: row.message_type,
        bookingId: row.booking_id,
        listingId: row.listing_id,
        metadata: row.metadata
      }))

      return messages
    } catch (error) {
      console.error('Error getting messages:', error)
      throw new Error('Failed to get messages')
    }
  }

  // Send a message
  async sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      return await transaction(async (client) => {
        // Insert the message
        const messageResult = await client.query(`
          INSERT INTO messages (
            chat_session_id, sender_id, receiver_id, content, 
            message_type, metadata, read_status, booking_id, listing_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, created_at
        `, [
          messageData.chatSessionId,
          messageData.senderId,
          messageData.receiverId,
          messageData.content,
          messageData.type,
          JSON.stringify(messageData.metadata || {}),
          false,
          messageData.bookingId,
          messageData.listingId
        ])

        const messageId = messageResult.rows[0].id
        const messageTimestamp = messageResult.rows[0].created_at

        // Update chat session with last message and increment unread count
        await client.query(`
          UPDATE chat_sessions 
          SET 
            unread_count = CASE 
              WHEN participant_id = $1 THEN unread_count + 1 
              ELSE unread_count 
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [messageData.receiverId, messageData.chatSessionId])

        return messageId
      })
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatSessionId: string, userId: string): Promise<void> {
    try {
      await transaction(async (client) => {
        // Mark messages as read
        await client.query(`
          UPDATE messages 
          SET read_status = true 
          WHERE chat_session_id = $1 AND receiver_id = $2 AND read_status = false
        `, [chatSessionId, userId])

        // Reset unread count in chat session
        await client.query(`
          UPDATE chat_sessions 
          SET unread_count = 0 
          WHERE id = $1 AND user_id = $2
        `, [chatSessionId, userId])
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw new Error('Failed to mark messages as read')
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
      const result = await dbQuery(`
        SELECT id FROM chat_sessions 
        WHERE user_id = $1 AND participant_id = $2
      `, [userId1, userId2])

      if (result.rows.length > 0) {
        return result.rows[0].id
      }

      // Get participant info from user profile if possible
      let participantName = 'Unknown User'
      let participantAvatar = '/placeholder-user.jpg'
      
      try {
        // Try to get user info from Supabase
        const { supabase } = await import('./supabase')
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

  // Archive a chat session
  async archiveChatSession(chatSessionId: string): Promise<void> {
    try {
      await query(`
        UPDATE chat_sessions 
        SET status = 'archived', updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [chatSessionId])
    } catch (error) {
      console.error('Error archiving chat session:', error)
      throw new Error('Failed to archive chat session')
    }
  }

  // Delete a chat session
  async deleteChatSession(chatSessionId: string): Promise<void> {
    try {
      await transaction(async (client) => {
        // Delete all messages in the chat session
        await client.query(`
          DELETE FROM messages WHERE chat_session_id = $1
        `, [chatSessionId])

        // Delete the chat session
        await client.query(`
          DELETE FROM chat_sessions WHERE id = $1
        `, [chatSessionId])
      })
    } catch (error) {
      console.error('Error deleting chat session:', error)
      throw new Error('Failed to delete chat session')
    }
  }

  // Search messages
  async searchMessages(userId: string, searchTerm: string): Promise<Message[]> {
    try {
      const result = await dbQuery(`
        SELECT m.* FROM messages m
        JOIN chat_sessions cs ON m.chat_session_id = cs.id
        WHERE m.content ILIKE $1 AND cs.user_id = $2
        ORDER BY m.created_at DESC
      `, [`%${searchTerm}%`, userId])

      const messages: Message[] = result.rows.map(row => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        timestamp: row.created_at,
        read: row.read_status,
        type: row.message_type,
        bookingId: row.booking_id,
        listingId: row.listing_id,
        metadata: row.metadata
      }))

      return messages
    } catch (error) {
      console.error('Error searching messages:', error)
      throw new Error('Failed to search messages')
    }
  }
}

export const messagingService = new MessagingService()
export default messagingService
