import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { emailService } from '@/lib/email-service'

/**
 * Cron Job: Send account type reminder emails
 * Runs daily to find users who haven't selected account type
 * Send reminders at 2 days and 7 days
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Running account type reminder cron job...')

    const client = await clerkClient()
    
    // Get all users
    const { data: users } = await client.users.getUserList({ limit: 500 })

    const now = new Date()
    let remindersSent = 0

    for (const user of users) {
      try {
        const accountType = user.unsafeMetadata?.accountType
        const createdAt = new Date(user.createdAt)
        const daysSinceCreation = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Skip if user has selected account type
        if (accountType && accountType !== 'not_selected') {
          continue
        }

        // Send reminder at 2 days and 7 days
        if (daysSinceCreation === 2 || daysSinceCreation === 7) {
          const email = user.emailAddresses[0]?.emailAddress
          const name = user.firstName || 'there'

          if (email) {
            await emailService.sendAccountTypeReminderEmail(email, name, daysSinceCreation)
            remindersSent++
            console.log(`✅ Sent reminder to ${email} (${daysSinceCreation} days)`)
          }
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error)
      }
    }

    console.log(`✅ Sent ${remindersSent} account type reminders`)

    return NextResponse.json({
      success: true,
      remindersSent,
      timestamp: now.toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Cron job error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

