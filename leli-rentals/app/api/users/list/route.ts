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
        const role = searchParams.get('role')

        let query = supabaseAdmin
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (role && role !== 'all') {
            query = query.eq('role', role)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        // Return data in the format expected by the admin dashboard
        return NextResponse.json({
            success: true,
            users: data || [],
            totalCount: data?.length || 0
        })
    } catch (error: any) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users', details: error.message },
            { status: 500 }
        )
    }
}
