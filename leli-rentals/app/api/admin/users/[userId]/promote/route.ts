import { NextRequest, NextResponse } from 'next/server'
import { isSuperAdmin, promoteToAdmin } from '@/lib/admin-roles'
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
                    { error: 'Only super admins can promote users' },
                    { status: 403 }
                )
            }
        }

        // Get role from request body
        const body = await req.json()
        const role = body.role || 'admin'

        if (role !== 'admin' && role !== 'super_admin') {
            return NextResponse.json(
                { error: 'Invalid role. Must be "admin" or "super_admin"' },
                { status: 400 }
            )
        }

        // Promote the user
        const result = await promoteToAdmin(targetUserId, adminUserId || 'internal_admin', role)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to promote user' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: `User promoted to ${role} successfully`,
        })
    } catch (error: any) {
        console.error('Error in promote endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
