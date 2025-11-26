'use client'

import { useEffect, useState, useCallback } from 'react'
import { useToast } from './use-toast'

export interface BrowserNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  data?: any
  actions?: NotificationAction[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if browser supports notifications (guard window for SSR)
    const supports = typeof window !== 'undefined' && 'Notification' in window
    setIsSupported(supports)

    if (supports) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      })
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for important updates.",
        })
        return true
      } else if (result === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings to receive updates.",
          variant: "destructive"
        })
        return false
      } else {
        toast({
          title: "Notifications Permission",
          description: "Please allow notifications to receive important updates.",
        })
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive"
      })
      return false
    }
  }, [isSupported, toast])

  const showNotification = useCallback((options: BrowserNotificationOptions): Notification | null => {
    if (!isSupported || permission !== 'granted') {
      return null
    }

    try {
      // Make sure we're in a browser environment
      if (typeof window === 'undefined' || typeof Notification === 'undefined') return null

      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: options.data,
        actions: options.actions
      })

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // Handle click
      notification.onclick = () => {
        try {
          if (typeof window !== 'undefined' && typeof window.focus === 'function') {
            window.focus()
          }
        } catch (e) {
          // ignore
        }
        notification.close()

        // If there's data with a link, navigate to it (guard window)
        if (options.data?.link && typeof window !== 'undefined') {
          window.location.href = options.data.link
        }
      }

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }, [isSupported, permission])

  const showNotificationFromData = useCallback((notificationData: {
    title: string
    message: string
    link?: string
    type: string
    priority?: string
  }) => {
    if (permission !== 'granted') {
      return null
    }

    const iconMap: { [key: string]: string } = {
      booking: '📅',
      payment: '💳',
      listing: '🏠',
      message: '💬',
      system: '🔔',
      review: '⭐',
      reminder: '⏰',
      promotion: '🎁'
    }

    const priorityMap: { [key: string]: boolean } = {
      urgent: true,
      high: true,
      medium: false,
      low: false
    }

    return showNotification({
      title: notificationData.title,
      body: notificationData.message,
      icon: `/icons/${notificationData.type}.png`,
      tag: `notification-${notificationData.type}`,
      requireInteraction: priorityMap[notificationData.priority || 'low'] || false,
      data: {
        link: notificationData.link,
        type: notificationData.type,
        priority: notificationData.priority
      }
    })
  }, [permission, showNotification])

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showNotificationFromData,
    isGranted: permission === 'granted'
  }
}
