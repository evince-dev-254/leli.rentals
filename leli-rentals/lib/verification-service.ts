import { userSettingsService } from "./user-settings-service"

export class VerificationService {
  /**
   * Check if a user is fully verified
   */
  async isUserVerified(userId: string): Promise<boolean> {
    try {
      const settings = await userSettingsService.getUserSettings(userId)
      return settings?.verification?.isVerified || false
    } catch (error) {
      console.error("Error checking user verification:", error)
      return false
    }
  }

  /**
   * Get user's verification status details
   */
  async getVerificationStatus(userId: string): Promise<{
    isVerified: boolean
    emailVerified: boolean
    phoneVerified: boolean
    idVerified: boolean
    verificationDate?: Date
  }> {
    try {
      const settings = await userSettingsService.getUserSettings(userId)
      const verification = settings?.verification

      return {
        isVerified: verification?.isVerified || false,
        emailVerified: verification?.emailVerified || false,
        phoneVerified: verification?.phoneVerified || false,
        idVerified: verification?.idVerified || false,
        verificationDate: verification?.verificationDate
      }
    } catch (error) {
      console.error("Error getting verification status:", error)
      return {
        isVerified: false,
        emailVerified: false,
        phoneVerified: false,
        idVerified: false
      }
    }
  }

  /**
   * Check if user has priority booking access
   * Verified users get priority in booking queues
   */
  async hasPriorityBookingAccess(userId: string): Promise<boolean> {
    return this.isUserVerified(userId)
  }

  /**
   * Check if user has access to premium features
   */
  async hasPremiumFeaturesAccess(userId: string): Promise<boolean> {
    return this.isUserVerified(userId)
  }

  /**
   * Get booking priority level for user
   * Returns 1 for verified users (higher priority), 0 for unverified
   */
  async getBookingPriority(userId: string): Promise<number> {
    const isVerified = await this.isUserVerified(userId)
    return isVerified ? 1 : 0
  }

  /**
   * Apply verification-based benefits to booking logic
   * This could be used when processing booking requests
   */
  async applyVerificationBenefits(userId: string, bookingData: any): Promise<any> {
    const isVerified = await this.isUserVerified(userId)

    if (isVerified) {
      // Verified users get:
      // - Priority processing
      // - Lower cancellation fees
      // - Access to premium listings
      return {
        ...bookingData,
        priority: true,
        premiumAccess: true,
        reducedCancellationFee: true,
        verifiedUser: true
      }
    }

    return {
      ...bookingData,
      priority: false,
      premiumAccess: false,
      reducedCancellationFee: false,
      verifiedUser: false
    }
  }
}

export const verificationService = new VerificationService()