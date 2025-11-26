"use client"

// Firebase removed - all imports removed

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  return false
}

// User onboarding data interface
export interface UserOnboardingData {
  id: string
  userId: string
  userType: 'renter' | 'owner' | 'both'
  interests: string[]
  location: string
  phone: string
  bio?: string
  verificationMethod: 'phone' | 'email' | 'id'
  verificationStatus: 'pending' | 'verified' | 'failed'
  agreedToTerms: boolean
  onboardingCompleted: boolean
  createdAt: any
  updatedAt: any
}

// User preferences interface
export interface UserPreferences {
  id: string
  userId: string
  preferredCategories: string[]
  notificationSettings: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
  }
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showPhone: boolean
  }
  createdAt: any
  updatedAt: any
}

// User verification data interface
export interface UserVerification {
  id: string
  userId: string
  method: 'phone' | 'email' | 'id'
  status: 'pending' | 'verified' | 'failed'
  verificationCode?: string
  verificationToken?: string
  attempts: number
  lastAttemptAt: any
  verifiedAt?: any
  createdAt: any
  updatedAt: any
}

// Onboarding service functions
export const onboardingService = {
  // Save user onboarding data
  async saveOnboardingData(userId: string, data: Partial<UserOnboardingData>): Promise<void> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const onboardingRef = doc(db, 'userOnboarding', userId)
      const onboardingData: Partial<UserOnboardingData> = {
        id: userId,
        userId,
        ...data,
        updatedAt: serverTimestamp()
      }

      // If this is the first time saving, set createdAt
      const existingDoc = await getDoc(onboardingRef)
      if (!existingDoc.exists()) {
        onboardingData.createdAt = serverTimestamp()
      }

      await setDoc(onboardingRef, onboardingData, { merge: true })
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      throw new Error('Failed to save onboarding data')
    }
  },

  // Get user onboarding data
  async getOnboardingData(userId: string): Promise<UserOnboardingData | null> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const onboardingRef = doc(db, 'userOnboarding', userId)
      const docSnap = await getDoc(onboardingRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as UserOnboardingData
      }
      return null
    } catch (error) {
      console.error('Error getting onboarding data:', error)
      throw new Error('Failed to get onboarding data')
    }
  },

  // Complete onboarding process
  async completeOnboarding(userId: string, finalData: Partial<UserOnboardingData>): Promise<void> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const onboardingRef = doc(db, 'userOnboarding', userId)
      await updateDoc(onboardingRef, {
        ...finalData,
        onboardingCompleted: true,
        updatedAt: serverTimestamp()
      })

      // Also update user profile with basic info
      const userProfileRef = doc(db, 'userProfiles', userId)
      await updateDoc(userProfileRef, {
        userType: finalData.userType,
        phoneNumber: finalData.phone,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw new Error('Failed to complete onboarding')
    }
  },

  // Save user preferences
  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const preferencesRef = doc(db, 'userPreferences', userId)
      const preferencesData: Partial<UserPreferences> = {
        id: userId,
        userId,
        ...preferences,
        updatedAt: serverTimestamp()
      }

      const existingDoc = await getDoc(preferencesRef)
      if (!existingDoc.exists()) {
        preferencesData.createdAt = serverTimestamp()
      }

      await setDoc(preferencesRef, preferencesData, { merge: true })
    } catch (error) {
      console.error('Error saving user preferences:', error)
      throw new Error('Failed to save user preferences')
    }
  },

  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const preferencesRef = doc(db, 'userPreferences', userId)
      const docSnap = await getDoc(preferencesRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as UserPreferences
      }
      return null
    } catch (error) {
      console.error('Error getting user preferences:', error)
      throw new Error('Failed to get user preferences')
    }
  },

  // Save verification data
  async saveVerificationData(userId: string, verification: Partial<UserVerification>): Promise<void> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const verificationRef = doc(db, 'userVerifications', userId)
      const verificationData: Partial<UserVerification> = {
        id: userId,
        userId,
        ...verification,
        updatedAt: serverTimestamp()
      }

      const existingDoc = await getDoc(verificationRef)
      if (!existingDoc.exists()) {
        verificationData.createdAt = serverTimestamp()
      }

      await setDoc(verificationRef, verificationData, { merge: true })
    } catch (error) {
      console.error('Error saving verification data:', error)
      throw new Error('Failed to save verification data')
    }
  },

  // Get verification data
  async getVerificationData(userId: string): Promise<UserVerification | null> {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized')
    }

    try {
      const verificationRef = doc(db, 'userVerifications', userId)
      const docSnap = await getDoc(verificationRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as UserVerification
      }
      return null
    } catch (error) {
      console.error('Error getting verification data:', error)
      throw new Error('Failed to get verification data')
    }
  },

  // Check if user has completed onboarding
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const onboardingData = await this.getOnboardingData(userId)
      return onboardingData?.onboardingCompleted || false
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

      if (onboardingData.onboardingCompleted) {
        return {
          completed: true,
          currentStep: 5,
          totalSteps: 5,
          progress: 100
        }
      }

      // Calculate progress based on completed fields
      let completedSteps = 0
      if (onboardingData.userType) completedSteps++
      if (onboardingData.interests && onboardingData.interests.length > 0) completedSteps++
      if (onboardingData.location && onboardingData.phone) completedSteps++
      if (onboardingData.verificationMethod) completedSteps++
      if (onboardingData.agreedToTerms) completedSteps++

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
