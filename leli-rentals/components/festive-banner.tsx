"use client"

import { useState, useEffect } from 'react'
import { X, Gift, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CouponTimer } from '@/components/coupon-timer'

interface FestiveBannerProps {
    title?: string
    description?: string
    couponCode?: string
    discountPercentage?: number
    expiryDate?: string | Date
    onClose?: () => void
}

export function FestiveBanner({
    title = "🎄 Festive Season Mega Sale",
    description = "Celebrate the holidays with up to 30% OFF on selected items!",
    couponCode = "FESTIVE2025",
    discountPercentage = 25,
    expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    onClose
}: FestiveBannerProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    // Check localStorage only after mount to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true)
        const dismissed = localStorage.getItem('festiveBannerDismissed')
        if (dismissed === 'true') {
            setIsVisible(false)
        }
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        if (onClose) onClose()
        localStorage.setItem('festiveBannerDismissed', 'true')
    }

    // Don't render until mounted to prevent hydration mismatch
    if (!isMounted || !isVisible) return null

    return (
        <div className="relative bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white overflow-hidden">
            {/* Animated background sparkles */}
            <div className="absolute inset-0 opacity-20">
                <Sparkles className="absolute top-2 left-10 h-6 w-6 animate-pulse" />
                <Sparkles className="absolute top-4 right-20 h-4 w-4 animate-pulse delay-100" />
                <Sparkles className="absolute bottom-3 left-1/4 h-5 w-5 animate-pulse delay-200" />
                <Sparkles className="absolute bottom-2 right-1/3 h-4 w-4 animate-pulse delay-300" />
            </div>

            <div className="container mx-auto px-4 py-4 relative z-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                            <Gift className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-lg sm:text-xl mb-1">{title}</h3>
                            <p className="text-sm sm:text-base text-white/90">{description}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-xs font-medium">Code:</span>
                                    <code className="font-mono font-bold text-sm">{couponCode}</code>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-xs font-medium">Save:</span>
                                    <span className="font-bold text-sm">{discountPercentage}% OFF</span>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <CouponTimer expiryDate={expiryDate} className="text-white text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
                        onClick={handleClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
