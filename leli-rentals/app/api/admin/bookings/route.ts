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

    // Fetch all bookings with listing info
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        listing_id,
        user_id,
        status,
        total_price,
        start_date,
        end_date,
        created_at,
        listings!inner(title)
      `)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ bookings: [] })
    }

    // Get customer names for each booking
    const bookingsWithCustomers = await Promise.all(
      (bookings || []).map(async (booking: any) => {
        // Try to get customer name from user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', booking.user_id)
          .single()

        return {
          id: booking.id,
          listing_id: booking.listing_id,
          listing_title: booking.listings?.title || 'Unknown Listing',
          user_id: booking.user_id,
          customer_name: profile?.name || 'Unknown Customer',
          status: booking.status,
          total_price: booking.total_price || 0,
          start_date: booking.start_date,
          end_date: booking.end_date,
          created_at: booking.created_at,
        }
      })
    )

    const response = NextResponse.json({
      success: true,
      bookings: bookingsWithCustomers,
      total: bookings?.length || 0
    })
    
    return addCorsHeaders(response, req)
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, req)
  }
}

