import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const active = searchParams.get('active')

        let query = supabaseAdmin
            .from('special_offers')
            .select('*, listings(title)')
            .order('created_at', { ascending: false })

        if (active === 'true') {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching special offers:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch special offers', details: errorMessage },
            { status: 500 }
        )
    }
}
