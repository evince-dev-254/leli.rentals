import { supabase } from './supabase'

/**
 * User role types
 */
export type UserRole = 'user' | 'admin' | 'super_admin'

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId)
    return role === 'admin' || role === 'super_admin'
}

/**
 * Check if a user has super admin privileges
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId)
    return role === 'super_admin'
}

/**
 * Get user's role from database
 */
export async function getUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            await ensureUserProfile(userId)
        } else {
            console.error('Error fetching user role:', error)
        }
        return 'user'
    }

    return (data?.role as UserRole) || 'user'
}

/**
 * Update user's role
 */
export async function updateUserRole(
    userId: string,
    newRole: UserRole,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    // Check if admin has permission to change roles
    const adminRole = await getUserRole(adminUserId)
    if (adminRole !== 'super_admin') {
        return { success: false, error: 'Only super admins can change user roles' }
    }

    // Update the role
    const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

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
 * Ensure user profile exists for a user
 */
export async function ensureUserProfile(userId: string): Promise<void> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        console.error('Error checking user profile:', error)
        return
    }

    // Create profile if it doesn't exist
    if (!data) {
        const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: userId,
                role: 'user',
                account_type: 'not_selected',
                verification_status: 'unverified',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (insertError) {
            console.error('Error creating user profile:', insertError)
        }
    }
}

/**
 * Log admin action to database
 */
export async function logAdminAction(
    adminUserId: string,
    actionType: string,
    details?: {
        targetUserId?: string
        targetResourceType?: string
        targetResourceId?: string
        details?: any
    }
): Promise<void> {
    const { error } = await supabase
        .from('admin_activity_log')
        .insert({
            admin_user_id: adminUserId,
            action_type: actionType,
            target_user_id: details?.targetUserId || null,
            target_resource_type: details?.targetResourceType || null,
            target_resource_id: details?.targetResourceId || null,
            details: details?.details || null
        })

    if (error) {
        console.error('Error logging admin action:', error)
    }
}

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<any[]> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admin users:', error)
        return []
    }

    return data || []
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(limit: number = 100): Promise<any[]> {
    const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching admin activity log:', error)
        return []
    }

    return data || []
}

/**
 * Middleware helper to check admin access
 */
export async function requireAdmin(userId: string): Promise<{ allowed: boolean; role: UserRole }> {
    const role = await getUserRole(userId)
    const allowed = role === 'admin' || role === 'super_admin'

    return { allowed, role }
}

/**
 * Middleware helper to check super admin access
 */
export async function requireSuperAdmin(userId: string): Promise<{ allowed: boolean; role: UserRole }> {
    const role = await getUserRole(userId)
    const allowed = role === 'super_admin'

    return { allowed, role }
}
