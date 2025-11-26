import { NextRequest, NextResponse } from 'next/server'
import { couponService } from '@/lib/coupon-service'

// POST - Validate a coupon code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, listingId, bookingAmount } = body

        // Validation
        if (!code || !listingId || !bookingAmount) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Missing required fields: code, listingId, bookingAmount'
                },
                { status: 400 }
            )
        }

        // Validate the coupon
        const result = await couponService.validateCoupon(code, listingId, bookingAmount)

        if (!result.valid) {
            return NextResponse.json(
                { valid: false, error: result.error },
                { status: 200 } // Return 200 with valid: false for invalid codes
            )
        }

        return NextResponse.json({
            valid: true,
            coupon: result.coupon,
            discountAmount: result.discountAmount
        })
    } catch (error) {
        console.error('Error validating coupon:', error)
        return NextResponse.json(
            {
                valid: false,
                error: 'Failed to validate coupon. Please try again.'
            },
            { status: 500 }
        )
    }
}
