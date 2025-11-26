import { NextResponse } from 'next/server'
import { checkAndExpireTrials } from '@/lib/subscription-utils'

// This endpoint should be called by a cron job or scheduled task
// For example, using Vercel Cron or a simple external pinger
export async function GET(request: Request) {
    try {
        // Verify secret key to prevent unauthorized access
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow local development access without secret
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const expiredCount = await checkAndExpireTrials()

        return NextResponse.json({
            success: true,
            message: `Checked for expired trials`,
            expiredCount
        })
    } catch (error) {
        console.error('Error checking trial expiry:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
