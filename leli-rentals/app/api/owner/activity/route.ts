import { NextRequest, NextResponse } from 'next/server'
import { ownerDashboardService } from '@/lib/owner-dashboard-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    const limit = searchParams.get('limit') || '10'
    
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
    
    const activitiesPromise = ownerDashboardService.getOwnerActivity(ownerId, parseInt(limit))
    
    const activities = await Promise.race([activitiesPromise, timeoutPromise])
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching owner activity:', error)
    
    // Return empty array instead of error
    return NextResponse.json([])
  }
}
