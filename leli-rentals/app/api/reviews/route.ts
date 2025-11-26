import { NextRequest, NextResponse } from 'next/server'
import { reviewService } from '@/lib/review-service'

// GET - Fetch reviews for a listing
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const listingId = searchParams.get('listingId')

        if (!listingId) {
            return NextResponse.json(
                { error: 'Listing ID is required' },
                { status: 400 }
            )
        }

        const reviews = await reviewService.getListingReviews(listingId)
        const rating = await reviewService.getListingRating(listingId)

        return NextResponse.json({
            reviews,
            rating
        })
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}

// POST - Create review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Basic validation
        if (!body.booking_id || !body.reviewer_id || !body.listing_id || !body.rating) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const review = await reviewService.createReview(body)
        return NextResponse.json(review)
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create review' },
            { status: 500 }
        )
    }
}
