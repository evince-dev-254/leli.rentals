import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/analytics-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'
    
    const listings = await analyticsService.getTopListings(parseInt(limit))
    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching top listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top listings' },
      { status: 500 }
    )
  }
}
