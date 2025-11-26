import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const role = searchParams.get('role')

        console.log('[Users API] Fetching users with role filter:', role)

        // Fetch user profiles - email column now exists in user_profiles table
        let query = supabaseAdmin
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (role && role !== 'all') {
            query = query.eq('role', role)
        }

        console.log('[Users API] Querying user_profiles table...')
        const { data: profiles, error: profilesError } = await query

        if (profilesError) {
            console.error('[Users API] Error fetching profiles:', profilesError)
            throw profilesError
        }

        console.log('[Users API] Found', profiles?.length || 0, 'profiles')

        // Return profiles directly - email is now in the table
        // Map to ensure consistent structure
        const users = profiles.map(profile => ({
            ...profile,
            email: profile.email || 'No email found'
        }))

        console.log('[Users API] Returning', users.length, 'users')
        return NextResponse.json(users)
    } catch (error) {
        console.error('[Users API] Error fetching users:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : String(error),
            hint: error && typeof error === 'object' && 'hint' in error ? error.hint : '',
            code: error && typeof error === 'object' && 'code' in error ? error.code : ''
        })

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorDetails = error instanceof Error ? error.stack : String(error)

        return NextResponse.json(
            {
                error: 'Failed to fetch users',
                message: errorMessage,
                details: errorDetails,
                hint: error && typeof error === 'object' && 'hint' in error ? error.hint : '',
                code: error && typeof error === 'object' && 'code' in error ? error.code : ''
            },
            { status: 500 }
        )
    }
}
