import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')

        // 1. Fetch verifications
        let query = supabaseAdmin
            .from('user_verifications')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data: verifications, error: verificationsError } = await query

        if (verificationsError) {
            throw verificationsError
        }

        if (!verifications || verifications.length === 0) {
            return NextResponse.json([])
        }

        // 2. Fetch user profiles for these verifications
        const userIds = verifications.map(v => v.user_id)
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .in('user_id', userIds)

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
            // Continue without profiles if error
        }

        // 3. Fetch auth users for emails
        // We can't filter listUsers by ID list easily, so we fetch a page. 
        // For better performance in production, we might need a different approach or individual fetches if list is small.
        // For now, fetching a large page is acceptable for admin dashboard.
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000
        })

        if (authError) {
            console.error('Error fetching auth users:', authError)
        }

        // 4. Merge data
        const mergedVerifications = verifications.map(verification => {
            const profile = profiles?.find(p => p.user_id === verification.user_id)
            const authUser = authUsers?.find(u => u.id === verification.user_id)

            return {
                ...verification,
                user_email: authUser?.email || 'No email',
                user_phone: profile?.phone || authUser?.phone || 'No phone',
                user_location: profile?.location || 'Unknown',
                user_avatar: profile?.avatar_url
            }
        })

        return NextResponse.json(mergedVerifications)
    } catch (error) {
        console.error('Error fetching verifications:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch verifications', details: errorMessage },
            { status: 500 }
        )
    }
}
