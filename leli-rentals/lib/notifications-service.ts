// Firebase removed - all imports removed

export interface Notification {
  id: string
  userId: string
  type: 'booking' | 'payment' | 'system' | 'listing' | 'message' | 'review' | 'reminder' | 'promotion'
  title: string
  message: string
  link?: string
  data?: {
    bookingId?: string
    listingId?: string
    amount?: number
    status?: string
    [key: string]: any
  }
  read: boolean
  createdAt: Date
  updatedAt: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: string
  link?: string
  variant?: 'primary' | 'secondary' | 'destructive'
}

export interface NotificationCreateData {
  userId: string
  type: 'booking' | 'payment' | 'system' | 'listing' | 'message' | 'review' | 'reminder' | 'promotion'
  title: string
  message: string
  link?: string
  data?: {
    bookingId?: string
    listingId?: string
    amount?: number
    status?: string
    [key: string]: any
  }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  actions?: NotificationAction[]
}

class NotificationsService {
  private COLLECTION_NAME = 'notifications'
  private subscriptions: Map<string, Unsubscribe> = new Map()

  // Create a new notification
  async createNotification(notificationData: NotificationCreateData): Promise<string> {
    try {
      // Firebase removed - return mock ID
      console.log('Mock: Creating notification:', notificationData)
      return `notification_${Date.now()}`
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      // Firebase removed - return empty array
      console.log('Mock: Getting notifications for user:', userId)
      return []
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Firebase removed - mock implementation
      console.log('Mock: Marking notification as read:', notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId, 1000)
      const unreadNotifications = notifications.filter(n => !n.read)
      
      const updatePromises = unreadNotifications.map(notification => 
        this.markAsRead(notification.id)
      )
      
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId, 1000)
      return notifications.filter(n => !n.read).length
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Create booking notification
  async createBookingNotification(userId: string, bookingData: {
    bookingId: string
    listingTitle: string
    status: 'confirmed' | 'pending' | 'cancelled'
    totalPrice: number
    dates: { start: Date; end: Date }
  }): Promise<string> {
    console.log('Creating booking notification for user:', userId, 'booking:', bookingData)
    
    const statusMessages = {
      confirmed: 'Booking confirmed!',
      pending: 'Booking pending approval',
      cancelled: 'Booking cancelled'
    }

    const statusEmojis = {
      confirmed: '✅',
      pending: '⏳',
      cancelled: '❌'
    }

    try {
      const notificationId = await this.createNotification({
        userId,
        type: 'booking',
        title: `${statusEmojis[bookingData.status]} ${statusMessages[bookingData.status]}`,
        message: `${bookingData.listingTitle} • KSh ${bookingData.totalPrice.toLocaleString()}`,
        link: `/profile/bookings`,
        data: {
          bookingId: bookingData.bookingId,
          status: bookingData.status,
          amount: bookingData.totalPrice
        }
      })
      console.log('Booking notification created successfully:', notificationId)
      return notificationId
    } catch (error) {
      console.error('Error creating booking notification:', error)
      throw error
    }
  }

  // Create payment notification
  async createPaymentNotification(userId: string, paymentData: {
    bookingId: string
    amount: number
    status: 'success' | 'failed' | 'pending'
    method: string
  }): Promise<string> {
    console.log('Creating payment notification for user:', userId, 'payment:', paymentData)
    
    const statusMessages = {
      success: 'Payment successful!',
      failed: 'Payment failed.',
      pending: 'Payment is being processed.'
    }

    const statusEmojis = {
      success: '💳',
      failed: '❌',
      pending: '⏳'
    }

    try {
      const notificationId = await this.createNotification({
        userId,
        type: 'payment',
        title: `${statusEmojis[paymentData.status]} Payment ${paymentData.status.charAt(0).toUpperCase() + paymentData.status.slice(1)}`,
        message: `${statusMessages[paymentData.status]} KSh ${paymentData.amount} via ${paymentData.method}`,
        data: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          status: paymentData.status
        }
      })
      console.log('Payment notification created successfully:', notificationId)
      return notificationId
    } catch (error) {
      console.error('Error creating payment notification:', error)
      throw error
    }
  }

  // Create system notification
  async createSystemNotification(userId: string, title: string, message: string, data?: any): Promise<string> {
    return this.createNotification({
      userId,
      type: 'system',
      title: `🔔 ${title}`,
      message,
      data
    })
  }

  // Create listing notification
  async createListingNotification(userId: string, listingData: {
    listingId: string
    listingTitle: string
    action: 'created' | 'updated' | 'approved' | 'rejected'
  }): Promise<string> {
    const actionMessages = {
      created: 'Your listing has been created and is under review.',
      updated: 'Your listing has been updated.',
      approved: 'Your listing has been approved and is now live!',
      rejected: 'Your listing was rejected. Please check the feedback.'
    }

    const actionEmojis = {
      created: '📝',
      updated: '✏️',
      approved: '✅',
      rejected: '❌'
    }

    return this.createNotification({
      userId,
      type: 'listing',
      title: `${actionEmojis[listingData.action]} Listing ${listingData.action.charAt(0).toUpperCase() + listingData.action.slice(1)}`,
      message: `${actionMessages[listingData.action]} ${listingData.listingTitle}`,
      data: {
        listingId: listingData.listingId,
        status: listingData.action
      }
    })
  }

