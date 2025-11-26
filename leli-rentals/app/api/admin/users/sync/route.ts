import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        // Verify admin authentication (you can add more robust auth here)
        const authHeader = req.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Start sync log
        const { data: syncLog, error: syncLogError } = await supabase
            .from('user_sync_log')
            .insert({
                sync_type: 'manual',
                triggered_by: 'admin',
                status: 'in_progress'
            })
            .select()
            .single()

        if (syncLogError) {
            console.error('Failed to create sync log:', syncLogError)
            return NextResponse.json({ error: 'Failed to start sync' }, { status: 500 })
        }

        const syncLogId = syncLog.id

        // Get all users from Clerk
        const client = await clerkClient()
        const clerkUsers = await client.users.getUserList({ limit: 500 })

        // Get all users from Supabase
        const { data: dbUsers, error: dbError } = await supabase
            .from('user_profiles')
            .select('user_id')

        if (dbError) {
            console.error('Failed to fetch database users:', dbError)
            await supabase
                .from('user_sync_log')
                .update({
                    status: 'failed',
                    completed_at: new Date().toISOString(),
                    error_details: { message: dbError.message }
                })
                .eq('id', syncLogId)

            return NextResponse.json({ error: 'Failed to fetch database users' }, { status: 500 })
        }

        const dbUserIds = new Set(dbUsers?.map(u => u.user_id) || [])
        const missingUsers = clerkUsers.data.filter(user => !dbUserIds.has(user.id))

        console.log(`Found ${missingUsers.length} users missing from database`)

        let synced = 0
        let failed = 0
        const failedUserIds: string[] = []

        // Sync missing users
        for (const user of missingUsers) {
            try {
                const userEmail = user.emailAddresses?.[0]?.emailAddress

                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: user.id,
                        email: userEmail,
                        avatar_url: user.imageUrl,
                        account_type: user.unsafeMetadata?.accountType || 'renter',
                        role: 'user',
                        verification_status: 'unverified',
                        subscription_plan: 'free',
                        subscription_status: 'active',
                    })

                if (insertError) {
                    console.error(`Failed to sync user ${user.id}:`, insertError)
                    failed++
                    failedUserIds.push(user.id)
                } else {
                    console.log(`✅ Synced user ${user.id}`)
                    synced++
                }
            } catch (error) {
                console.error(`Error syncing user ${user.id}:`, error)
                failed++
                failedUserIds.push(user.id)
            }
        }

        // Update sync log
        await supabase
            .from('user_sync_log')
            .update({
                users_synced: synced,
                users_failed: failed,
                failed_user_ids: failedUserIds,
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', syncLogId)

        return NextResponse.json({
            success: true,
            total_clerk_users: clerkUsers.data.length,
            total_db_users: dbUsers?.length || 0,
            missing_users: missingUsers.length,
            synced,
            failed,
            failed_user_ids: failedUserIds
        })

    } catch (error: any) {
        console.error('Sync error:', error)
        return NextResponse.json({
            error: 'Sync failed',
            details: error.message
        }, { status: 500 })
    }
}
