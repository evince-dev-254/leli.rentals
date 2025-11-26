import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with Service Role Key to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        // Check for admin internal token from proxy
        const adminToken = request.headers.get('x-admin-token')
        if (adminToken !== process.env.ADMIN_INTERNAL_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

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
        const paymentsData = (data || []).map((booking: any) => ({
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
    } catch (error: any) {
        console.error('Error fetching payments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payments', details: error.message },
            { status: 500 }
        )
    }
}
