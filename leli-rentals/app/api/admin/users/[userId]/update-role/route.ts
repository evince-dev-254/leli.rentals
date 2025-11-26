import { NextRequest, NextResponse } from 'next/server'
import { updateUserRole } from '@/lib/admin-role-utils'
import { addCorsHeaders, createOptionsResponse } from '@/lib/admin-cors'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function OPTIONS(req: NextRequest) {
    return createOptionsResponse(req)
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const authResult = await verifyAdminRequest(req)
        if (!authResult.ok) {
            const errorResponse = NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: authResult.status || 403 }
            )
            return addCorsHeaders(errorResponse, req)
        }

        const { userId: adminUserId } = authResult

        const { userId } = await params
        const body = await req.json()
        const { role } = body

        if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be: user, admin, or super_admin' },
                { status: 400 }
            )
        }

        // Update user role
        const result = await updateUserRole(userId, role, adminUserId || 'internal_admin')

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to update role' },
                { status: 403 }
            )
        }

        const response = NextResponse.json({
            success: true,
            message: `User role updated to ${role}`,
            userId,
            newRole: role
        })

        return addCorsHeaders(response, req)
    } catch (error: any) {
        console.error('Error updating user role:', error)
        const errorResponse = NextResponse.json(
            { error: 'Failed to update user role', details: error.message },
            { status: 500 }
        )
        return addCorsHeaders(errorResponse, req)
    }
}
