"use client"

import { useState, useEffect } from 'react'
import { X, Gift, Sparkles, Tag, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CouponTimer } from '@/components/coupon-timer'

interface SpecialOfferBannerProps {
    title?: string
    description?: string
    couponCode?: string
    discountPercentage?: number
    expiryDate?: string | Date
    imageUrl?: string
    ctaText?: string
    ctaLink?: string
    onClose?: () => void
}

export function SpecialOfferBanner({
    title = "🎉 Special Offer",
    description = "Amazing deals just for you!",
    couponCode,
    discountPercentage = 20,
    expiryDate,
    imageUrl = "/images/offer-banner.jpg",
    ctaText = "Shop Now",
    ctaLink = "/listings",
    onClose
}: SpecialOfferBannerProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const dismissed = localStorage.getItem('specialOfferBannerDismissed')
        if (dismissed === 'true') {
            setIsVisible(false)
        }
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        if (onClose) onClose()
        localStorage.setItem('specialOfferBannerDismissed', 'true')
    }

    if (!isMounted || !isVisible) return null

    return (
        <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                            <Gift className="h-8 w-8 animate-bounce" />
                            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                        </div>

                        <p className="text-lg md:text-xl mb-4 text-white/90">{description}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                            {/* Discount Badge */}
                            <div className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold text-2xl shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                                {discountPercentage}% OFF
                            </div>

                            {/* Coupon Code */}
                            {couponCode && (
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/30">
                                    <Tag className="h-5 w-5" />
                                    <div>
                                        <p className="text-xs opacity-80">Use Code:</p>
                                        <code className="font-mono font-bold text-lg">{couponCode}</code>
                                    </div>
                                </div>
                            )}

                            {/* Timer */}
                            {expiryDate && (
                                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <Timer className="h-5 w-5" />
                                    <div>
                                        <p className="text-xs opacity-80">Ends in:</p>
                                        <CouponTimer expiryDate={expiryDate} className="text-white font-bold" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <a href={ctaLink}>
                            <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                                {ctaText}
                                <Sparkles className="ml-2 h-5 w-5" />
                            </Button>
                        </a>
                    </div>

                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-white hover:bg-white/20"
                        onClick={handleClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
