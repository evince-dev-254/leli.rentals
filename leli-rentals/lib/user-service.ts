"use client"

// Firebase removed - all imports removed
import { User } from './auth'

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  return false
}

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  phoneNumber?: string
  profilePictureUrl?: string
  userType: 'renter' | 'owner' | 'both'
  createdAt: any
  updatedAt: any
  isEmailVerified: boolean
  provider: 'email' | 'google'
}

// Convert Firebase User to UserProfile
export function firebaseUserToUserProfile(firebaseUser: any): UserProfile {
  const nameParts = firebaseUser.displayName?.split(' ') || []
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    firstName,
    lastName,
    displayName: firebaseUser.displayName,
    phoneNumber: firebaseUser.phoneNumber,
    profilePictureUrl: firebaseUser.photoURL,
    userType: 'renter', // Default to renter
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isEmailVerified: firebaseUser.emailVerified,
    provider: firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email'
  }
}

// User database service
export const userService = {
  // Create or update user profile in Firestore
  async saveUserProfile(userProfile: Partial<UserProfile>): Promise<void> {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized, skipping user profile save')
      return
    }
    
    try {
      const userRef = doc(db, 'users', userProfile.id!)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          ...userProfile,
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new user
        await setDoc(userRef, {
          ...userProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error saving user profile:', error)
      throw new Error('Failed to save user profile')
    }
  },

  // Get user profile from Firestore
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isFirebaseInitialized()) {
      return null
    }
    
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw new Error('Failed to get user profile')
    }
  },

  // Check if user exists by email
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    if (!isFirebaseInitialized()) {
      return null
    }
    
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        return userDoc.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw new Error('Failed to get user by email')
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized, skipping user profile update')
      return
    }
    
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error('Failed to update user profile')
    }
  }
}
