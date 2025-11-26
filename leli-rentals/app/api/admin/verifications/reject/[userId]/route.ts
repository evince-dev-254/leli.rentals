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
    const { reason } = await req.json()

    if (!userId || !reason) {
      return NextResponse.json({ error: 'User ID and reason required' }, { status: 400 })
    }

    // Update user verification status
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    await client.users.updateUser(userId, {
      unsafeMetadata: {
        ...user.unsafeMetadata,
        verificationStatus: 'rejected',
        verificationRejectedAt: new Date().toISOString(),
        verificationRejectionReason: reason,
      },
    })

    // Send rejection email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.emailAddresses[0]?.emailAddress,
          userName: user.firstName || 'there',
          status: 'rejected',
          reason
        })
      })
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the rejection if email fails
    }
    
    // Send in-app notification
    try {
      await automaticNotifications.sendVerificationNotification(
        userId,
        'rejected',
        reason
      )
    } catch (notifError) {
      console.error('In-app notification error:', notifError)
      // Don't fail the rejection if notification fails
    }

    const response = NextResponse.json({
      success: true,
      message: 'Verification rejected',
    })
    
    return addCorsHeaders(response, req)
  } catch (error) {
    console.error('Error rejecting verification:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to reject verification' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, req)
  }
}

