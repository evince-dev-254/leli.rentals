'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Notification, NotificationContextType } from './types/notification'
import { notificationsServiceRealtime, Notification as SupabaseNotification } from './notifications-service-realtime'
import { useBrowserNotifications } from '../hooks/use-browser-notifications'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [lastNotificationCount, setLastNotificationCount] = useState(0)
  const { showNotificationFromData, requestPermission, isGranted } = useBrowserNotifications()

  // Subscribe to real-time notifications when user is authenticated
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)

    // Fetch initial notifications
    const loadInitialNotifications = async () => {
      try {
        const userNotifications = await notificationsServiceRealtime.getNotifications(user.id, 50)
        const convertedNotifications: Notification[] = userNotifications.map(serviceNotif => ({
          id: serviceNotif.id,
          userId: serviceNotif.user_id,
          type: serviceNotif.type as any,
          title: serviceNotif.title,
          message: serviceNotif.message || '',
          link: serviceNotif.link || undefined,
          isRead: serviceNotif.read,
          createdAt: new Date(serviceNotif.created_at),
          updatedAt: new Date(serviceNotif.created_at)
        }))
        setNotifications(convertedNotifications)
        
        // Calculate unread count
        const unread = convertedNotifications.filter(n => !n.isRead).length
        setUnreadCount(unread)
        setLastNotificationCount(convertedNotifications.length)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading initial notifications:', error)
        setIsLoading(false)
      }
    }

    loadInitialNotifications()

    // Set up real-time subscription for new notifications
    const channel = notificationsServiceRealtime.subscribeToNotifications(
      user.id,
      (newNotification) => {
        const convertedNotification: Notification = {
          id: newNotification.id,
          userId: newNotification.user_id,
          type: newNotification.type as any,
          title: newNotification.title,
          message: newNotification.message || '',
          link: newNotification.link || undefined,
          isRead: newNotification.read,
          createdAt: new Date(newNotification.created_at),
          updatedAt: new Date(newNotification.created_at)
        }

        // Add new notification to the beginning of the list
        setNotifications(prev => [convertedNotification, ...prev])
        
        // Update unread count
        if (!convertedNotification.isRead) {
          setUnreadCount(prev => prev + 1)
        }

        // Show browser notification if granted
        if (isGranted) {
          showNotificationFromData({
            title: convertedNotification.title,
            message: convertedNotification.message,
            link: convertedNotification.link,
            type: convertedNotification.type,
            priority: (convertedNotification as any).priority
          })
        }
      }
    )

    // Cleanup subscription on unmount or user change
    return () => {
      notificationsServiceRealtime.unsubscribe(channel)
    }
  }, [user, isGranted, showNotificationFromData])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsServiceRealtime.markAsRead(notificationId)
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return
    
    try {
      await notificationsServiceRealtime.markAllAsRead(user.id)
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsServiceRealtime.deleteNotification(notificationId)
      // Update local state immediately
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [notifications])

  const refreshNotifications = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      console.log('Loading notifications for user:', user.id)
      const userNotifications = await notificationsServiceRealtime.getNotifications(user.id, 50)
      console.log('Raw notifications from Supabase:', userNotifications)
      
      // Convert Supabase notification to app Notification type
      const convertedNotifications: Notification[] = userNotifications.map(serviceNotif => ({
        id: serviceNotif.id,
        userId: serviceNotif.user_id,
        type: serviceNotif.type as any,
        title: serviceNotif.title,
        message: serviceNotif.message || '',
        link: serviceNotif.link || undefined,
        isRead: serviceNotif.read,
        createdAt: new Date(serviceNotif.created_at),
        updatedAt: new Date(serviceNotif.created_at)
      }))
      console.log('Converted notifications:', convertedNotifications)
      setNotifications(convertedNotifications)
      
      const count = await notificationsServiceRealtime.getUnreadCount(user.id)
      console.log('Unread count:', count)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return
    
    try {
      // For client-side notification creation, we'll just log it
      // In production, this should go through an API endpoint
      console.log('Client-side notification creation (should use API):', notificationData)
      // Notification will be automatically added via real-time subscription
      // when created server-side
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }, [user])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    addNotification,
    requestPermission,
    isGranted
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
