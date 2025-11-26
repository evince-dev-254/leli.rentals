import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        const unsafeMetadata = user.unsafeMetadata

        // Copy relevant fields from unsafeMetadata to publicMetadata
        const publicMetadataUpdate = {
            verificationStatus: unsafeMetadata.verificationStatus,
            accountType: unsafeMetadata.accountType,
            subscriptionStatus: unsafeMetadata.subscriptionStatus,
            subscriptionPlan: unsafeMetadata.subscriptionPlan,
            subscriptionEndsAt: unsafeMetadata.subscriptionEndsAt,
            verificationCompletedAt: unsafeMetadata.verificationCompletedAt,
            verificationSubmittedAt: unsafeMetadata.verificationSubmittedAt
        }

        await client.users.updateUserMetadata(userId, {
            publicMetadata: publicMetadataUpdate
        })

        return NextResponse.json({ success: true, updatedMetadata: publicMetadataUpdate })
    } catch (error: any) {
        console.error('Error fixing metadata:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
