'use client'

import { useState, useEffect } from 'react'
import { StarRating } from './star-rating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface Review {
    id: string
    rating: number
    comment: string
    created_at: string
    reviewer?: {
        name: string
        avatar: string
    }
}

interface ReviewListProps {
    listingId: string
}

export function ReviewList({ listingId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState({ average: 0, count: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [listingId])

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?listingId=${listingId}`)
            if (!response.ok) throw new Error('Failed to fetch reviews')
            const data = await response.json()
            setReviews(data.reviews)
            setStats(data.rating)
        } catch (error) {
            console.error('Error loading reviews:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="text-center py-8 text-gray-500">Loading reviews...</div>
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{stats.average}</div>
                    <StarRating rating={stats.average} size={24} className="justify-center mt-2" />
                    <div className="text-sm text-gray-500 mt-1">{stats.count} reviews</div>
                </div>
                <div className="flex-1 border-l pl-6">
                    {/* Rating distribution bars could go here */}
                    <p className="text-gray-600">Guest favorite based on {stats.count} reviews</p>
                </div>
            </div>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={review.reviewer?.avatar} />
                                <AvatarFallback>{review.reviewer?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.reviewer?.name || 'Anonymous'}</h4>
                                        <div className="text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} size={16} />
                                </div>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    {review.comment}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
