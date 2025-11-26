import { NextRequest, NextResponse } from 'next/server'
import { onboardingService } from '@/lib/onboarding-service'

// GET - Get user onboarding data
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

    const onboardingData = await onboardingService.getOnboardingData(userId)
    
    if (!onboardingData) {
      return NextResponse.json(
        { error: 'Onboarding data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(onboardingData)
  } catch (error) {
    console.error('Error fetching onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    )
  }
}

// POST - Save user onboarding data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...onboardingData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields based on step
    const { step } = body
    
    if (step === 1 && !onboardingData.userType) {
      return NextResponse.json(
        { error: 'User type is required' },
        { status: 400 }
      )
    }

    if (step === 2 && (!onboardingData.interests || onboardingData.interests.length === 0)) {
      return NextResponse.json(
        { error: 'At least one interest is required' },
        { status: 400 }
      )
    }

    if (step === 3 && (!onboardingData.location || !onboardingData.phone)) {
      return NextResponse.json(
        { error: 'Location and phone are required' },
        { status: 400 }
      )
    }

    if (step === 4 && !onboardingData.verificationMethod) {
      return NextResponse.json(
        { error: 'Verification method is required' },
        { status: 400 }
      )
    }

    if (step === 5 && !onboardingData.agreedToTerms) {
      return NextResponse.json(
        { error: 'Terms agreement is required' },
        { status: 400 }
      )
    }

    await onboardingService.saveOnboardingData(userId, onboardingData)

    return NextResponse.json(
      { message: 'Onboarding data saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}

// PUT - Complete onboarding
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...finalData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate all required fields for completion
    const requiredFields = ['userType', 'interests', 'location', 'phone', 'verificationMethod', 'agreedToTerms']
    const missingFields = requiredFields.filter(field => !finalData[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    await onboardingService.completeOnboarding(userId, finalData)

    return NextResponse.json(
      { message: 'Onboarding completed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
