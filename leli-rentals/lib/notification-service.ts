// Notification service for browser notifications and enhanced user feedback

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

export enum NotificationType {
  BOOKING_REQUEST = 'booking_request',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  NEW_REVIEW = 'new_review',
  MESSAGE_RECEIVED = 'message_received',
  PAYMENT_RECEIVED = 'payment_received',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  CUSTOM = 'custom'
}

export class NotificationService {
  private permission: NotificationPermission = 'default'

  constructor() {
    if (typeof window !== 'undefined') {
      this.permission = Notification.permission
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission()
    }

    return this.permission
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  // Check if permission is granted
  hasPermission(): boolean {
    return this.permission === 'granted'
  }

  // Show browser notification
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser')
      return
    }

    if (!this.hasPermission()) {
      await this.requestPermission()
    }

    if (this.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  // Show booking success notification
  async showBookingSuccessNotification(listingTitle: string, duration: number): Promise<void> {
    await this.showNotification({
      title: '🎉 Booking Successful!',
      body: `You've successfully booked "${listingTitle}" for ${duration} day${duration > 1 ? 's' : ''}. Check your bookings page for details.`,
      icon: '/favicon.ico',
      tag: 'booking-success',
      requireInteraction: true,
    })
  }

  // Show booking confirmation notification
  async showBookingConfirmationNotification(listingTitle: string, duration: number, paymentMethod: string): Promise<void> {
    await this.showNotification({
      title: '🎉 Booking Confirmed!',
      body: `Successfully booked "${listingTitle}" for ${duration} day${duration > 1 ? 's' : ''} via ${paymentMethod}.`,
      icon: '/favicon.ico',
      tag: 'booking-confirmation',
      requireInteraction: true,
    })
  }

  // Show general success notification
  async showSuccessNotification(title: string, message: string): Promise<void> {
    await this.showNotification({
      title: `✅ ${title}`,
      body: message,
      icon: '/favicon.ico',
      tag: 'success',
    })
  }

  // Show error notification
  async showErrorNotification(title: string, message: string): Promise<void> {
    await this.showNotification({
      title: `❌ ${title}`,
      body: message,
      icon: '/favicon.ico',
      tag: 'error',
      requireInteraction: true,
    })
  }

  // Static methods for triggering notifications
  static async triggerBookingRequest(ownerId: string, renterName: string, listingTitle: string): Promise<void> {
    console.log(`Booking request from ${renterName} for ${listingTitle}`)
    // Implementation would go here
  }

  static async triggerBookingConfirmed(renterId: string, listingTitle: string): Promise<void> {
    console.log(`Booking confirmed for ${listingTitle}`)
    // Implementation would go here
  }

  static async triggerBookingCancelled(renterId: string, listingTitle: string): Promise<void> {
    console.log(`Booking cancelled for ${listingTitle}`)
    // Implementation would go here
  }

  static async triggerNewReview(ownerId: string, reviewerName: string, listingTitle: string, rating: number): Promise<void> {
    console.log(`New review from ${reviewerName} for ${listingTitle} - Rating: ${rating}`)
    // Implementation would go here
  }

  static async triggerMessageReceived(receiverId: string, senderName: string, listingTitle?: string): Promise<void> {
    console.log(`Message received from ${senderName}${listingTitle ? ` about ${listingTitle}` : ''}`)
    // Implementation would go here
  }

  static async triggerPaymentReceived(ownerId: string, amount: number, listingTitle: string): Promise<void> {
    console.log(`Payment received: $${amount} for ${listingTitle}`)
    // Implementation would go here
  }

  static async triggerSystemAnnouncement(userId: string, title: string, message: string): Promise<void> {
    console.log(`System announcement for user ${userId}: ${title}`)
    // Implementation would go here
  }

  // Create custom notification
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    await this.showNotification({
      title,
      body: message,
      icon: '/favicon.ico',
      tag: type,
      requireInteraction: true,
    })
  }
}

export const notificationService = new NotificationService()