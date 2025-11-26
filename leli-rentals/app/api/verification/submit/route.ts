import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createTrialSubscription } from '@/lib/subscription-utils'
import { clerkClient } from '@clerk/nextjs/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            userId,
            documentType,
            documentNumber,
            fullName,
            dateOfBirth,
            nationality,
            address,
            phoneNumber,
            documentFrontUrl,
            documentBackUrl,
            selfieUrl
        } = body

        if (!userId || !documentType || !documentNumber || !fullName || !documentFrontUrl || !selfieUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // 1. Insert into user_verifications
        const { data: verification, error: verificationError } = await supabase
            .from('user_verifications')
            .upsert({
                user_id: userId,
                id_type: documentType.toLowerCase().replace(' ', '_'),
                id_number: documentNumber,
                front_image_url: documentFrontUrl,
                back_image_url: documentBackUrl,
                selfie_url: selfieUrl,
                status: 'pending',
                submitted_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single()

        if (verificationError) {
            console.error('Error inserting verification:', verificationError)
            throw verificationError
        }

        // 2. Update user_profiles status
        const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
                verification_status: 'pending',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        if (profileError) {
            console.error('Error updating profile status:', profileError)
            // Don't fail the request if just profile update fails, but log it
        }

        // 3. Create 5-day trial subscription for owner
        const trialSubscription = await createTrialSubscription(userId)

        if (trialSubscription) {
            console.log(`Trial subscription created for user ${userId}:`, trialSubscription)

            // Update Clerk metadata with subscription info
            try {
                const client = await clerkClient()
                await client.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        subscriptionPlan: 'trial',
                        subscriptionStatus: 'active',
                        subscriptionEndsAt: trialSubscription.end_date,
                        trialStartedAt: trialSubscription.start_date,
                    }
                })
            } catch (clerkError) {
                console.error('Error updating Clerk metadata:', clerkError)
                // Don't fail the request, just log
            }
        } else {
            console.warn('Failed to create trial subscription, but continuing...')
        }

        // 4. Create a notification for the user
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'verification',
                title: 'Verification Submitted - Trial Access Granted! 🎉',
                message: 'Your verification is being reviewed. You have 5 days of free access to list and manage items while we verify your account.',
                link: '/verification',
                read: false
            })

        return NextResponse.json({
            success: true,
            verificationId: verification.id,
            trialSubscription: trialSubscription ? {
                planType: trialSubscription.plan_type,
                endsAt: trialSubscription.end_date,
                daysRemaining: 5
            } : null
        })

    } catch (error: any) {
        console.error('Verification submission error:', error)
        return NextResponse.json(
            {
                error: 'Failed to submit verification',
                details: error.message || 'Unknown error',
                stack: error.stack
            },
            { status: 500 }
        )
    }
}

