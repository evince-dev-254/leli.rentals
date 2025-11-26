import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { automaticNotifications } from '@/lib/automatic-notifications'
import { addCorsHeaders, createOptionsResponse } from '@/lib/admin-cors'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function OPTIONS(req: NextRequest) {
  return createOptionsResponse(req)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authResult = await verifyAdminRequest(req)
    if (!authResult.ok) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: authResult.status || 403 }
      )
      return addCorsHeaders(errorResponse, req)
    }

    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    // Enforce: cannot approve unless documents were submitted
    const docs = (user.unsafeMetadata as any)?.verificationDocuments || {}
    const hasAllRequiredDocs = Boolean(docs.documentFront && docs.documentBack && docs.selfieWithDocument)
    if (!hasAllRequiredDocs) {
      return NextResponse.json(
        { error: 'User has not submitted required verification documents (front, back, selfie).' },
        { status: 400 }
      )
    }

    // Additionally require current status to be pending
    const status = (user.unsafeMetadata as any)?.verificationStatus
    if (status !== 'pending') {
      return NextResponse.json(
        { error: 'Verification can only be approved when status is pending.' },
        { status: 400 }
      )
    }

    // Update user verification status
    await client.users.updateUser(userId, {
      unsafeMetadata: {
        ...user.unsafeMetadata,
        verificationStatus: 'approved',
        verificationApprovedAt: new Date().toISOString(),
      },
      publicMetadata: {
        ...user.publicMetadata,
        isVerified: true,
        needsVerification: false,
      }
    })

    // Send approval email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.emailAddresses[0]?.emailAddress,
          userName: user.firstName || 'there',
          status: 'approved'
        })
      })
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the approval if email fails
    }
    
    // Send in-app notification
    try {
      await automaticNotifications.sendVerificationNotification(
        userId,
        'approved'
      )
    } catch (notifError) {
      console.error('In-app notification error:', notifError)
      // Don't fail the approval if notification fails
    }

    const response = NextResponse.json({
      success: true,
      message: 'Verification approved successfully',
    })
    
    return addCorsHeaders(response, req)
  } catch (error) {
    console.error('Error approving verification:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to approve verification' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, req)
  }
}

