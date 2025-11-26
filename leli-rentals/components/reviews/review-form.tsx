'use client'

import { useState } from 'react'
import { StarRating } from './star-rating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ReviewFormProps {
    listingId: string
    bookingId: string
    userId: string
    onSuccess?: () => void
}

export function ReviewForm({ listingId, bookingId, userId, onSuccess }: ReviewFormProps) {
    const { toast } = useToast()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast({
                title: "Error",
                description: "Please select a rating",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listing_id: listingId,
                    booking_id: bookingId,
                    reviewer_id: userId,
                    rating,
                    comment
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to submit review')
            }

            toast({
                title: "Success",
                description: "Review submitted successfully"
            })

            setRating(0)
            setComment('')
            onSuccess?.()
        } catch (error) {
            console.error('Error submitting review:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit review",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold">Write a Review</h3>

            <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating
                    rating={rating}
                    maxRating={5}
                    size={32}
                    interactive
                    onRatingChange={setRating}
                />
                <p className="text-sm text-gray-500">
                    {rating === 0 ? 'Select a rating' : `You rated it ${rating} star${rating > 1 ? 's' : ''}`}
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Your Experience</Label>
                <Textarea
                    id="comment"
                    placeholder="Tell us about your stay..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                />
            </div>

            <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    )
}
