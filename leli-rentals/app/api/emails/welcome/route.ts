import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName } = await request.json()

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await emailService.sendWelcomeEmail(userEmail, userName)

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      // Log the error but don't fail the request to the client
      // This prevents the UI from showing an error for a non-critical feature
      console.warn('Welcome email could not be sent (non-critical):', result.error)
      return NextResponse.json({
        success: false,
        message: 'Email service not configured or failed, but process continued',
        error: result.error
      }, { status: 200 })
    }
  } catch (error: any) {
    console.error('Welcome email error:', error)
    // Even in case of crash, return 200 to client to avoid blocking flow
    return NextResponse.json({
      success: false,
      message: 'Internal error sending email',
      error: error.message
    }, { status: 200 })
  }
}

