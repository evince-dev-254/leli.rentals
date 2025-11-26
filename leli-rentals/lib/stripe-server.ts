import Stripe from 'stripe'

// Initialize Stripe with secret key
const getStripeInstance = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  
  if (!secretKey) {
    console.error('Stripe secret key not found. Please add STRIPE_SECRET_KEY to your .env.local file.')
    return null
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
  })
}

export const stripe = getStripeInstance()

// Helper function to create a customer
export async function createStripeCustomer(email: string, name: string, userId: string) {
  if (!stripe) throw new Error('Stripe not configured')
  
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })
}

// Helper function to create a subscription
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
) {
  if (!stripe) throw new Error('Stripe not configured')
  
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata,
  })
}

// Helper function to create a Stripe Connect account for owners
export async function createConnectAccount(
  email: string,
  country: string = 'US',
  metadata: Record<string, string> = {}
) {
  if (!stripe) throw new Error('Stripe not configured')
  
  return await stripe.accounts.create({
    type: 'express',
    email,
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata,
  })
}

// Helper function to create an account link for Connect onboarding
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  if (!stripe) throw new Error('Stripe not configured')
  
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
}

// Helper function to cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured')
  
  return await stripe.subscriptions.cancel(subscriptionId)
}

// Helper function to update subscription
export async function updateSubscription(subscriptionId: string, priceId: string) {
  if (!stripe) throw new Error('Stripe not configured')
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: priceId,
    }],
    proration_behavior: 'create_prorations',
  })
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event | null {
  if (!stripe) return null
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret not found')
    return null
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return null
  }
}

