import { supabase, checkUserRole, logAdminAction } from './supabase'

/**
 * Admin role utilities for checking permissions and managing admin users
 */

export type UserRole = 'user' | 'admin' | 'super_admin'

export const ROLES = {
    USER: 'user' as UserRole,
    ADMIN: 'admin' as UserRole,
    SUPER_ADMIN: 'super_admin' as UserRole,
}

/**
 * Check if a user has admin privileges (admin or super_admin)
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await checkUserRole(userId)
    return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
}

/**
 * Check if a user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
    const role = await checkUserRole(userId)
    return role === ROLES.SUPER_ADMIN
}

/**
 * Get user's role from database
 */
export async function getUserRole(userId: string): Promise<UserRole> {
    const role = await checkUserRole(userId)
    return role || ROLES.USER
}

/**
 * Promote a user to admin role
 */
export async function promoteToAdmin(
    targetUserId: string,
    adminUserId: string,
    role: 'admin' | 'super_admin' = 'admin'
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if the admin has permission (must be super_admin to promote)
        const adminRole = await checkUserRole(adminUserId)
        if (adminRole !== ROLES.SUPER_ADMIN) {
            return { success: false, error: 'Only super admins can promote users' }
        }

        // Update user role
        const { error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('user_id', targetUserId)

        if (error) {
            console.error('Error promoting user:', error)
            return { success: false, error: error.message }
        }

        // Log the action
        await logAdminAction(adminUserId, 'PROMOTE_USER', {
            targetUserId,
            details: { newRole: role },
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error in promoteToAdmin:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Demote a user from admin role back to regular user
 */
export async function demoteFromAdmin(
    targetUserId: string,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if the admin has permission (must be super_admin to demote)
        const adminRole = await checkUserRole(adminUserId)
        if (adminRole !== ROLES.SUPER_ADMIN) {
            return { success: false, error: 'Only super admins can demote users' }
        }

        // Prevent demoting yourself
        if (targetUserId === adminUserId) {
            return { success: false, error: 'Cannot demote yourself' }
        }

        // Update user role
        const { error } = await supabase
            .from('user_profiles')
            .update({ role: ROLES.USER })
            .eq('user_id', targetUserId)

        if (error) {
            console.error('Error demoting user:', error)
            return { success: false, error: error.message }
        }

        // Log the action
        await logAdminAction(adminUserId, 'DEMOTE_USER', {
            targetUserId,
            details: { previousRole: 'admin or super_admin', newRole: 'user' },
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error in demoteFromAdmin:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get all admin users
 */
export async function getAllAdmins() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', [ROLES.ADMIN, ROLES.SUPER_ADMIN])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admins:', error)
        return []
    }

    return data || []
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(limit: number = 50) {
    const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching activity log:', error)
        return []
    }

    return data || []
}

/**
 * Create or update user profile with role
 */
export async function ensureUserProfile(
    userId: string,
    data: {
        role?: UserRole
        account_type?: 'renter' | 'owner'
        bio?: string
        avatar_url?: string
        phone?: string
        location?: string
    }
) {
    const { error } = await supabase
        .from('user_profiles')
        .upsert(
            {
                user_id: userId,
                ...data,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'user_id',
            }
        )

    if (error) {
        console.error('Error ensuring user profile:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
