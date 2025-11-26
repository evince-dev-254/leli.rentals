import { NextRequest, NextResponse } from 'next/server'
import { ownerDashboardService } from '@/lib/owner-dashboard-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      )
    }
    
    // Add timeout to prevent hanging during build
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    })
    
    const statsPromise = ownerDashboardService.getOwnerStats(ownerId)
    
    const stats = await Promise.race([statsPromise, timeoutPromise])
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching owner stats:', error)
    
    // Return default stats instead of error
    return NextResponse.json({
      totalEarnings: 0,
      totalBookings: 0,
      activeListings: 0,
      rating: 0
    })
  }
}
