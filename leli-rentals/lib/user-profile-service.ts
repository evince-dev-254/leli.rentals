import { supabase } from './supabase'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  website?: string
  account_type?: 'renter' | 'owner'
  subscription_status?: 'free' | 'basic' | 'premium' | 'enterprise'
  is_verified?: boolean
  verification_status?: 'unverified' | 'pending' | 'approved' | 'rejected'
  updated_at?: string
}

export interface UpdateProfileResult {
  success: boolean
  error?: string
  url?: string
}

export class UserProfileService {
  private static instance: UserProfileService

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService()
    }
    return UserProfileService.instance
  }

  /**
   * Update user profile image using Cloudinary URL
   */
  async updateProfileImage(userId: string, file: File): Promise<UpdateProfileResult> {
    try {
      // Use Cloudinary widget or direct upload
      // For now, we'll use Clerk's avatar which is already handled
      // This is a placeholder for custom avatar uploads

      console.log('Profile image update - using Clerk avatar instead')

      return {
        success: true,
        error: 'Please use Clerk to update your profile photo. Click "Open Advanced Avatar Manager" above.'
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      }
    }
  }

  /**
   * Update user profile information in Supabase
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UpdateProfileResult> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        }
      }

      // Use user_id (Clerk ID) as the identifier for upsert
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Error updating profile:', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        details: error instanceof Error ? error.stack : undefined
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      }
    }
  }

  /**
   * Get user profile from Supabase
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!userId) {
        console.warn('getUserProfile called with empty userId')
        return null
      }

      // Try querying by user_id first (Clerk ID), then by id (UUID)
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      // If not found by user_id, try by id
      if (error && error.code === 'PGRST116') {
        const { data: dataById, error: errorById } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!errorById) {
          data = dataById
          error = null
        } else {
          // Profile doesn't exist - this is fine
          return null
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user profile:', {
          code: error.code,
          message: error.message,
          userId
        })
        throw error
      }

      return data || null
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'PGRST116') {
        console.error('Error getting user profile:', {
          error: error instanceof Error ? error.message : String(error),
          userId
        })
      }
      return null
    }
  }

  /**
   * Get public user profile (for other users to view)
   */
  async getPublicProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!userId) {
        console.warn('getPublicProfile called with empty userId')
        return null
      }

      // Try querying by user_id first (Clerk ID), then by id (UUID)
      let { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_id, name, avatar, bio, location, account_type, subscription_status, is_verified, phone, email, avatar_url')
        .eq('user_id', userId)
        .single()

      // If not found by user_id, try by id
      if (error && error.code === 'PGRST116') {
        const { data: dataById, error: errorById } = await supabase
          .from('user_profiles')
          .select('id, user_id, name, avatar, bio, location, account_type, subscription_status, is_verified, phone, email, avatar_url')
          .eq('id', userId)
          .single()

        if (!errorById) {
          data = dataById
          error = null
        }
      }

      // PGRST116 is "not found" - this is acceptable, return null
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet - this is fine
          return null
        }
        // For other errors, log more details
        console.error('Error getting public profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId
        })
        throw error
      }

      return data || null
    } catch (error) {
      // Only log if it's not a "not found" error
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'PGRST116') {
        console.error('Error getting public profile:', {
          error: error instanceof Error ? error.message : String(error),
          userId,
          stack: error instanceof Error ? error.stack : undefined
        })
      }
      return null
    }
  }

  /**
   * Delete user profile image
   */
  async deleteProfileImage(userId: string, currentAvatarUrl?: string): Promise<UpdateProfileResult> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          avatar: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Error deleting profile image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }
}

// Export singleton instance
export const userProfileService = UserProfileService.getInstance()
