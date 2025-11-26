import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tag, Percent, Clock } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface SpecialOfferBadgeProps {
    discountPercentage: number
    title?: string
    endDate?: string
    variant?: 'compact' | 'full' | 'banner'
    className?: string
}

export function SpecialOfferBadge({
    discountPercentage,
    title,
    endDate,
    variant = 'compact',
    className = ''
}: SpecialOfferBadgeProps) {
    const daysLeft = endDate ? differenceInDays(new Date(endDate), new Date()) : null

    if (variant === 'compact') {
        return (
            <Badge
                className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 ${className}`}
            >
                <Tag className="h-3 w-3 mr-1" />
                {discountPercentage}% OFF
            </Badge>
        )
    }

    if (variant === 'full') {
        return (
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg ${className}`}>
                <Tag className="h-4 w-4" />
                <div>
                    <div className="font-semibold">{discountPercentage}% OFF</div>
                    {title && <div className="text-xs opacity-90">{title}</div>}
                </div>
                {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                    <div className="ml-2 flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />
                        {daysLeft}d left
                    </div>
                )}
            </div>
        )
    }

    // Banner variant for detail pages
    return (
        <div className={`bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-4 rounded-lg ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Tag className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{discountPercentage}% OFF</div>
                        {title && <div className="text-sm opacity-90 mt-1">{title}</div>}
                    </div>
                </div>
                {endDate && (
                    <div className="text-right">
                        <div className="text-xs opacity-75">Valid until</div>
                        <div className="font-semibold">{format(new Date(endDate), 'MMM d, yyyy')}</div>
                        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded inline-flex">
                                <Clock className="h-3 w-3" />
                                Only {daysLeft} days left!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

interface SpecialOfferData {
    discount_percentage: number
    title?: string
    end_date?: string
}

export interface SpecialOfferDisplayProps {
    offer: SpecialOfferData | null
    variant?: 'compact' | 'full' | 'banner'
    className?: string
}

export function SpecialOfferDisplay({ offer, variant = 'compact', className }: SpecialOfferDisplayProps) {
    if (!offer) return null

    return (
        <SpecialOfferBadge
            discountPercentage={offer.discount_percentage}
            title={offer.title}
            endDate={offer.end_date}
            variant={variant}
            className={className}
        />
    )
}
