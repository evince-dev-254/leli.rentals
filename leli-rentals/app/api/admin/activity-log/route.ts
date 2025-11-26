import { NextRequest, NextResponse } from 'next/server'
import { getAdminActivityLog } from '@/lib/admin-role-utils'
import { addCorsHeaders, createOptionsResponse } from '@/lib/admin-cors'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function OPTIONS(req: NextRequest) {
    return createOptionsResponse(req)
}

export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAdminRequest(req)
        if (!authResult.ok) {
            const errorResponse = NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: authResult.status || 403 }
            )
            return addCorsHeaders(errorResponse, req)
        }

        // Get limit from query params
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '100')

        // Fetch activity log
        const activityLog = await getAdminActivityLog(limit)

        const response = NextResponse.json({
            success: true,
            activityLog,
            count: activityLog.length
        })

        return addCorsHeaders(response, req)
    } catch (error: any) {
        console.error('Error fetching admin activity log:', error)
        const errorResponse = NextResponse.json(
            { error: 'Failed to fetch activity log', details: error.message },
            { status: 500 }
        )
        return addCorsHeaders(errorResponse, req)
    }
}
