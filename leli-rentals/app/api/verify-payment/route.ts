import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { reference, planId, billingCycle, userId } = await req.json()

    if (!reference || !planId || !billingCycle || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      )
    }

    // Verify payment with Paystack API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status && data.data && data.data.status === 'success') {
      const amount = data.data.amount / 100 // Convert from kobo to currency unit
      const currency = data.data.currency

      // 1. Save Payment Record
      const { data: paymentData, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: userId,
          amount: amount,
          currency: currency,
          status: 'success',
          provider: 'paystack',
          reference: reference,
          metadata: data.data.metadata || {}
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Error saving payment:', paymentError)
        throw new Error('Failed to save payment record')
      }

      // 2. Create/Update Subscription
      const now = new Date()
      const endDate = new Date(now)

      if (billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }

      // Cancel any existing active subscriptions
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')

      // Create new subscription
      const { data: subData, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: planId,
          status: 'active',
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: true,
          payment_id: paymentData.id
        })
        .select()
        .single()

      if (subError) {
        console.error('Error creating subscription:', subError)
        throw new Error('Failed to create subscription record')
      }

      // 3. Update User Profile
      await supabaseAdmin
        .from('user_profiles')
        .update({
          subscription_plan: planId,
          subscription_status: 'active'
        })
        .eq('user_id', userId)

      // 4. Link Payment to Subscription
      await supabaseAdmin
        .from('payments')
        .update({ subscription_id: subData.id })
        .eq('id', paymentData.id)

      return NextResponse.json({
        success: true,
        verified: true,
        subscription: subData,
        payment: paymentData
      })
    }

    return NextResponse.json({
      success: false,
      verified: false,
      message: 'Payment verification failed or payment was not successful'
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
