import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const category = searchParams.get('category')

        let query = supabaseAdmin
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        if (category && category !== 'all') {
            query = query.eq('category', category)
        }

        const { data: listings, error: listingsError } = await query

        if (listingsError) {
            throw listingsError
        }

        if (!listings || listings.length === 0) {
            return NextResponse.json([])
        }

        // Fetch user profiles for these listings
        const userIds = [...new Set(listings.map(l => l.user_id))]
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .in('user_id', userIds)

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
        }

        // Fetch auth users for emails
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000
        })

        if (authError) {
            console.error('Error fetching auth users:', authError)
        }

        // Merge data
        const mergedListings = listings.map(listing => {
            const profile = profiles?.find(p => p.user_id === listing.user_id)
            const authUser = authUsers?.find(u => u.id === listing.user_id)

            return {
                ...listing,
                owner_email: authUser?.email || 'No email',
                owner_phone: profile?.phone || authUser?.phone || 'No phone',
                owner_name: profile?.full_name || 'Unknown' // Assuming full_name exists or we use email
            }
        })

        return NextResponse.json(mergedListings)
    } catch (error) {
        console.error('Error fetching listings:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch listings', details: errorMessage },
            { status: 500 }
        )
    }
}
