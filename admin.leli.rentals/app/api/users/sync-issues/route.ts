import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    try {
        // Verify admin token
        const authHeader = req.headers.get('x-admin-token')
        if (authHeader !== process.env.ADMIN_TOKEN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all users from Clerk
        const client = await clerkClient()
        const clerkResponse = await client.users.getUserList({ limit: 500 })

        // Get all user IDs from Supabase
        const { data: dbUsers, error: dbError } = await supabase
            .from('user_profiles')
            .select('user_id')

        if (dbError) {
            console.error('Error fetching database users:', dbError)
            return NextResponse.json({
                error: 'Failed to fetch database users',
                details: dbError.message
            }, { status: 500 })
        }

        const dbUserIds = new Set(dbUsers?.map(u => u.user_id) || [])

        // Find users in Clerk but not in database
        const missingUsers = clerkResponse.data
            .filter(user => !dbUserIds.has(user.id))
            .map(user => ({
                id: user.id,
                email: user.emailAddresses?.[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                createdAt: user.createdAt,
                accountType: user.unsafeMetadata?.accountType || user.publicMetadata?.accountType
            }))

        return NextResponse.json({
            syncIssues: missingUsers,
            total: missingUsers.length
        })

    } catch (error: any) {
        console.error('Error finding sync issues:', error)
        return NextResponse.json({
            error: 'Failed to find sync issues',
            details: error.message
        }, { status: 500 })
    }
}
