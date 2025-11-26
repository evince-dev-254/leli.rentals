import { NextRequest, NextResponse } from 'next/server'
import { interactionsService } from '@/lib/interactions-service'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId, platform, recipient } = await request.json()
    
    if (!listingId || !platform) {
      return NextResponse.json({ error: 'Listing ID and platform are required' }, { status: 400 })
    }

    await interactionsService.trackShare(userId, listingId, platform, recipient)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in share API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
