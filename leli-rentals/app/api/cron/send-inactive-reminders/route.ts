import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { emailService } from '@/lib/email-service'

/**
 * Cron Job: Send "We Miss You" emails to inactive users
 * Runs weekly to find users who haven't logged in for 30+ days
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Running inactive user reminder cron job...')

    const client = await clerkClient()
    
    // Get all users
    const { data: users } = await client.users.getUserList({ limit: 500 })

    const now = new Date()
    let remindersSent = 0

    for (const user of users) {
      try {
        // Get last sign-in time
        const lastSignInAt = user.lastSignInAt ? new Date(user.lastSignInAt) : new Date(user.createdAt)
        const daysSinceLastLogin = Math.floor(
          (now.getTime() - lastSignInAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Send "we miss you" email at 30, 60, and 90 days of inactivity
        if ([30, 60, 90].includes(daysSinceLastLogin)) {
          const email = user.emailAddresses[0]?.emailAddress
          const name = user.firstName || 'there'

          if (email) {
            await emailService.sendWeMissYouEmail(email, name, daysSinceLastLogin)
            remindersSent++
            console.log(`✅ Sent "we miss you" to ${email} (${daysSinceLastLogin} days inactive)`)
          }
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error)
      }
    }

    console.log(`✅ Sent ${remindersSent} inactive user reminders`)

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

