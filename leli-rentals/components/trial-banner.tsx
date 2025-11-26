"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { X, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

interface TrialBannerProps {
    className?: string
}

export function TrialBanner({ className = "" }: TrialBannerProps) {
    const { user, isLoaded } = useUser()
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        if (!isLoaded || !user) return

        // Check if user is on trial
        const subscriptionPlan = user.unsafeMetadata?.subscriptionPlan as string
        const subscriptionEndsAt = user.unsafeMetadata?.subscriptionEndsAt as string

        if (subscriptionPlan === 'trial' && subscriptionEndsAt) {
            // Calculate days remaining
            const now = new Date()
            const endDate = new Date(subscriptionEndsAt)
            const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            setDaysRemaining(Math.max(0, days))

            // Check if banner was dismissed in this session
            const dismissedKey = `trial_banner_dismissed_${user.id}`
            const wasDismissed = sessionStorage.getItem(dismissedKey)
            if (wasDismissed) {
                setIsDismissed(true)
                setIsVisible(false)
            }
        } else {
            setIsVisible(false)
        }
    }, [isLoaded, user])

    const handleDismiss = () => {
        if (user) {
            const dismissedKey = `trial_banner_dismissed_${user.id}`
            sessionStorage.setItem(dismissedKey, 'true')
            setIsDismissed(true)
            setIsVisible(false)
        }
    }

    if (!isVisible || daysRemaining === null || isDismissed) {
        return null
    }

    // Different colors based on days remaining
    const getBannerStyles = () => {
        if (daysRemaining <= 1) {
            return {
                bg: "bg-gradient-to-r from-red-500 to-orange-500",
                text: "text-white",
                icon: "text-white",
            }
        } else if (daysRemaining <= 2) {
            return {
                bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
                text: "text-white",
                icon: "text-white",
            }
        } else {
            return {
                bg: "bg-gradient-to-r from-blue-500 to-purple-500",
                text: "text-white",
                icon: "text-white",
            }
        }
    }

    const styles = getBannerStyles()

    return (
        <div className={`${styles.bg} ${className}`}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <Sparkles className={`h-5 w-5 ${styles.icon} flex-shrink-0`} />
                        <div className="flex-1">
                            <p className={`font-semibold ${styles.text}`}>
                                🎉 Trial Active: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                            </p>
                            <p className={`text-sm ${styles.text} opacity-90`}>
                                {daysRemaining <= 1
                                    ? "Your trial expires soon! Upgrade now to keep full access."
                                    : "You're currently on a free trial. Upgrade anytime to continue after it expires."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="bg-white hover:bg-gray-100 text-gray-900 font-semibold shadow-md"
                        >
                            <Link href="/profile/billing">
                                <Clock className="h-4 w-4 mr-2" />
                                Upgrade Now
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className={`${styles.text} hover:bg-white/20`}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
