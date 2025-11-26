// User Settings Service - Using localStorage for client-side storage
// For production, this should be replaced with Supabase database calls

export interface UserSettings {
  uid: string
  profile: {
    name: string
    email: string
    phone?: string
    location?: string
    bio?: string
    website?: string
    avatar?: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
    bookingUpdates: boolean
    paymentReminders: boolean
    securityAlerts: boolean
  }
  privacy: {
    profileVisibility: "public" | "private"
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    allowMessages: boolean
    showOnlineStatus: boolean
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange?: Date
    emailVerified: boolean
    mfaMethods: {
      sms: boolean
      authenticator: boolean
      backupCodes: boolean
    }
    phoneNumber?: string
    backupCodes?: string[]
  }
  verification: {
    isVerified: boolean
    emailVerified: boolean
    phoneVerified: boolean
    idVerified: boolean
    governmentIdUrl?: string
    verificationDate?: Date
  }
  updatedAt: Date
}

export const userSettingsService = {
  // Get user settings
  async getUserSettings(uid: string): Promise<UserSettings | null> {
    try {
      if (typeof window === 'undefined') {
        return this.getDefaultSettings(uid)
      }

      const settingsKey = `userSettings_${uid}`
      const settingsJson = localStorage.getItem(settingsKey)
      
      if (settingsJson) {
        return JSON.parse(settingsJson) as UserSettings
      }
      
      // Return default settings if no settings exist
      return this.getDefaultSettings(uid)
    } catch (error) {
      console.error("Error fetching user settings:", error)
      return this.getDefaultSettings(uid)
    }
  },

  // Save user settings
  async saveUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      if (typeof window === 'undefined') return

      const settingsKey = `userSettings_${uid}`
      const existingSettings = await this.getUserSettings(uid)
      
      const updatedSettings = {
        ...existingSettings,
        ...settings,
        uid,
        updatedAt: new Date()
      }
      
      localStorage.setItem(settingsKey, JSON.stringify(updatedSettings))
    } catch (error) {
      console.error("Error saving user settings:", error)
      throw new Error("Failed to save user settings")
    }
  },

  // Get default settings
  getDefaultSettings(uid: string): UserSettings {
    return {
      uid,
      profile: {
        name: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        website: "",
        avatar: ""
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        bookingUpdates: true,
        paymentReminders: true,
        securityAlerts: true
      },
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        showLocation: true,
        allowMessages: true,
        showOnlineStatus: true
      },
      security: {
        twoFactorEnabled: false,
        emailVerified: false,
        mfaMethods: {
          sms: false,
          authenticator: false,
          backupCodes: false
        },
        phoneNumber: undefined,
        backupCodes: []
      },
      verification: {
        isVerified: false,
        emailVerified: false,
        phoneVerified: false,
        idVerified: false,
        governmentIdUrl: undefined,
        verificationDate: undefined
      },
      updatedAt: new Date()
    }
  },

  // Update profile
  async updateProfile(uid: string, profileData: Partial<UserSettings['profile']>): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingProfile = existingSettings?.profile || this.getDefaultSettings(uid).profile
      
      const mergedProfile = {
        ...existingProfile,
        ...profileData
      }
      
      await this.saveUserSettings(uid, {
        profile: mergedProfile
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      throw new Error("Failed to update profile")
    }
  },

  // Update notification settings
  async updateNotificationSettings(uid: string, notificationSettings: Partial<UserSettings['notifications']>): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingNotifications = existingSettings?.notifications || this.getDefaultSettings(uid).notifications
      
      const mergedNotifications = {
        ...existingNotifications,
        ...notificationSettings
      }
      
      await this.saveUserSettings(uid, {
        notifications: mergedNotifications
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      throw new Error("Failed to update notification settings")
    }
  },

  // Update privacy settings
  async updatePrivacySettings(uid: string, privacySettings: Partial<UserSettings['privacy']>): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingPrivacy = existingSettings?.privacy || this.getDefaultSettings(uid).privacy
      
      const mergedPrivacy = {
        ...existingPrivacy,
        ...privacySettings
      }
      
      await this.saveUserSettings(uid, {
        privacy: mergedPrivacy
      })
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      throw new Error("Failed to update privacy settings")
    }
  },

  // Change password (Placeholder - should use Clerk's password change)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    console.warn("Password change should be handled by Clerk")
    throw new Error("Please use Clerk's password change functionality")
  },

  // Send email verification (Placeholder - should use Clerk)
  async sendEmailVerification(): Promise<void> {
    console.warn("Email verification should be handled by Clerk")
    throw new Error("Please use Clerk's email verification functionality")
  },

  // Update two-factor authentication
  async updateTwoFactorAuth(enabled: boolean): Promise<void> {
    console.warn("2FA should be updated via Clerk or the MFA service")
    // For now, we'll just update the local setting
  },

  // Delete user account (Placeholder - should use Clerk)
  async deleteUserAccount(currentPassword: string): Promise<void> {
    console.warn("Account deletion should be handled by Clerk")
    throw new Error("Please contact support to delete your account")
  },

  // Update verification settings
  async updateVerificationSettings(uid: string, verificationSettings: Partial<UserSettings['verification']>): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingVerification = existingSettings?.verification || this.getDefaultSettings(uid).verification
      
      const mergedVerification = {
        ...existingVerification,
        ...verificationSettings
      }

      // Check if user is fully verified
      mergedVerification.isVerified = 
        mergedVerification.emailVerified && 
        mergedVerification.phoneVerified && 
        mergedVerification.idVerified

      if (mergedVerification.isVerified && !existingVerification.isVerified) {
        mergedVerification.verificationDate = new Date()
      }

      await this.saveUserSettings(uid, {
        verification: mergedVerification
      })
    } catch (error) {
      console.error("Error updating verification settings:", error)
      throw new Error("Failed to update verification settings")
    }
  },

  // Update phone number
  async updatePhoneNumber(uid: string, phoneNumber: string): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingProfile = existingSettings?.profile || this.getDefaultSettings(uid).profile
      const existingSecurity = existingSettings?.security || this.getDefaultSettings(uid).security
      
      await this.saveUserSettings(uid, {
        profile: {
          ...existingProfile,
          phone: phoneNumber
        },
        security: {
          ...existingSecurity,
          phoneNumber
        }
      })
    } catch (error) {
      console.error("Error updating phone number:", error)
      throw new Error("Failed to update phone number")
    }
  },

  // Enable MFA method
  async enableMFAMethod(uid: string, method: 'sms' | 'authenticator' | 'backupCodes'): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingSecurity = existingSettings?.security || this.getDefaultSettings(uid).security
      
      await this.saveUserSettings(uid, {
        security: {
          ...existingSecurity,
          mfaMethods: {
            ...existingSecurity.mfaMethods,
            [method]: true
          }
        }
      })
    } catch (error) {
      console.error("Error enabling MFA method:", error)
      throw new Error("Failed to enable MFA method")
    }
  },

  // Disable MFA method
  async disableMFAMethod(uid: string, method: 'sms' | 'authenticator' | 'backupCodes'): Promise<void> {
    try {
      const existingSettings = await this.getUserSettings(uid)
      const existingSecurity = existingSettings?.security || this.getDefaultSettings(uid).security
      
      await this.saveUserSettings(uid, {
        security: {
          ...existingSecurity,
          mfaMethods: {
            ...existingSecurity.mfaMethods,
            [method]: false
          }
        }
      })
    } catch (error) {
      console.error("Error disabling MFA method:", error)
      throw new Error("Failed to disable MFA method")
    }
  },

  // Generate backup codes
  async generateBackupCodes(uid: string): Promise<string[]> {
    try {
      // Generate 10 random backup codes
      const codes = Array.from({ length: 10 }, () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase()
      })

      const existingSettings = await this.getUserSettings(uid)
      const existingSecurity = existingSettings?.security || this.getDefaultSettings(uid).security
      
      await this.saveUserSettings(uid, {
      security: {
          ...existingSecurity,
          backupCodes: codes,
          mfaMethods: {
            ...existingSecurity.mfaMethods,
            backupCodes: true
          }
        }
      })

      return codes
    } catch (error) {
      console.error("Error generating backup codes:", error)
      throw new Error("Failed to generate backup codes")
    }
  },
}
