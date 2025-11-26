import { NextResponse } from 'next/server'
import { analyticsService } from '@/lib/analytics-service'

export async function GET() {
  try {
    const growth = await analyticsService.getGrowthMetrics()
    return NextResponse.json(growth)
  } catch (error) {
    console.error('Error fetching growth metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch growth metrics' },
      { status: 500 }
    )
  }
}
