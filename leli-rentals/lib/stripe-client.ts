'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!key) {
      console.error('Stripe publishable key not found. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.')
      console.error('See STRIPE_SETUP_GUIDE.md for setup instructions.')
      return Promise.resolve(null)
    }
    
    stripePromise = loadStripe(key)
  }
  
  return stripePromise
}

// Price IDs for subscription tiers
export const STRIPE_PRICES = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || '',
  professional: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL || '',
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '',
} as const

export type SubscriptionTier = keyof typeof STRIPE_PRICES

// Helper to check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    STRIPE_PRICES.basic &&
    STRIPE_PRICES.professional &&
    STRIPE_PRICES.enterprise
  )
}

