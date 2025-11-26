import { NextRequest, NextResponse } from 'next/server'
import { interactionsService } from '@/lib/interactions-service'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId, metadata } = await request.json()
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    await interactionsService.trackView(userId, listingId, metadata)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in view API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
