"use client"

import { useEffect, useCallback } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { getUserAccountType } from '@/lib/account-type-utils'
import { useToast } from '@/hooks/use-toast'

export function useAccountTypeReminder() {
  const { user } = useAuthContext()
  const { toast } = useToast()

  const checkAndShowReminder = useCallback(() => {
    if (!user) return

    const accountType = getUserAccountType()
    const reminderKey = `accountTypeReminder_lastToast_${user.id}`
    const dismissedKey = `accountTypeReminder_dismissed_${user.id}`
    
    // Don't show if user has account type or has dismissed permanently
    if (accountType || (typeof window !== 'undefined' && localStorage.getItem(dismissedKey) === 'true')) {
      return
    }

    const lastToast = (typeof window !== 'undefined') ? localStorage.getItem(reminderKey) : null
    const now = Date.now()
    const reminderInterval = 2 * 60 * 60 * 1000 // 2 hours

    // Show toast reminder if more than 2 hours since last reminder
    if (!lastToast || (now - parseInt(lastToast)) > reminderInterval) {
      toast({
        title: "🎯 Complete Your Profile",
        description: "Choose your account type to unlock all Leli Rentals features!",
        duration: 5000,
        action: (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(reminderKey, now.toString())
                  window.location.href = '/get-started'
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Choose Now
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(reminderKey, now.toString())
                }
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Later
            </button>
          </div>
        ),
      })

      localStorage.setItem(reminderKey, now.toString())
    }
  }, [user, toast])

  // Check for reminders on mount and periodically
  useEffect(() => {
    if (!user) return

    // Initial check
    checkAndShowReminder()

    // Set up periodic reminder (every 30 minutes)
    const interval = setInterval(checkAndShowReminder, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, checkAndShowReminder])

  // Check when user navigates (for SPA behavior)
  useEffect(() => {
    if (!user) return

    const handleRouteChange = () => {
      // Small delay to ensure route has changed
      setTimeout(checkAndShowReminder, 1000)
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [user, checkAndShowReminder])

  return {
    checkAndShowReminder
  }
}
