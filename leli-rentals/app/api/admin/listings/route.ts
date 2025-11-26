import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addCorsHeaders, createOptionsResponse } from '@/lib/admin-cors'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function OPTIONS(req: NextRequest) {
  return createOptionsResponse(req)
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req)
    if (!authResult.ok) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: authResult.status || 403 }
      )
      return addCorsHeaders(errorResponse, req)
    }

    // Fetch all listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, category, price, status, created_at, updated_at, user_id')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.error('Error fetching listings:', error)
      return NextResponse.json({ listings: [] })
    }

    // Get owner names for each listing
    const listingsWithOwners = await Promise.all(
      (listings || []).map(async (listing) => {
        // Try to get owner name from user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', listing.user_id)
          .single()

        return {
          ...listing,
          owner_name: profile?.name || 'Unknown Owner',
        }
      })
    )

    const response = NextResponse.json({
      success: true,
      listings: listingsWithOwners,
      total: listings?.length || 0
    })
    
    return addCorsHeaders(response, req)
  } catch (error: any) {
    console.error('Error fetching admin listings:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, req)
  }
}

