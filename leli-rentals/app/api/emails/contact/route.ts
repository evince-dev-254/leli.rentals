import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, category, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send contact form email
    const result = await emailService.sendContactFormEmail(
      name,
      email,
      subject || 'General Inquiry',
      category || 'general',
      message
    )

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' })
    } else {
      return NextResponse.json({ error: result.error || 'Failed to send message' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

