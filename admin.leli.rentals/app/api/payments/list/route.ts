import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')

        // Fetch from bookings table (payments are tracked there)
        let query = supabaseAdmin
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('payment_status', status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        // Transform bookings to payment format
        const paymentsData = (data || []).map((booking) => ({
            id: booking.id,
            user_id: booking.user_id,
            amount: booking.total_price,
            currency: 'KES',
            payment_method: 'Paystack',
            status: booking.payment_status,
            transaction_id: booking.payment_id,
            description: `Booking for listing ${booking.listing_id.substring(0, 8)}`,
            created_at: booking.created_at
        }))

        return NextResponse.json(paymentsData)
    } catch (error) {
        console.error('Error fetching payments:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch payments', details: errorMessage },
            { status: 500 }
        )
    }
}
