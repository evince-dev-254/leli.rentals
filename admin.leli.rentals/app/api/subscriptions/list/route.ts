import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const plan = searchParams.get('plan')
        const status = searchParams.get('status')

        let query = supabaseAdmin
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (plan && plan !== 'all') {
            query = query.eq('subscription_plan', plan)
        }

        if (status && status !== 'all') {
            query = query.eq('subscription_status', status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        // Transform to subscription format expected by frontend
        const subscriptions = (data || []).map((profile) => ({
            id: profile.id,
            user_id: profile.user_id,
            plan: profile.subscription_plan || 'free',
            status: profile.subscription_status || 'active',
            start_date: profile.created_at,
            end_date: null, // You might want to add subscription_end_date to user_profiles if available
            auto_renew: false, // Add this field to DB if needed
            created_at: profile.created_at
        }))

        return NextResponse.json(subscriptions)
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions', details: errorMessage },
            { status: 500 }
        )
    }
}
