import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, ticket } = await request.json()

    if (!userEmail || !userName || !ticket) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await emailService.sendSupportTicketEmail(
      userEmail,
      userName,
      ticket
    )

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Support email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

