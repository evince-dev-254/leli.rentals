import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, payment } = await request.json()

    if (!userEmail || !userName || !payment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await emailService.sendPaymentReceiptEmail(
      userEmail,
      userName,
      payment
    )

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Payment email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

