import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { emailService } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { action, rejectionReason } = await request.json()

    // Admin authentication check
    // TODO: Get the current user from the request and verify they are admin
    // For now, this endpoint should only be called from the admin page which already checks
    // In production, you should add proper authentication here using Clerk's auth()

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Approve verification
      await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          ...user.unsafeMetadata,
          verificationStatus: 'approved',
          isVerified: true,
          verificationApprovedAt: new Date().toISOString(),
        }
      })

      // Send approval email
      await emailService.sendVerificationConfirmationEmail(
        user.emailAddresses[0]?.emailAddress || '',
        user.firstName || 'there',
        'approved'
      )

      return NextResponse.json({ 
        success: true, 
        message: 'User verified successfully' 
      })

    } else if (action === 'reject') {
      // Reject verification
      await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          ...user.unsafeMetadata,
          verificationStatus: 'rejected',
          verificationRejectionReason: rejectionReason || 'Documents not clear',
          verificationRejectedAt: new Date().toISOString(),
        }
      })

      // Send rejection email
      await emailService.sendVerificationConfirmationEmail(
        user.emailAddresses[0]?.emailAddress || '',
        user.firstName || 'there',
        'rejected',
        rejectionReason
      )

      return NextResponse.json({ 
        success: true, 
        message: 'Verification rejected' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Verification approval error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

