import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Add to newsletter (you can extend emailService to handle newsletter subscriptions)
    const result = await emailService.subscribeToNewsletter(email)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Successfully subscribed to newsletter' })
    } else {
      return NextResponse.json({ error: result.error || 'Failed to subscribe' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

