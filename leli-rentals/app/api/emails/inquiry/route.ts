import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, inquirySubject } = await request.json()

    if (!userEmail || !userName || !inquirySubject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await emailService.sendInquiryResponseEmail(
      userEmail,
      userName,
      inquirySubject
    )

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Inquiry email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

