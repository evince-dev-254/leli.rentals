/**
 * Database service for saving all user interactions
 * Favorites, Bookings, Messages, Listings, and more
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { automaticNotifications } from './automatic-notifications'

// ==================== FAVORITES ====================

export interface Favorite {
  id?: string
  user_id: string
  listing_id: string
  created_at?: string
}

export const favoritesDB = {
  /**
   * Add a listing to favorites
   */
  async addFavorite(userId: string, listingId: string, userName?: string): Promise<{ success: boolean; id?: string }> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, favorite not saved to database')
      return { success: false }
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          listing_id: listingId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      console.log('✓ Favorite saved to database:', data.id)

      // Send automatic notification
      if (userName) {
        automaticNotifications.sendFavoriteNotification(
          userId,
          listingId,
          userName
        ).catch(err => console.error('Notification error:', err))
      }

      return { success: true, id: data.id }
    } catch (error: any) {
      console.error('Error adding favorite:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      return { success: false }
    }
  },

  /**
   * Remove a listing from favorites
   */
  async removeFavorite(userId: string, listingId: string): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured) {
      return { success: false }
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId)

      if (error) throw error

      console.log('✓ Favorite removed from database')
      return { success: true }
    } catch (error) {
      console.error('Error removing favorite:', error)
      return { success: false }
    }
  },

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    if (!isSupabaseConfigured) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  },

  /**
   * Check if a listing is favorited by user
   */
  async isFavorited(userId: string, listingId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }
}

// ==================== BOOKINGS ====================

export interface Booking {
  id?: string
  user_id: string
  listing_id: string
  owner_id: string
  start_date: string
  end_date: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_id?: string
  coupon_id?: string
  discount_amount?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export const bookingsDB = {
  /**
   * Create a new booking
   */
  async createBooking(
    booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>,
    renterName?: string,
    listingTitle?: string
  ): Promise<{ success: boolean; id?: string }> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, booking not saved to database')
      return { success: false }
    }

    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error

      console.log('✓ Booking saved to database:', data.id)

      // Send automatic notification
      if (renterName && listingTitle) {
        automaticNotifications.sendBookingNotification(
          booking.user_id,
          booking.owner_id,
          listingTitle,
          renterName,
          data.id
        ).catch(err => console.error('Notification error:', err))
      }

      return { success: true, id: data.id }
    } catch (error: any) {
      console.error('Error creating booking:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: error
      })
      return { success: false }
    }
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    paymentStatus?: Booking['payment_status']
  ): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured) {
      return { success: false }
    }

    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (paymentStatus) {
        updates.payment_status = paymentStatus
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)

      if (error) throw error

      console.log('✓ Booking status updated in database')
      return { success: true }
    } catch (error) {
      console.error('Error updating booking:', error)
      return { success: false }
    }
  },

  /**
   * Get bookings for a user (as renter)
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    if (!isSupabaseConfigured) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      return []
    }
  },

  /**
   * Get bookings for an owner
   */
  async getOwnerBookings(ownerId: string): Promise<Booking[]> {
    if (!isSupabaseConfigured) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching owner bookings:', error)
      return []
    }
  }
}

// ==================== MESSAGES ====================

export interface Message {
  id?: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  created_at?: string
}

export const messagesDB = {
  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<{ success: boolean; id?: string }> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, message not saved to database')
      return { success: false }
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          message,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      console.log('✓ Message saved to database:', data.id)
      return { success: true, id: data.id }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false }
    }
  },

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    if (!isSupabaseConfigured) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured) {
      return { success: false }
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false)

      if (error) throw error

      console.log('✓ Messages marked as read in database')
      return { success: true }
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return { success: false }
    }
  }
}

// ==================== REVIEWS ====================

export interface Review {
  id?: string
  listing_id: string
  reviewer_id: string
  rating: number
  comment?: string
  created_at?: string
}

export const reviewsDB = {
  /**
   * Add a review
   */
  async addReview(
    listingId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; id?: string }> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, review not saved to database')
      return { success: false }
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          listing_id: listingId,
          reviewer_id: userId,
          rating,
          comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      console.log('✓ Review saved to database:', data.id)
      return { success: true, id: data.id }
    } catch (error) {
      console.error('Error adding review:', error)
      return { success: false }
    }
  },

  /**
   * Get reviews for a listing
   */
  async getListingReviews(listingId: string): Promise<Review[]> {
    if (!isSupabaseConfigured) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
  }
}

// ==================== ANALYTICS ====================

export interface PageView {
  id?: string
  user_id?: string
  page_url: string
  referrer?: string
  created_at?: string
}

export const analyticsDB = {
  /**
   * Track page view
   */
  async trackPageView(pageUrl: string, userId?: string, referrer?: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      await supabase.from('page_views').insert({
        user_id: userId,
        page_url: pageUrl,
        referrer,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  },

  /**
   * Track listing view
   */
  async trackListingView(listingId: string, userId?: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      await supabase.from('listing_views').insert({
        listing_id: listingId,
        user_id: userId,
        created_at: new Date().toISOString()
      })

      // Also increment view count on listing
      await supabase.rpc('increment_listing_views', { listing_id: listingId })
    } catch (error) {
      console.error('Error tracking listing view:', error)
    }
  }
}

