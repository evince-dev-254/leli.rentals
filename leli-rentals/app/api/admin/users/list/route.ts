import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

    // Get query params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`user_id.ilike.%${search}%,phone.ilike.%${search}%,location.ilike.%${search}%`)
    }

    if (role && ['user', 'admin', 'super_admin'].includes(role)) {
      query = query.eq('role', role)
    }

    // Apply pagination and ordering
    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const response = NextResponse.json({
      success: true,
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

    return addCorsHeaders(response, req)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, req)
  }
}
