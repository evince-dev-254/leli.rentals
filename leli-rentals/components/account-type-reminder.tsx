"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, User, Building2, ArrowRight, Clock, Star } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { getUserAccountType, setUserAccountType } from "@/lib/account-type-utils"
import { useToast } from "@/hooks/use-toast"

interface AccountTypeReminderProps {
  variant?: 'banner' | 'modal' | 'toast'
  onDismiss?: () => void
}

export function AccountTypeReminder({ variant = 'banner', onDismiss }: AccountTypeReminderProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [lastReminderTime, setLastReminderTime] = useState<number | null>(null)
  const [hasVerificationBanner, setHasVerificationBanner] = useState(false)

  // Check if user needs account type selection
  useEffect(() => {
    if (!user || !isLoaded) return

    // Check Clerk metadata first - most reliable
    const clerkAccountType = (user.publicMetadata?.accountType as string) || 
                            (user.unsafeMetadata?.accountType as string)
    
    // Also check localStorage as fallback
    const localStorageAccountType = getUserAccountType()
    
    // Check if user skipped account type selection
    const skipped = user.unsafeMetadata?.skippedAccountType as boolean
    
    const dismissedKey = `accountTypeReminder_dismissed_${user.id}`
    const lastReminderKey = `accountTypeReminder_last_${user.id || 'unknown'}`
    
    // Check if user has dismissed the reminder permanently
    const dismissed = localStorage.getItem(dismissedKey)
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Only show if user skipped account type selection (not_selected) or has no account type
    // Explicitly check that account type is NOT 'renter' or 'owner'
    const hasValidAccountType = clerkAccountType === 'renter' || clerkAccountType === 'owner' || 
                                localStorageAccountType === 'renter' || localStorageAccountType === 'owner'
    
    const needsSelection = !hasValidAccountType && (
                          !clerkAccountType || 
                          clerkAccountType === 'not_selected' || 
                          skipped ||
                          (!clerkAccountType && !localStorageAccountType)
                        )
    
    if (needsSelection) {
      const lastReminder = localStorage.getItem(lastReminderKey)
      const now = Date.now()
      const reminderInterval = 24 * 60 * 60 * 1000 // 24 hours
      
      // Show reminder if:
      // 1. Never shown before
      // 2. More than 24 hours since last reminder
      if (!lastReminder || (now - parseInt(lastReminder)) > reminderInterval) {
        setIsVisible(true)
        setLastReminderTime(parseInt(lastReminder || '0') || 0)
      }
    }
  }, [user, isLoaded])

  // Check if verification banner exists to position account type reminder below it
  useEffect(() => {
    if (variant === 'banner' && typeof window !== 'undefined') {
      const checkBanner = () => {
        const banner = document.querySelector('[data-verification-banner]')
        setHasVerificationBanner(!!banner)
      }
      checkBanner()
      const interval = setInterval(checkBanner, 100)
      return () => clearInterval(interval)
    }
  }, [variant])

  const handleSelectAccountType = (accountType: 'renter' | 'owner') => {
    setUserAccountType(accountType)
    setIsVisible(false)
    
    toast({
      title: "🎉 Account type selected!",
      description: `Welcome as a ${accountType}! Let's get you started.`,
      duration: 3000,
    })

    // Redirect based on account type
    if (accountType === 'renter') {
      router.push('/listings')
    } else {
      router.push('/dashboard/owner')
    }
  }

  const handleDismiss = (permanent = false) => {
    setIsVisible(false)
    
    if (permanent && user?.uid) {
      const dismissedKey = `accountTypeReminder_dismissed_${user.id}`
      localStorage.setItem(dismissedKey, 'true')
      setIsDismissed(true)
    }

    // Update last reminder time
    if (user?.uid) {
      const lastReminderKey = `accountTypeReminder_last_${user.id}`
      localStorage.setItem(lastReminderKey, Date.now().toString())
    }

    onDismiss?.()
  }

  const handleGoToSelection = () => {
    setIsVisible(false)
    router.push('/get-started')
  }

  // Don't show if user has account type or has dismissed permanently
  if (!isVisible || isDismissed || !user) {
    return null
  }

  const accountTypes = [
    {
      id: 'renter',
      title: 'I want to rent items',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      description: 'Find amazing rentals for your needs'
    },
    {
      id: 'owner',
      title: 'I want to list items',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      description: 'Earn money by renting your belongings'
    }
  ]

  if (variant === 'banner') {
    return (
      <div 
        className="fixed left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
        style={{ top: hasVerificationBanner ? '48px' : '0' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="font-semibold">Choose Account Type</span>
              </div>
              <span className="text-sm opacity-90">
                Select your account type to access all services
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToSelection}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Choose Now
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(false)}
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

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 mb-4">
                Choose your account type to personalize your Leli Rentals experience
              </p>
              <Badge variant="secondary" className="mb-4">
                <Clock className="h-3 w-3 mr-1" />
                Takes less than 1 minute
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {accountTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card
                    key={type.id}
                    className="cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleSelectAccountType(type.id as 'renter' | 'owner')}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleDismiss(false)}
                className="px-6"
              >
                Remind me later
              </Button>
              <Button
                onClick={handleGoToSelection}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Choose Account Type
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default AccountTypeReminder

