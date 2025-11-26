import { NextRequest, NextResponse } from 'next/server'
import { couponService } from '@/lib/coupon-service'

// GET - Fetch coupons
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const ownerId = searchParams.get('ownerId')
        const isPublic = searchParams.get('public') === 'true'

        if (isPublic) {
            const deals = await couponService.getActiveDeals()
            return NextResponse.json(deals)
        }

        if (ownerId) {
            const coupons = await couponService.getOwnerCoupons(ownerId)
            return NextResponse.json(coupons)
        }

        return NextResponse.json(
            { error: 'Missing ownerId or public flag' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Error fetching coupons:', error)
        return NextResponse.json(
            { error: 'Failed to fetch coupons' },
            { status: 500 }
        )
    }
}

// POST - Create coupon
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Basic validation
        if (!body.code || !body.discount_value || !body.owner_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const coupon = await couponService.createCoupon(body)
        return NextResponse.json(coupon)
    } catch (error) {
        console.error('Error creating coupon:', error)
        return NextResponse.json(
            { error: 'Failed to create coupon' },
            { status: 500 }
        )
    }
}

// DELETE - Deactivate coupon
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Coupon ID is required' },
                { status: 400 }
            )
        }

        await couponService.deleteCoupon(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting coupon:', error)
        return NextResponse.json(
            { error: 'Failed to delete coupon' },
            { status: 500 }
        )
    }
}
