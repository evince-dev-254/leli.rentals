import { useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { NotificationService, NotificationType } from '../notification-service'

export function useNotificationTriggers() {
  const { user } = useUser()

  const triggerBookingRequest = useCallback(async (ownerId: string, listingTitle: string) => {
    if (!user) return
    await NotificationService.triggerBookingRequest(ownerId, user.fullName || user.firstName || 'Someone', listingTitle)
  }, [user])

  const triggerBookingConfirmed = useCallback(async (renterId: string, listingTitle: string) => {
    if (!user) return
    await NotificationService.triggerBookingConfirmed(renterId, listingTitle)
  }, [user])

  const triggerBookingCancelled = useCallback(async (renterId: string, listingTitle: string) => {
    if (!user) return
    await NotificationService.triggerBookingCancelled(renterId, listingTitle)
  }, [user])

  const triggerNewReview = useCallback(async (ownerId: string, listingTitle: string, rating: number) => {
    if (!user) return
    await NotificationService.triggerNewReview(ownerId, user.fullName || user.firstName || 'Someone', listingTitle, rating)
  }, [user])

  const triggerMessageReceived = useCallback(async (receiverId: string, listingTitle?: string) => {
    if (!user) return
    await NotificationService.triggerMessageReceived(receiverId, user.fullName || user.firstName || 'Someone', listingTitle)
  }, [user])

  const triggerPaymentReceived = useCallback(async (ownerId: string, amount: number, listingTitle: string) => {
    if (!user) return
    await NotificationService.triggerPaymentReceived(ownerId, amount, listingTitle)
  }, [user])

  const triggerSystemAnnouncement = useCallback(async (userId: string, title: string, message: string) => {
    if (!user) return
    await NotificationService.triggerSystemAnnouncement(userId, title, message)
  }, [user])

  const createCustomNotification = useCallback(async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) => {
    if (!user) return
    const { notificationService } = await import('../notification-service')
    await notificationService.createNotification(userId, type, title, message, link)
  }, [user])

  return {
    triggerBookingRequest,
    triggerBookingConfirmed,
    triggerBookingCancelled,
    triggerNewReview,
    triggerMessageReceived,
    triggerPaymentReceived,
    triggerSystemAnnouncement,
    createCustomNotification
  }
}
