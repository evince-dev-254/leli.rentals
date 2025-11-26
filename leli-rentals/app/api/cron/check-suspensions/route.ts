import { NextRequest, NextResponse } from 'next/server'
import { SuspensionChecker } from '@/lib/suspension-checker'

/**
 * Cron job to check for users needing verification warnings or suspension
 * 
 * In production, set up a Vercel Cron job to call this endpoint daily:
 * 
 * In vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/check-suspensions",
 *       "schedule": "0 9 * * *"
 *     }
 *   ]
 * }
 * 
 * This runs daily at 9:00 AM UTC
 */
export async function GET(req: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has valid authorization
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, validate the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running suspension check cron job...')

    const stats = await SuspensionChecker.checkAllUsers()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      message: `Checked ${stats.checked} users, sent ${stats.warned} warnings, suspended ${stats.suspended} accounts`,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run suspension check',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggering
export async function POST(req: NextRequest) {
  return GET(req)
}

