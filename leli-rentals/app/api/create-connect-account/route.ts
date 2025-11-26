import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createConnectAccount, createAccountLink, stripe } from '@/lib/stripe-server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe not configured',
        setupGuide: 'See STRIPE_SETUP_GUIDE.md for instructions'
      }, { status: 500 })
    }

    const body = await req.json()
    const { email, country = 'US' } = body as {
      email: string
      country?: string
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create Stripe Connect account
    const account = await createConnectAccount(email, country, {
      userId,
    })

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      account.id,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/owner/setup-complete`,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/owner/setup`
    )

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    })
  } catch (error) {
    console.error('Error creating Connect account:', error)
    return NextResponse.json(
      { error: 'Failed to create Connect account' },
      { status: 500 }
    )
  }
}

