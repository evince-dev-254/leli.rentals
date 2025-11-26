"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Shield } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export function VerificationReminderBanner() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return

    // Only show for owner accounts
    const accountType = (user.publicMetadata?.accountType as string) || 
                       (user.unsafeMetadata?.accountType as string)
    
    if (accountType !== 'owner') {
      return
    }

    // Check verification status
    const verificationStatus = user.unsafeMetadata?.verificationStatus as string
    
    // Only show if not verified and not pending
    if (verificationStatus === 'approved' || verificationStatus === 'pending') {
      return
    }

    // Check if user dismissed the banner
    const dismissedKey = `verificationReminder_dismissed_${user.id}`
    const dismissed = localStorage.getItem(dismissedKey)
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Calculate days remaining
    const verificationDeadline = user.unsafeMetadata?.verificationDeadline as string
    if (verificationDeadline) {
      const deadline = new Date(verificationDeadline)
      const now = new Date()
      const diffTime = deadline.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 5 && diffDays >= 0) {
        setDaysRemaining(diffDays)
        setIsVisible(true)
      } else if (diffDays < 0) {
        // Deadline passed - urgent warning
        setDaysRemaining(0)
        setIsVisible(true)
      }
    } else {
      // No deadline set - show warning anyway for unverified owners
      setIsVisible(true)
    }
  }, [user, isLoaded])

  const handleDismiss = () => {
    setIsVisible(false)
    if (user?.id) {
      const dismissedKey = `verificationReminder_dismissed_${user.id}`
      localStorage.setItem(dismissedKey, 'true')
      setIsDismissed(true)
    }
  }

  const handleVerifyNow = () => {
    router.push('/verification')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  const isUrgent = daysRemaining !== null && daysRemaining <= 1

  return (
    <div 
      data-verification-banner
      className={`fixed top-0 left-0 right-0 z-50 ${
        isUrgent 
          ? 'bg-gradient-to-r from-red-600 to-red-700' 
          : 'bg-gradient-to-r from-orange-600 to-orange-700'
      } text-white shadow-lg`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Verification Required</span>
              <span className="text-sm opacity-90 ml-2">
                {daysRemaining === null 
                  ? 'You must verify your identity within 5 days or your account will be suspended.'
                  : daysRemaining === 0
                  ? '⚠️ Your account will be suspended if verification is not completed immediately!'
                  : daysRemaining === 1
                  ? `⚠️ Final day! Verify today or your account will be suspended tomorrow.`
                  : `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} to verify or your account will be suspended.`
                }
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyNow}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Shield className="h-4 w-4 mr-1" />
              Verify Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

