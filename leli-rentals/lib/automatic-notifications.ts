/**
 * Automatic Notifications System
 * Triggers real notifications based on user actions
 */

import { notificationTriggers } from './notification-triggers'
import { supabase } from './supabase'

export const automaticNotifications = {
  /**
   * Send welcome notification to new users
   * Call this when user first signs up
   */
  async sendWelcomeNotification(userId: string, userName: string) {
    try {
      await notificationTriggers.triggerWelcomeNotification(userId, userName)
    } catch (error) {
      console.error('Failed to send welcome notification:', error)
    }
  },

  /**
   * Send notification when user saves/favorites a listing
   */
  async sendFavoriteNotification(
    userId: string,
    listingId: string,
    userName: string
  ) {
    try {
      // Get listing details to find owner
      const { data: listing } = await supabase
        .from('listings')
        .select('user_id, title')
        .eq('id', listingId)
        .single()

      if (listing && listing.user_id !== userId) {
        // Notify the owner (not the person who favorited)
        await notificationTriggers.triggerFavoriteNotification(
          listing.user_id,
          userName,
          listing.title
        )
        
        // Also notify the user who favorited
        await notificationTriggers.triggerNotification({
          user_id: userId,
          type: 'favorite',
          title: 'Added to Favorites',
          message: `"${listing.title}" has been added to your favorites`,
          link: '/profile/favorites'
        })
      }
    } catch (error) {
      console.error('Failed to send favorite notification:', error)
    }
  },

  /**
   * Send notification when user books a listing
   */
  async sendBookingNotification(
    renterId: string,
    ownerId: string,
    listingTitle: string,
    renterName: string,
    bookingId?: string
  ) {
    try {
      // Notify the owner
      await notificationTriggers.triggerBookingNotification(
        ownerId,
        listingTitle,
        renterName
      )

      // Notify the renter
      await notificationTriggers.triggerNotification({
        user_id: renterId,
        type: 'booking',
        title: 'Booking Confirmed',
        message: `Your booking request for "${listingTitle}" has been submitted`,
        link: bookingId ? `/bookings/${bookingId}` : '/profile/bookings'
      })
    } catch (error) {
      console.error('Failed to send booking notification:', error)
    }
  },

  /**
   * Send notification when user creates a new listing
   */
  async sendListingCreatedNotification(
    userId: string,
    listingTitle: string,
    isDraft: boolean = false
  ) {
    try {
      if (isDraft) {
        await notificationTriggers.triggerNotification({
          user_id: userId,
          type: 'listing',
          title: 'Draft Saved',
          message: `Your listing "${listingTitle}" has been saved as a draft`,
          link: '/dashboard/owner'
        })
      } else {
        await notificationTriggers.triggerListingStatusNotification(
          userId,
          listingTitle,
          'published'
        )
      }
    } catch (error) {
      console.error('Failed to send listing created notification:', error)
    }
  },

  /**
   * Send notification when account is verified
   */
  async sendVerificationNotification(
    userId: string,
    status: 'approved' | 'rejected',
    message?: string
  ) {
    try {
      await notificationTriggers.triggerVerificationNotification(
        userId,
        status,
        message
      )
    } catch (error) {
      console.error('Failed to send verification notification:', error)
    }
  },

  /**
   * Send notification when user receives a message
   */
  async sendMessageNotification(
    recipientId: string,
    senderName: string,
    conversationId?: string
  ) {
    try {
      await notificationTriggers.triggerMessageNotification(
        recipientId,
        senderName,
        conversationId
      )
    } catch (error) {
      console.error('Failed to send message notification:', error)
    }
  },

  /**
   * Send notification when payment is received
   */
  async sendPaymentNotification(
    userId: string,
    amount: number,
    listingTitle: string
  ) {
    try {
      await notificationTriggers.triggerNotification({
        user_id: userId,
        type: 'payment',
        title: 'Payment Received',
        message: `You received $${amount} for "${listingTitle}"`,
        link: '/profile/billing'
      })
    } catch (error) {
      console.error('Failed to send payment notification:', error)
    }
  },

  /**
   * Send notification when subscription status changes
   */
  async sendSubscriptionNotification(
    userId: string,
    plan: string,
    action: 'upgraded' | 'downgraded' | 'cancelled'
  ) {
    try {
      const messages = {
        upgraded: `You've been upgraded to ${plan} plan! Enjoy your new features.`,
        downgraded: `Your subscription has been changed to ${plan} plan.`,
        cancelled: `Your ${plan} subscription has been cancelled.`
      }

      await notificationTriggers.triggerNotification({
        user_id: userId,
        type: 'subscription',
        title: `Subscription ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: messages[action],
        link: '/profile/billing'
      })
    } catch (error) {
      console.error('Failed to send subscription notification:', error)
    }
  },

  /**
   * Send notification when user receives a review
   */
  async sendReviewNotification(
    userId: string,
    reviewerName: string,
    rating: number,
    listingTitle: string
  ) {
    try {
      await notificationTriggers.triggerNotification({
        user_id: userId,
        type: 'review',
        title: 'New Review Received',
        message: `${reviewerName} left a ${rating}-star review for "${listingTitle}"`,
        link: '/dashboard/owner'
      })
    } catch (error) {
      console.error('Failed to send review notification:', error)
    }
  },

  /**
   * Send reminder notification
   */
  async sendReminderNotification(
    userId: string,
    title: string,
    message: string,
    link?: string
  ) {
    try {
      await notificationTriggers.triggerNotification({
        user_id: userId,
        type: 'reminder',
        title,
        message,
        link
      })
    } catch (error) {
      console.error('Failed to send reminder notification:', error)
    }
  },

  /**
   * Send system notification (announcements, updates, etc.)
   */
  async sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    link?: string
  ) {
    try {
      await notificationTriggers.triggerNotification({
        user_id: userId,
        type: 'system',
        title,
        message,
        link
      })
    } catch (error) {
      console.error('Failed to send system notification:', error)
    }
  }
}

