import { supabase } from './supabase'

export interface Review {
    id: string
    booking_id: string
    reviewer_id: string
    listing_id: string
    rating: number
    comment: string
    created_at: string
    reviewer?: {
        name: string
        avatar: string
    }
}

export interface CreateReviewDTO {
    booking_id: string
    reviewer_id: string
    listing_id: string
    rating: number
    comment: string
}

export class ReviewService {
    /**
     * Create a new review
     */
    async createReview(review: CreateReviewDTO) {
        // 1. Check if review already exists for this booking
        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('booking_id', review.booking_id)
            .single()

        if (existing) {
            throw new Error('Review already exists for this booking')
        }

        // 2. Create review
        const { data, error } = await supabase
            .from('reviews')
            .insert(review)
            .select()
            .single()

        if (error) throw error
        return data
    }

    /**
     * Get reviews for a listing
     */
    async getListingReviews(listingId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, reviewer:user_profiles(name, avatar)')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    /**
     * Get average rating for a listing
     */
    async getListingRating(listingId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('listing_id', listingId)

        if (error) throw error

        if (!data || data.length === 0) return { average: 0, count: 0 }

        const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
        const average = sum / data.length

        return {
            average: parseFloat(average.toFixed(1)),
            count: data.length
        }
    }

    /**
     * Delete review (admin or owner of review)
     */
    async deleteReview(reviewId: string) {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)

        if (error) throw error
    }
}

export const reviewService = new ReviewService()
