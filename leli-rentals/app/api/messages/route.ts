import { NextRequest, NextResponse } from 'next/server'
import { messagingServiceSupabase } from '@/lib/messaging-service-supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('[messages API] GET request URL:', request.url)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId') || 'user1' // Default for demo

    switch (action) {
      case 'sessions': {
        const sessions = await messagingServiceSupabase.getChatSessions(userId)
        return NextResponse.json({ sessions })
      }

      case 'messages': {
        const sessionId = searchParams.get('sessionId')
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        const messages = await messagingServiceSupabase.getMessages(sessionId)
        return NextResponse.json({ messages })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[messages API] POST request URL:', request.url)
    const body = await request.json()
    console.log('[messages API] POST body:', JSON.stringify(body).slice(0, 1000))
    const { action, userId = 'user1' } = body // Default for demo

    switch (action) {
      case 'send': {
        const { chatSessionId, receiverId, content, type, bookingId, listingId } = body

        if (!chatSessionId || !receiverId || !content) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const messageData = {
          chatSessionId,
          senderId: userId,
          receiverId,
          content,
          type: type || 'text',
          bookingId,
          listingId
        }

        const messageId = await messagingServiceSupabase.sendMessage(messageData)
        return NextResponse.json({ messageId })
      }

      case 'mark-read': {
        const { sessionId } = body

        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        await messagingServiceSupabase.markMessagesAsRead(sessionId, userId)
        return NextResponse.json({ success: true })
      }

      case 'create-session': {
        const { participantId, listingData } = body

        if (!participantId) {
          return NextResponse.json({ error: 'Participant ID required' }, { status: 400 })
        }

        const sessionId = await messagingServiceSupabase.getOrCreateChatSession(
          userId,
          participantId,
          listingData
        )

        return NextResponse.json({ sessionId })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Messages API POST error:', (error as any)?.stack || error)
    // Return error details in development to help debugging (non-sensitive)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}