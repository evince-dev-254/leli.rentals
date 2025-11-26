import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, status, rejectionReason } = await request.json()

    if (!userEmail || !userName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['submitted', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: submitted, approved, or rejected' },
        { status: 400 }
      )
    }

    const result = await emailService.sendVerificationConfirmationEmail(
      userEmail,
      userName,
      status,
      rejectionReason
    )

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Verification email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

