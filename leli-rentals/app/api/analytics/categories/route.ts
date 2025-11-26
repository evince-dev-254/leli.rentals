import { NextResponse } from 'next/server'
import { analyticsService } from '@/lib/analytics-service'

export async function GET() {
  try {
    const categories = await analyticsService.getCategoryAnalytics()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching category analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category analytics' },
      { status: 500 }
    )
  }
}
