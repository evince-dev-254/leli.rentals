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

        let query = supabaseAdmin
            .from('user_verifications')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error fetching verifications:', error)
        return NextResponse.json(
            { error: 'Failed to fetch verifications', details: error.message },
            { status: 500 }
        )
    }
}
