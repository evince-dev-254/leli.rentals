import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const user = await currentUser()

        return NextResponse.json({
            userId,
            email: user?.emailAddresses?.[0]?.emailAddress || null,
            firstName: user?.firstName || null,
            lastName: user?.lastName || null,
        })
    } catch (error: any) {
        console.error('Error fetching user info:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user info', details: error.message },
            { status: 500 }
        )
    }
}
