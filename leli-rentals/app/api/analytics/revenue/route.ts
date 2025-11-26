import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/analytics-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'
    
    const revenue = await analyticsService.getRevenueAnalytics(period as 'daily' | 'weekly' | 'monthly')
    return NextResponse.json(revenue)
  } catch (error) {
    console.error('Error fetching revenue analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}
