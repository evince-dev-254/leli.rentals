import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createStripeCustomer, createSubscription, stripe } from '@/lib/stripe-server'
import { STRIPE_PRICES } from '@/lib/stripe-client'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe not configured. Please add your Stripe keys to .env.local',
        setupGuide: 'See STRIPE_SETUP_GUIDE.md for instructions'
      }, { status: 500 })
    }

    const body = await req.json()
    const { packageId, email, name } = body as {
      packageId: 'basic' | 'professional' | 'enterprise'
      email: string
      name: string
    }

    if (!packageId || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const priceId = STRIPE_PRICES[packageId]
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 })
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    })

    let customerId: string

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      // Create new customer
      const customer = await createStripeCustomer(email, name, userId)
      customerId = customer.id
    }

    // Create subscription
    const subscription = await createSubscription(customerId, priceId, {
      userId,
      packageId,
    })

    // Extract payment intent client secret
    const latestInvoice = subscription.latest_invoice as any
    const paymentIntent = latestInvoice?.payment_intent

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      customerId,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

