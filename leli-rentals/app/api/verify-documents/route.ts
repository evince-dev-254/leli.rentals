import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// This endpoint records submitted verification documents and marks the user as pending review.
// Admins must approve separately in the admin panel.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json().catch(() => ({})) as {
      documentFront?: string
      documentBack?: string
      selfieWithDocument?: string
    }

    // Basic validation – ensure at least one doc is provided
    const hasAtLeastOneDoc = Boolean(payload.documentFront || payload.documentBack || payload.selfieWithDocument)
    if (!hasAtLeastOneDoc) {
      return NextResponse.json({ error: 'No documents provided' }, { status: 400 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    await client.users.updateUser(userId, {
      // Store documents in unsafeMetadata; publicMetadata holds only statuses
      unsafeMetadata: {
        ...user.unsafeMetadata,
        verificationDocuments: {
          ...(user.unsafeMetadata as any)?.verificationDocuments,
          ...(payload.documentFront ? { documentFront: payload.documentFront } : {}),
          ...(payload.documentBack ? { documentBack: payload.documentBack } : {}),
          ...(payload.selfieWithDocument ? { selfieWithDocument: payload.selfieWithDocument } : {}),
        },
        verificationStatus: 'pending',
        verificationSubmittedAt: new Date().toISOString(),
      },
      publicMetadata: {
        ...user.publicMetadata,
        isVerified: false,
        needsVerification: true,
        documentsUploaded: true,
      },
    })

    return NextResponse.json({ success: true, status: 'pending' })
  } catch (error) {
    console.error('Error recording verification documents:', error)
    return NextResponse.json({ error: 'Failed to submit documents' }, { status: 500 })
  }
}

