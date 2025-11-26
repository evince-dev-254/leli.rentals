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

    // Fetch all stats in parallel
    const [
      usersResult,
      listingsResult,
      bookingsResult,
      revenueResult,
      verificationsResult
    ] = await Promise.all([
      // Total users count
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      
      // Listings stats
      supabase.from('listings').select('id, status, category, price, created_at', { count: 'exact' }),
      
      // Bookings stats
      supabase.from('bookings').select('id, status, total_price, created_at', { count: 'exact' }),
      
      // Revenue from bookings
      supabase.from('bookings')
        .select('total_price')
        .eq('payment_status', 'paid'),
      
      // Verification status from user metadata (we'll need to check Clerk for this)
      Promise.resolve({ data: [], count: 0 })
    ])

    const totalUsers = usersResult.count || 0
    const listings = listingsResult.data || []
    const bookings = bookingsResult.data || []
    const paidBookings = revenueResult.data || []

    // Calculate listings stats
    const publishedListings = listings.filter((l: any) => l.status === 'published').length
    const draftListings = listings.filter((l: any) => l.status === 'draft').length
    const archivedListings = listings.filter((l: any) => l.status === 'archived').length

    // Calculate bookings stats
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length
    const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed').length
    const completedBookings = bookings.filter((b: any) => b.status === 'completed').length

    // Calculate revenue
    const totalRevenue = paidBookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
    const monthlyRevenue = paidBookings
      .filter((b: any) => {
        if (!b.created_at) return false
        const bookingDate = new Date(b.created_at)
        const now = new Date()
        return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
    
    const weeklyRevenue = paidBookings
      .filter((b: any) => {
        if (!b.created_at) return false
        const bookingDate = new Date(b.created_at)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return bookingDate >= weekAgo
      })
      .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

    // Category breakdown
    const categoryCounts: Record<string, number> = {}
    listings.forEach((l: any) => {
      if (l.category) {
        categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1
      }
    })

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentListings = listings.filter((l: any) => 
      l.created_at && new Date(l.created_at) >= thirtyDaysAgo
    ).length

    const recentBookings = bookings.filter((b: any) =>
      b.created_at && new Date(b.created_at) >= thirtyDaysAgo
    ).length

    // Get user account types from user_profiles (if available)
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('account_type, verification_status')

    const owners = userProfiles?.filter((p: any) => p.account_type === 'owner').length || 0
    const renters = userProfiles?.filter((p: any) => p.account_type === 'renter').length || 0
    const verified = userProfiles?.filter((p: any) => p.verification_status === 'approved').length || 0
    const pendingVerification = userProfiles?.filter((p: any) => p.verification_status === 'pending').length || 0

    const response = NextResponse.json({
      users: {
        total: totalUsers,
        newToday: 0, // Would need to query by date
        activeLast30Days: 0, // Would need activity tracking
        owners,
        renters,
        verified,
        pendingVerification,
      },
      listings: {
        total: listings.length,
        published: publishedListings,
        draft: draftListings,
        archived: archivedListings,
        categories: categoryCounts,
        recent: recentListings,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: bookings.filter((b: any) => b.status === 'cancelled').length,
        recent: recentBookings,
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        weekly: weeklyRevenue,
        averageBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      },
      growth: {
        usersGrowth: 0, // Would need historical data
        listingsGrowth: 0,
        bookingsGrowth: 0,
        revenueGrowth: 0,
      }
    })
    
    return addCorsHeaders(response, req)
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, req)
  }
}

