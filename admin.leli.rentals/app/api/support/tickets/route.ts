import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')

        let query = supabaseAdmin
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        // Fetch user emails for tickets
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map((t: any) => t.user_id))]
            // Fetch auth users (simplified for now, ideally use a better method for bulk fetch)
            const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
                perPage: 1000
            })

            if (!authError && authUsers) {
                data.forEach((ticket: any) => {
                    const user = authUsers.find(u => u.id === ticket.user_id)
                    ticket.user_email = user?.email || 'Unknown'
                })
            }
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching tickets:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch tickets', details: errorMessage },
            { status: 500 }
        )
    }
}
