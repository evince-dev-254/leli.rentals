import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    try {
        // Check for admin internal token
        const adminToken = request.headers.get('x-admin-token')
        if (adminToken !== process.env.ADMIN_INTERNAL_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch all users from Clerk
        const client = await clerkClient()
        const response = await client.users.getUserList({
            limit: 500 // Adjust as needed
        })

        // Transform Clerk users to a consistent format
        const users = response.data.map(user => ({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
            unsafeMetadata: user.unsafeMetadata,
            publicMetadata: user.publicMetadata
        }))

        return NextResponse.json({
            success: true,
            users,
            totalCount: users.length
        })
    } catch (error: any) {
        console.error('Error fetching Clerk users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch Clerk users', details: error.message },
            { status: 500 }
        )
    }
}
