import { clerkClient } from '@clerk/nextjs/server'
import { emailService } from './email-service'

interface UserVerificationStatus {
  userId: string
  email: string
  name: string
  verificationDeadline?: string
  isVerified: boolean
  accountSuspended: boolean
  needsVerification: boolean
}

export class SuspensionChecker {
  /**
   * Check if a user's verification deadline has passed
   */
  static checkDeadline(deadlineISOString: string): {
    passed: boolean
    daysRemaining: number
  } {
    const deadline = new Date(deadlineISOString)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      passed: diffTime < 0,
      daysRemaining: Math.max(0, daysRemaining),
    }
  }

  /**
   * Suspend a user's account
   */
  static async suspendAccount(userId: string, reason: string): Promise<boolean> {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)

      await client.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          accountSuspended: true,
          suspensionReason: reason,
          suspendedAt: new Date().toISOString(),
        },
      })

      // Send suspension email
      await emailService.sendSuspensionNotice(
        user.emailAddresses[0]?.emailAddress || '',
        user.fullName || user.firstName || 'User'
      )

      console.log(`Account suspended: ${userId} - Reason: ${reason}`)
      return true
    } catch (error) {
      console.error(`Error suspending account ${userId}:`, error)
      return false
    }
  }

  /**
   * Send warning email if close to deadline
   */
  static async sendWarningIfNeeded(
    userId: string,
    email: string,
    name: string,
    daysRemaining: number
  ): Promise<boolean> {
    // Send warning at 2 days and 1 day before deadline
    if (daysRemaining === 2 || daysRemaining === 1) {
      console.log(`Sending verification warning to ${email} (${daysRemaining} days remaining)`)
      return await emailService.sendSuspensionWarning(email, name, daysRemaining)
    }
    return false
  }

  /**
   * Check a single user and take action if needed
   */
  static async checkUser(userId: string): Promise<void> {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      
      const metadata = user.publicMetadata as any
      
      // Skip if already suspended or verified
      if (metadata.accountSuspended || metadata.isVerified) {
        return
      }

      // Skip if doesn't need verification
      if (!metadata.needsVerification || !metadata.verificationDeadline) {
        return
      }

      const { passed, daysRemaining } = this.checkDeadline(metadata.verificationDeadline)
      const email = user.emailAddresses[0]?.emailAddress || ''
      const name = user.fullName || user.firstName || 'User'

      // Send warning if approaching deadline
      await this.sendWarningIfNeeded(userId, email, name, daysRemaining)

      // Suspend if deadline passed
      if (passed) {
        await this.suspendAccount(userId, 'verification_expired')
      }
    } catch (error) {
      console.error(`Error checking user ${userId}:`, error)
    }
  }

  /**
   * Check all users who need verification
   * This should be called by a cron job
   */
  static async checkAllUsers(): Promise<{
    checked: number
    warned: number
    suspended: number
  }> {
    const stats = {
      checked: 0,
      warned: 0,
      suspended: 0,
    }

    try {
      const client = await clerkClient()
      
      // Get all users (in production, this should be paginated)
      const { data: users } = await client.users.getUserList({ limit: 500 })

      for (const user of users) {
        const metadata = user.publicMetadata as any
        
        // Only check users who need verification
        if (metadata.needsVerification && !metadata.isVerified && !metadata.accountSuspended) {
          stats.checked++

          if (!metadata.verificationDeadline) continue

          const { passed, daysRemaining } = this.checkDeadline(metadata.verificationDeadline)
          const email = user.emailAddresses[0]?.emailAddress || ''
          const name = user.fullName || user.firstName || 'User'

          // Send warning if needed
          if (daysRemaining <= 2) {
            await this.sendWarningIfNeeded(user.id, email, name, daysRemaining)
            stats.warned++
          }

          // Suspend if deadline passed
          if (passed) {
            await this.suspendAccount(user.id, 'verification_expired')
            stats.suspended++
          }
        }
      }

      console.log('Suspension check complete:', stats)
      return stats
    } catch (error) {
      console.error('Error checking all users:', error)
      return stats
    }
  }
}

