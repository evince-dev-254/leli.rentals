import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'
import { expireSubscription } from '@/lib/subscription-utils'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role Key to bypass RLS
)

export async function POST(request: NextRequest) {
    // CORS preflight handling
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://admin.leli.rentals' : '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
        })
    }
    try {
        const { userId, verificationId, action, rejectionReason, adminEmail } = await request.json()

        if (!userId || !verificationId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // 1. Update verification status in Supabase
        const updateData: any = {
            status: action === 'approve' ? 'approved' : 'rejected',
            verified_at: new Date().toISOString()
        }

        if (action === 'reject' && rejectionReason) {
            updateData.rejection_reason = rejectionReason
        }

        const { error: verifyError } = await supabase
            .from('user_verifications')
            .update(updateData)
            .eq('id', verificationId)

        if (verifyError) {
            console.error('Error updating verification:', verifyError)
            throw new Error('Failed to update verification status')
        }

        // 2. Update user profile verification status
        const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
                verification_status: action === 'approve' ? 'approved' : 'rejected'
            })
            .eq('user_id', userId)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            // Don't throw - profile might not exist yet
        }

        // 3. Handle trial subscription based on action
        if (action === 'reject') {
            // If verification is rejected, immediately expire the trial subscription
            const trialExpired = await expireSubscription(userId)
            if (trialExpired) {
                console.log(`Trial subscription expired for rejected user ${userId}`)
            }
        }
        // Note: On approval, trial remains active until its natural 5-day expiry
        // Users will need to choose a paid plan before trial ends

        // 4. Update Clerk user metadata
        try {
            const client = await clerkClient()
            const metadataUpdate: any = {
                publicMetadata: {
                    verificationStatus: action === 'approve' ? 'approved' : 'rejected',
                    verificationCompletedAt: new Date().toISOString()
                }
            }

            // If rejected, also update subscription status in metadata
            if (action === 'reject') {
                metadataUpdate.publicMetadata.subscriptionStatus = 'expired'
                metadataUpdate.publicMetadata.subscriptionPlan = null
            }

            await client.users.updateUserMetadata(userId, metadataUpdate)
        } catch (clerkError) {
            console.error('Error updating Clerk metadata:', clerkError)
            // Continue even if Clerk update fails
        }

        // 5. Get user email for notifications
        let userEmail = ''
        let userName = 'User'

        try {
            const client = await clerkClient()
            const user = await client.users.getUser(userId)
            userEmail = user.emailAddresses[0]?.emailAddress || ''
            userName = user.firstName || user.username || 'User'
        } catch (error) {
            console.error('Error fetching user from Clerk:', error)
        }

        // 6. Create in-app notification
        if (userEmail) {
            try {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: userId,
                        type: 'verification',
                        title: action === 'approve' ? 'Verification Approved! 🎉' : 'Verification Requires Attention',
                        message: action === 'approve'
                            ? 'Your identity verification has been approved. Your trial access continues - remember to choose a subscription plan before it expires!'
                            : `Your verification was not approved. ${rejectionReason || 'Please check your documents and resubmit.'} Your trial access has been terminated.`,
                        link: action === 'approve' ? '/dashboard/owner' : '/verification',
                        read: false
                    })
            } catch (notifError) {
                console.error('Error creating notification:', notifError)
                // Continue even if notification creation fails
            }
        }

        // 7. Send email notification
        if (userEmail) {
            try {
                await fetch(`${request.nextUrl.origin}/api/emails/verification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail,
                        userName,
                        status: action === 'approve' ? 'approved' : 'rejected',
                        rejectionReason: action === 'reject' ? rejectionReason : undefined
                    })
                })
            } catch (emailError) {
                console.error('Error sending email:', emailError)
                // Continue even if email fails
            }
        }

        return NextResponse.json({
            success: true,
            message: `Verification ${action}d successfully`,
            userEmail,
            notificationsSent: !!userEmail
        }, {
            headers: {
                'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://admin.leli.rentals' : '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
        })

    } catch (error: any) {
        console.error('Error in verification update:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update verification' },
            { status: 500 }
        )
    }
}
