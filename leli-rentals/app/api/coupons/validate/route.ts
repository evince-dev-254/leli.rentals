import { NextRequest, NextResponse } from 'next/server'
import { couponService } from '@/lib/coupon-service'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, listingId, bookingAmount } = body

        if (!code || !listingId || bookingAmount === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: code, listingId, bookingAmount' },
                { status: 400 }
            )
        }

        const result = await couponService.validateCoupon(code, listingId, bookingAmount)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error validating coupon:', error)
        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        )
    }
}
