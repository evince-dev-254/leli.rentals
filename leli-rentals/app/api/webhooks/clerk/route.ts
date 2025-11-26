import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET

// Initialize Supabase with service role for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.warn('CLERK_WEBHOOK_SECRET is not set. Skipping webhook verification.')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Error occurred -- verification failed' },
      { status: 400 }
    )
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const userEmail = email_addresses?.[0]?.email_address
    const userName = first_name || 'there'

    try {
      const client = await clerkClient()

      // Set initial metadata
      await client.users.updateUserMetadata(id, {
        unsafeMetadata: {
          accountType: 'not_selected',
          needsAccountTypeSelection: true,
          createdAt: new Date().toISOString(),
        }
      })

      // Create user profile in Supabase (only insert columns that exist)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: id,
          email: userEmail,
          avatar_url: evt.data.image_url,
          account_type: null, // Will be set when user selects their account type
          role: 'user',
          verification_status: 'unverified',
          subscription_plan: 'free',
          subscription_status: 'active',
        })

      if (profileError) {
        console.error('❌ Error creating user profile:', profileError)

        // Log failure to webhook_failures table
        await supabase.from('webhook_failures').insert({
          webhook_type: 'user.created',
          user_id: id,
          event_data: evt.data,
          error_message: profileError.message || 'Failed to create user profile',
          error_stack: profileError.details || JSON.stringify(profileError),
          retry_count: 0
        })

        // Still return success to Clerk to avoid retries
        return NextResponse.json({
          received: true,
          warning: 'User profile creation failed but logged for retry'
        })
      } else {
        console.log('✅ User profile created in database for user:', id)
      }

      // Send welcome notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: id,
          type: 'system',
          title: `Welcome to Leli Rentals, ${userName}! 🎉`,
          message: `We're excited to have you here! Start exploring thousands of rentals or list your own items to earn money. Need help? Our support team is always here for you.`,
          link: '/get-started',
          read: false,
        })

      if (notifError) {
        console.error('Error creating welcome notification:', notifError)
      } else {
        console.log('✅ Welcome notification created')
      }

      // Send welcome email
      if (userEmail) {
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail,
              userName
            })
          })

          if (emailResponse.ok) {
            console.log('✅ Welcome email sent to:', userEmail)
          } else {
            console.error('Failed to send welcome email:', await emailResponse.text())
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError)
        }
      }

      console.log(`✅ User ${id} created - account type selection required`)
    } catch (error: any) {
      console.error('❌ Critical error in user creation webhook:', error)

      // Log critical failure
      try {
        await supabase.from('webhook_failures').insert({
          webhook_type: 'user.created',
          user_id: id,
          event_data: evt.data,
          error_message: error.message || 'Unknown error in webhook handler',
          error_stack: error.stack || JSON.stringify(error),
          retry_count: 0
        })
      } catch (logError) {
        console.error('❌ Failed to log webhook failure:', logError)
      }

      // Return success to prevent Clerk from retrying
      return NextResponse.json({
        received: true,
        error: 'Webhook processing failed but logged for manual review'
      })
    }
  } else if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data
    const userEmail = email_addresses?.[0]?.email_address
    const accountType = unsafe_metadata?.accountType

    try {
      const updates: any = {
        email: userEmail,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      }

      // Only update account_type if it's present in metadata and valid
      if (accountType === 'renter' || accountType === 'owner') {
        updates.account_type = accountType
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', id)

      if (error) {
        console.error('Error updating user profile:', error)
      } else {
        console.log('✅ User profile updated in database for user:', id)
      }
    } catch (error) {
      console.error('Error in user update webhook:', error)
    }
  }

  return NextResponse.json({ received: true })
}

