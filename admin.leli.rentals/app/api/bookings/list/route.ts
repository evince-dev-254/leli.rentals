import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const paymentStatus = searchParams.get('payment_status')

        let query = supabaseAdmin
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        if (paymentStatus && paymentStatus !== 'all') {
            query = query.eq('payment_status', paymentStatus)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch bookings', details: errorMessage },
            { status: 500 }
        )
    }
}
