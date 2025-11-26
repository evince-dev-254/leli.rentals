import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    try {
        // Verify admin token
        const authHeader = req.headers.get('x-admin-token')
        if (authHeader !== process.env.ADMIN_TOKEN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get pagination params
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Fetch users from Supabase
        const { data: users, error, count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching database users:', error)
            return NextResponse.json({
                error: 'Failed to fetch database users',
                details: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            users,
            total: count || 0,
            hasMore: offset + limit < (count || 0)
        })

    } catch (error: any) {
        console.error('Error fetching database users:', error)
        return NextResponse.json({
            error: 'Failed to fetch database users',
            details: error.message
        }, { status: 500 })
    }
}