  // Create welcome notification for new users
  async createWelcomeNotification(userId: string, userName?: string): Promise<string> {
    console.log('Creating welcome notification for user:', userId, 'name:', userName)
    
    try {
      const notificationId = await this.createNotification({
        userId,
        type: 'system',
        title: '🔔 Welcome to Leli Rentals!',
        message: `Welcome! Complete your profile to get started.`,
        link: '/profile',
        data: {
          isWelcome: true,
          userName: userName || 'New User'
        }
      })
      console.log('Welcome notification created successfully:', notificationId)
      return notificationId
    } catch (error) {
      console.error('Error creating welcome notification:', error)
      throw error
    }
  }

  // Subscribe to real-time notifications for a user
  subscribeToNotifications(
    userId: string, 
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const subscriptionKey = `notifications_${userId}`
    
    // Unsubscribe from existing subscription if any
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey)?.()
    }

    // Firebase removed - mock subscription
    const unsubscribe = () => {
      this.subscriptions.delete(subscriptionKey)
    }
    
    this.subscriptions.set(subscriptionKey, unsubscribe)
    
    // Return empty notifications immediately
    setTimeout(() => {
      onUpdate([])
    }, 0)
    
    return unsubscribe
  }

  // Unsubscribe from notifications for a user
  unsubscribeFromNotifications(userId: string): void {
    const subscriptionKey = `notifications_${userId}`
    const unsubscribe = this.subscriptions.get(subscriptionKey)
    
    if (unsubscribe) {
      unsubscribe()
      this.subscriptions.delete(subscriptionKey)
    }
  }

  // Create sample notifications for testing
  async createSampleNotifications(userId: string): Promise<void> {
    const sampleNotifications = [
      {
        userId,
        type: 'booking' as const,
        title: '🎉 Booking Confirmed!',
        message: 'Your booking for "Modern Downtown Apartment" has been confirmed for Dec 15-20, 2024.',
        link: '/profile/bookings',
        priority: 'high' as const,
        data: {
          bookingId: 'booking_123',
          listingTitle: 'Modern Downtown Apartment',
          amount: 15000,
          status: 'confirmed'
        },
        actions: [
          { label: 'View Booking', action: 'view', link: '/profile/bookings', variant: 'primary' as const },
          { label: 'Contact Host', action: 'contact', link: '/messages', variant: 'secondary' as const }
        ]
      },
      {
        userId,
        type: 'message' as const,
        title: '💬 New Message',
        message: 'You have a new message from Sarah regarding your booking inquiry.',
        link: '/messages',
        priority: 'medium' as const,
        data: {
          senderId: 'user_456',
          senderName: 'Sarah',
          conversationId: 'conv_789'
        },
        actions: [
          { label: 'Reply', action: 'reply', link: '/messages', variant: 'primary' as const }
        ]
      },
      {
        userId,
        type: 'review' as const,
        title: '⭐ New Review',
        message: 'John left a 5-star review for your "Professional Camera Equipment" listing!',
        link: '/profile/listings',
        priority: 'medium' as const,
        data: {
          reviewerId: 'user_789',
          reviewerName: 'John',
          rating: 5,
          listingId: 'listing_456'
        },
        actions: [
          { label: 'View Review', action: 'view', link: '/profile/listings', variant: 'primary' as const }
        ]
      },
      {
        userId,
        type: 'reminder' as const,
        title: '⏰ Booking Reminder',
        message: 'Your booking for "Luxury Car Rental" starts tomorrow at 10:00 AM.',
        link: '/profile/bookings',
        priority: 'urgent' as const,
        data: {
          bookingId: 'booking_456',
          listingTitle: 'Luxury Car Rental',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        actions: [
          { label: 'View Details', action: 'view', link: '/profile/bookings', variant: 'primary' as const },
          { label: 'Contact Owner', action: 'contact', link: '/messages', variant: 'secondary' as const }
        ]
      },
      {
        userId,
        type: 'promotion' as const,
        title: '🎁 Special Offer!',
        message: 'Get 20% off your next booking! Use code SAVE20. Valid until Dec 31, 2024.',
        link: '/listings',
        priority: 'low' as const,
        data: {
          discountCode: 'SAVE20',
          discountPercent: 20,
          validUntil: new Date('2024-12-31')
        },
        actions: [
          { label: 'Browse Listings', action: 'browse', link: '/listings', variant: 'primary' as const }
        ]
      }
    ]

    try {
      for (const notification of sampleNotifications) {
        await this.createNotification(notification)
        // Add small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      console.log('Sample notifications created successfully')
    } catch (error) {
      console.error('Error creating sample notifications:', error)
      throw error
    }
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.subscriptions.forEach((unsubscribe) => {
      unsubscribe()
    })
    this.subscriptions.clear()
  }
}

export const notificationsService = new NotificationsService()
export default notificationsService
