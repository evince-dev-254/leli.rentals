import { NextResponse } from 'next/server'
import { analyticsService } from '@/lib/analytics-service'

export async function GET() {
  try {
    const analytics = await analyticsService.getSiteAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching site analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site analytics' },
      { status: 500 }
    )
  }
}
