import { NextRequest, NextResponse } from 'next/server'
import { specialOffersService } from '@/lib/special-offers-service'

// GET - Fetch special offers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const ownerId = searchParams.get('ownerId')
        const listingId = searchParams.get('listingId')
        const isPublic = searchParams.get('public') === 'true'

        // Get active deals for public display (homepage)
        if (isPublic) {
            const deals = await specialOffersService.getActiveDeals()
            return NextResponse.json(deals)
        }

        // Get offers for a specific listing
        if (listingId) {
            const offers = await specialOffersService.getListingOffers(listingId)
            return NextResponse.json(offers)
        }

        // Get offers for an owner
        if (ownerId) {
            const offers = await specialOffersService.getOwnerOffers(ownerId)
            return NextResponse.json(offers)
        }

        return NextResponse.json(
            { error: 'Missing ownerId, listingId, or public flag' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Error fetching special offers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch special offers' },
            { status: 500 }
        )
    }
}

// POST - Create special offer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Basic validation
        if (!body.owner_id || !body.title || !body.discount_percentage || !body.start_date || !body.end_date) {
            return NextResponse.json(
                { error: 'Missing required fields: owner_id, title, discount_percentage, start_date, end_date' },
                { status: 400 }
            )
        }

        // Validate discount percentage
        if (body.discount_percentage <= 0 || body.discount_percentage > 100) {
            return NextResponse.json(
                { error: 'Discount percentage must be between 1 and 100' },
                { status: 400 }
            )
        }

        // Validate dates
        const startDate = new Date(body.start_date)
        const endDate = new Date(body.end_date)
        if (endDate <= startDate) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            )
        }

        const offer = await specialOffersService.createOffer(body)
        return NextResponse.json(offer, { status: 201 })
    } catch (error) {
        console.error('Error creating special offer:', error)
        return NextResponse.json(
            { error: 'Failed to create special offer' },
            { status: 500 }
        )
    }
}

// PATCH - Update special offer
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Offer ID is required' },
                { status: 400 }
            )
        }

        const body = await request.json()

        // Validate discount percentage if provided
        if (body.discount_percentage !== undefined) {
            if (body.discount_percentage <= 0 || body.discount_percentage > 100) {
                return NextResponse.json(
                    { error: 'Discount percentage must be between 1 and 100' },
                    { status: 400 }
                )
            }
        }

        const offer = await specialOffersService.updateOffer(id, body)
        return NextResponse.json(offer)
    } catch (error) {
        console.error('Error updating special offer:', error)
        return NextResponse.json(
            { error: 'Failed to update special offer' },
            { status: 500 }
        )
    }
}

// DELETE - Deactivate special offer
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Offer ID is required' },
                { status: 400 }
            )
        }

        await specialOffersService.deleteOffer(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting special offer:', error)
        return NextResponse.json(
            { error: 'Failed to delete special offer' },
            { status: 500 }
        )
    }
}
