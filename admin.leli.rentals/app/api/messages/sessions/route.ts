import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')

        let query = supabaseAdmin
            .from('chat_sessions')
            .select('*')
            .order('updated_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching chat sessions:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch chat sessions', details: errorMessage },
            { status: 500 }
        )
    }
}
