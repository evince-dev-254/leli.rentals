import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// User onboarding data interface
export interface UserOnboardingData {
  id: string
  user_id: string
  user_type: 'renter' | 'owner' | 'both'
  interests: string[]
  location: string
  phone: string
  bio?: string
  verification_method: 'phone' | 'email' | 'id'
  verification_status: 'pending' | 'verified' | 'failed'
  agreed_to_terms: boolean
  onboarding_completed: boolean
  created_at?: string
  updated_at?: string
}

// User preferences interface
export interface UserPreferences {
  id: string
  user_id: string
  preferred_categories: string[]
  notification_settings: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
  }
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'friends'
    show_email: boolean
    show_phone: boolean
  }
  created_at?: string
  updated_at?: string
}

// Onboarding service functions
export const onboardingService = {
  // Save user onboarding data
  async saveOnboardingData(userId: string, data: Partial<UserOnboardingData>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Supabase error saving onboarding data:', error)
        throw new Error('Failed to save onboarding data')
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      throw new Error('Failed to save onboarding data')
    }
  },

  // Get user onboarding data
  async getOnboardingData(userId: string): Promise<UserOnboardingData | null> {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, user hasn't started onboarding yet
          return null
        }
        console.error('Supabase error getting onboarding data:', error)
        throw new Error('Failed to get onboarding data')
      }

      return data as UserOnboardingData
    } catch (error) {
      console.error('Error getting onboarding data:', error)
      return null
    }
  },

  // Complete onboarding process
  async completeOnboarding(userId: string, finalData: Partial<UserOnboardingData>): Promise<void> {
    try {
      // Update onboarding data
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          ...finalData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (onboardingError) {
        console.error('Error updating onboarding:', onboardingError)
        throw new Error('Failed to complete onboarding')
      }

      // Update user profile with account type
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          account_type: finalData.user_type,
          phone_number: finalData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (profileError) {
        console.error('Error updating user profile:', profileError)
        // Don't throw here, onboarding is still complete
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw new Error('Failed to complete onboarding')
    }
  },

  // Save user preferences
  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving user preferences:', error)
        throw new Error('Failed to save user preferences')
      }
    } catch (error) {
      console.error('Error saving user preferences:', error)
      throw new Error('Failed to save user preferences')
    }
  },

  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error getting user preferences:', error)
        throw new Error('Failed to get user preferences')
      }

      return data as UserPreferences
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  },

  // Check if user has completed onboarding
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const onboardingData = await this.getOnboardingData(userId)
      return onboardingData?.onboarding_completed || false
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      return false
    }
  },

  // Get onboarding progress
  async getOnboardingProgress(userId: string): Promise<{
    completed: boolean
    currentStep: number
    totalSteps: number
    progress: number
  }> {
    try {
      const onboardingData = await this.getOnboardingData(userId)

      if (!onboardingData) {
        return {
          completed: false,
          currentStep: 1,
          totalSteps: 5,
          progress: 0
        }
      }

      if (onboardingData.onboarding_completed) {
        return {
          completed: true,
          currentStep: 5,
          totalSteps: 5,
          progress: 100
        }
      }

      // Calculate progress based on completed fields
      let completedSteps = 0
      if (onboardingData.user_type) completedSteps++
      if (onboardingData.interests && onboardingData.interests.length > 0) completedSteps++
      if (onboardingData.location && onboardingData.phone) completedSteps++
      if (onboardingData.verification_method) completedSteps++
      if (onboardingData.agreed_to_terms) completedSteps++

      return {
        completed: false,
        currentStep: completedSteps + 1,
        totalSteps: 5,
        progress: (completedSteps / 5) * 100
      }
    } catch (error) {
      console.error('Error getting onboarding progress:', error)
      return {
        completed: false,
        currentStep: 1,
        totalSteps: 5,
        progress: 0
      }
    }
  }
}

export default onboardingService
