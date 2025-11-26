import { NextRequest, NextResponse } from 'next/server'
import { isSuperAdmin, demoteFromAdmin } from '@/lib/admin-roles'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const authResult = await verifyAdminRequest(req)
        if (!authResult.ok) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: authResult.status || 403 })
        }

        const { userId: adminUserId } = authResult
        const { userId: targetUserId } = await params

        if (!adminUserId && authResult.reason !== 'token') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (authResult.reason !== 'token') {
            const isSuperAdminUser = await isSuperAdmin(adminUserId!)
            if (!isSuperAdminUser) {
                return NextResponse.json(
                    { error: 'Only super admins can demote users' },
                    { status: 403 }
                )
            }
        }

        // Demote the user
        const result = await demoteFromAdmin(targetUserId, adminUserId || 'internal_admin')

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to demote user' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'User demoted to regular user successfully',
        })
    } catch (error: any) {
        console.error('Error in demote endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
