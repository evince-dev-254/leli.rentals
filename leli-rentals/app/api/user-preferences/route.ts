import { NextRequest, NextResponse } from 'next/server'
import { onboardingService } from '@/lib/onboarding-service'

// GET - Get user preferences
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

    const preferences = await onboardingService.getUserPreferences(userId)
    
    if (!preferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    )
  }
}

// POST - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...preferences } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate preferences structure
    if (preferences.preferredCategories && !Array.isArray(preferences.preferredCategories)) {
      return NextResponse.json(
        { error: 'Preferred categories must be an array' },
        { status: 400 }
      )
    }

    if (preferences.notificationSettings) {
      const notificationFields = ['email', 'sms', 'push', 'marketing']
      const invalidFields = Object.keys(preferences.notificationSettings).filter(
        field => !notificationFields.includes(field)
      )
      
      if (invalidFields.length > 0) {
        return NextResponse.json(
          { error: `Invalid notification settings: ${invalidFields.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (preferences.privacySettings) {
      const validVisibility = ['public', 'private', 'friends']
      if (preferences.privacySettings.profileVisibility && 
          !validVisibility.includes(preferences.privacySettings.profileVisibility)) {
        return NextResponse.json(
          { error: 'Invalid profile visibility setting' },
          { status: 400 }
        )
      }
    }

    await onboardingService.saveUserPreferences(userId, preferences)

    return NextResponse.json(
      { message: 'User preferences saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save user preferences' },
      { status: 500 }
    )
  }
}
