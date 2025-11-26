"use client"

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { getUserAccountType } from '@/lib/account-type-utils'

export function useAccountTypeModal() {
  const { user } = useAuthContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTrigger, setModalTrigger] = useState<'page-visit' | 'manual' | 'periodic'>('manual')

  const checkAndShowModal = (trigger: 'page-visit' | 'manual' | 'periodic' = 'manual') => {
    if (!user) return

    const accountType = getUserAccountType()
    const dismissedKey = `accountTypeModal_dismissed_${user.id}`
    const lastShownKey = `accountTypeModal_lastShown_${user.id}`
    const skipKey = `accountTypeReminder_skipped_${user.id}`
    
    // Don't show if user has account type
    if (accountType) {
      setIsModalOpen(false)
      return
    }

    // Check if user has permanently dismissed the modal
    if (localStorage.getItem(dismissedKey) === 'true') {
      setIsModalOpen(false)
      return
    }

    const now = Date.now()
    const lastShown = localStorage.getItem(lastShownKey)
    const skipTime = localStorage.getItem(skipKey)
    
    // Different intervals for different triggers
    let interval = 0
    switch (trigger) {
      case 'page-visit':
        interval = 24 * 60 * 60 * 1000 // 24 hours
        break
      case 'periodic':
        interval = 4 * 60 * 60 * 1000 // 4 hours
        break
      case 'manual':
        interval = 0 // Show immediately
        break
    }

    // Show modal if:
    // 1. Manual trigger (always show)
    // 2. Never shown before
    // 3. More than interval time since last shown
    // 4. User skipped but more than 2 hours ago
    const shouldShow = trigger === 'manual' || 
      !lastShown || 
      (now - parseInt(lastShown)) > interval ||
      (skipTime && (now - parseInt(skipTime)) > 2 * 60 * 60 * 1000)

    if (shouldShow) {
      setModalTrigger(trigger)
      setIsModalOpen(true)
      localStorage.setItem(lastShownKey, now.toString())
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const dismissModal = (permanent = false) => {
    setIsModalOpen(false)
    
    if (permanent && user) {
      const dismissedKey = `accountTypeModal_dismissed_${user.id}`
      localStorage.setItem(dismissedKey, 'true')
    }
  }

  // Check on mount for page-visit trigger
  useEffect(() => {
    if (user) {
      // Small delay to ensure page has loaded
      const timer = setTimeout(() => {
        checkAndShowModal('page-visit')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [user])

  // Periodic check (every 30 minutes)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      checkAndShowModal('periodic')
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  return {
    isModalOpen,
    modalTrigger,
    checkAndShowModal,
    closeModal,
    dismissModal
  }
}
