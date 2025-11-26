import { supabase, checkUserRole, logAdminAction } from './supabase'

/**
 * User role types
 */
export type UserRole = 'user' | 'admin' | 'super_admin'

/**
 * User profile interface
 */
export interface UserProfile {
    id: string
    user_id: string
    full_name?: string
    email?: string
    role: UserRole
    avatar_url?: string
    created_at: string
    updated_at: string
    account_type?: string
    phone?: string | null
    location?: string | null
}

/**
 * Admin activity log interface
 */
export interface AdminActivityLog {
    id: string
    admin_user_id: string
    action: string
    details: Record<string, unknown>
    created_at: string
}

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await checkUserRole(userId)
    return role === 'admin' || role === 'super_admin'
}

/**
 * Check if a user has super admin privileges
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
    const role = await checkUserRole(userId)
    return role === 'super_admin'
}

/**
 * Update user's role (admin dashboard)
 */
export async function updateUserRole(
    userId: string,
    newRole: UserRole,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    // Check if admin has permission to change roles
    const adminRole = await checkUserRole(adminUserId)
    if (adminRole !== 'super_admin') {
        return { success: false, error: 'Only super admins can change user roles' }
    }

    // Update the role
    const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId) as any

    if (error) {
        console.error('Error updating user role:', error)
        return { success: false, error: error.message }
    }

    // Log the action
    await logAdminAction(adminUserId, 'ROLE_CHANGE', {
        targetUserId: userId,
        details: { newRole }
    })

    return { success: true }
}

/**
 * Get all users with their profiles
 */
export async function getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false }) as any

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data || []
}

/**
 * Get admin users only
 */
export async function getAdminUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false }) as any

    if (error) {
        console.error('Error fetching admin users:', error)
        return []
    }

    return data || []
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(limit: number = 100): Promise<AdminActivityLog[]> {
    const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit) as any

    if (error) {
        console.error('Error fetching admin activity log:', error)
        return []
    }

    return data || []
}

/**
 * Middleware helper to check admin access
 */
export async function requireAdmin(userId: string): Promise<{ allowed: boolean; role: UserRole | null }> {
    const role = await checkUserRole(userId)
    const allowed = role === 'admin' || role === 'super_admin'

    return { allowed, role }
}

/**
 * Middleware helper to check super admin access
 */
export async function requireSuperAdmin(userId: string): Promise<{ allowed: boolean; role: UserRole | null }> {
    const role = await checkUserRole(userId)
    const allowed = role === 'super_admin'

    return { allowed, role }
}
