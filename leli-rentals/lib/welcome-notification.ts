'use client'

import { notificationsService } from './notifications-service'

export async function createWelcomeNotification(userId: string, userName: string, accountType: 'renter' | 'owner') {
  try {
    // Create welcome notification
    await notificationsService.createNotification({
      userId,
      type: 'system',
      title: `Welcome to Leli Rentals, ${userName}! 🎉`,
      message: accountType === 'owner'
        ? 'Get started by setting up your owner profile and creating your first listing!'
        : 'Start exploring amazing rentals and book your first stay with exclusive trial benefits!',
      priority: 'high',
      data: {
        accountType,
        isWelcome: true,
      },
      link: accountType === 'owner' ? '/dashboard/owner/setup' : '/listings',
    })
    
    console.log('Welcome notification created for user:', userId)
  } catch (error) {
    console.error('Error creating welcome notification:', error)
  }
}

export async function createBookingNotification(userId: string, bookingDetails: any) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'booking',
      title: 'New Booking Request',
      message: `You have a new booking request for ${bookingDetails.propertyName}`,
      priority: 'high',
      data: bookingDetails,
      link: `/bookings/${bookingDetails.id}`,
      actions: [
        { label: 'View Details', action: 'view', link: `/bookings/${bookingDetails.id}` },
        { label: 'Accept', action: 'accept', variant: 'primary' },
        { label: 'Decline', action: 'decline', variant: 'destructive' },
      ]
    })
  } catch (error) {
    console.error('Error creating booking notification:', error)
  }
}

export async function createFavoriteNotification(userId: string, propertyName: string) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'listing',
      title: 'Added to Favorites',
      message: `${propertyName} has been added to your favorites`,
      priority: 'low',
      link: '/profile/favorites',
    })
  } catch (error) {
    console.error('Error creating favorite notification:', error)
  }
}

export async function createPriceDropNotification(userId: string, propertyName: string, oldPrice: number, newPrice: number) {
  try {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
    
    await notificationsService.createNotification({
      userId,
      type: 'promotion',
      title: `Price Drop Alert! ${discount}% Off`,
      message: `${propertyName} is now $${newPrice}/night (was $${oldPrice}/night)`,
      priority: 'medium',
      data: { oldPrice, newPrice, discount },
      link: `/listings/details/${propertyName}`,
      actions: [
        { label: 'Book Now', action: 'book', variant: 'primary' },
      ]
    })
  } catch (error) {
    console.error('Error creating price drop notification:', error)
  }
}

export async function createVerificationReminderNotification(userId: string, daysRemaining: number) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'reminder',
      title: daysRemaining <= 2 ? '⚠️ Urgent: Verify Your Account' : 'Verification Reminder',
      message: `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left to verify your account to avoid suspension.`,
      priority: daysRemaining <= 2 ? 'urgent' : 'high',
      link: '/dashboard/owner/verification',
      actions: [
        { label: 'Verify Now', action: 'verify', variant: 'primary', link: '/dashboard/owner/verification' },
      ]
    })
  } catch (error) {
    console.error('Error creating verification reminder:', error)
  }
}

export async function createListingPublishedNotification(userId: string, listingTitle: string, listingId: string) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'listing',
      title: 'Listing Published! 🎊',
      message: `Your listing "${listingTitle}" is now live and visible to renters`,
      priority: 'medium',
      data: { listingId },
      link: `/listings/details/${listingId}`,
      actions: [
        { label: 'View Listing', action: 'view', variant: 'primary', link: `/listings/details/${listingId}` },
      ]
    })
  } catch (error) {
    console.error('Error creating listing published notification:', error)
  }
}

export async function createPaymentReceivedNotification(userId: string, amount: number, bookingId: string) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'payment',
      title: 'Payment Received',
      message: `You've received a payment of $${amount.toFixed(2)}`,
      priority: 'high',
      data: { amount, bookingId },
      link: `/profile/billing`,
    })
  } catch (error) {
    console.error('Error creating payment notification:', error)
  }
}

export async function createReviewReceivedNotification(userId: string, rating: number, reviewerName: string) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'review',
      title: 'New Review Received',
      message: `${reviewerName} left you a ${rating}-star review`,
      priority: 'medium',
      data: { rating, reviewerName },
      link: '/profile',
    })
  } catch (error) {
    console.error('Error creating review notification:', error)
  }
}

export async function createMessageNotification(userId: string, senderName: string, preview: string) {
  try {
    await notificationsService.createNotification({
      userId,
      type: 'message',
      title: `New message from ${senderName}`,
      message: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
      priority: 'medium',
      link: '/messages',
    })
  } catch (error) {
    console.error('Error creating message notification:', error)
  }
}

