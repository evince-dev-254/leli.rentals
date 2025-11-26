"use client"

import { useState, useEffect } from 'react'
import { X, Percent, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CouponTimer } from '@/components/coupon-timer'

interface CouponCardProps {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    description: string
    expiryDate: string | Date
    minPurchase?: number
    onCopy?: () => void
}

export function CouponCard({
    code,
    discountType,
    discountValue,
    description,
    expiryDate,
    minPurchase,
    onCopy
}: CouponCardProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        if (onCopy) onCopy()
        setTimeout(() => setCopied(false), 2000)
    }

    const discountDisplay = discountType === 'percentage'
        ? `${discountValue}% OFF`
        : `KES ${discountValue} OFF`

    return (
        <div className="group relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-[2px] hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 h-full">
                {/* Discount Badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                    {discountDisplay}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center mb-4">
                    <Percent className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {description}
                </h3>

                {/* Min Purchase */}
                {minPurchase && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Minimum purchase: KES {minPurchase}
                    </p>
                )}

                {/* Coupon Code */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Coupon Code</p>
                        <code className="font-mono font-bold text-lg text-purple-600 dark:text-purple-400">
                            {code}
                        </code>
                    </div>
                    <Button
                        onClick={handleCopy}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        size="icon"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Timer */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Valid until:</p>
                    <CouponTimer
                        expiryDate={expiryDate}
                        className="text-sm font-semibold text-orange-600 dark:text-orange-400"
                    />
                </div>
            </div>
        </div>
    )
}
