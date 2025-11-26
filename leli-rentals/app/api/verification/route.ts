import { NextRequest, NextResponse } from 'next/server'
import { onboardingService } from '@/lib/onboarding-service'

// POST - Save verification data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, method, ...verificationData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!method) {
      return NextResponse.json(
        { error: 'Verification method is required' },
        { status: 400 }
      )
    }

    const validMethods = ['phone', 'email', 'id']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid verification method' },
        { status: 400 }
      )
    }

    // Generate verification code for phone/email
    let verificationCode = null
    if (method === 'phone' || method === 'email') {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    }

    const verificationDataToSave = {
      method,
      status: 'pending' as const,
      verificationCode,
      attempts: 0,
      lastAttemptAt: new Date(),
      ...verificationData
    }

    await onboardingService.saveVerificationData(userId, verificationDataToSave)

    // In a real application, you would send the verification code via SMS or email here
    // For now, we'll just return it (remove this in production)
    const response: any = { message: 'Verification data saved successfully' }
    
    if (process.env.NODE_ENV === 'development' && verificationCode) {
      response.verificationCode = verificationCode // Only for development
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error saving verification data:', error)
    return NextResponse.json(
      { error: 'Failed to save verification data' },
      { status: 500 }
    )
  }
}

// PUT - Verify code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    const verificationData = await onboardingService.getVerificationData(userId)
    
    if (!verificationData) {
      return NextResponse.json(
        { error: 'Verification data not found' },
        { status: 404 }
      )
    }

    if (verificationData.status === 'verified') {
      return NextResponse.json(
        { message: 'Already verified', verified: true },
        { status: 200 }
      )
    }

    if (verificationData.attempts >= 3) {
      return NextResponse.json(
        { error: 'Too many verification attempts' },
        { status: 429 }
      )
    }

    // Check if code matches
    const isCodeValid = verificationData.verificationCode === code

    if (isCodeValid) {
      // Update verification status
      await onboardingService.saveVerificationData(userId, {
        status: 'verified',
        verifiedAt: new Date(),
        attempts: verificationData.attempts + 1
      })

      return NextResponse.json(
        { message: 'Verification successful', verified: true },
        { status: 200 }
      )
    } else {
      // Increment attempts
      await onboardingService.saveVerificationData(userId, {
        attempts: verificationData.attempts + 1,
        lastAttemptAt: new Date()
      })

      return NextResponse.json(
        { error: 'Invalid verification code', verified: false },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

// GET - Get verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const verificationData = await onboardingService.getVerificationData(userId)
    
    if (!verificationData) {
      return NextResponse.json(
        { error: 'Verification data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      method: verificationData.method,
      status: verificationData.status,
      attempts: verificationData.attempts,
      verifiedAt: verificationData.verifiedAt
    })
  } catch (error) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}
