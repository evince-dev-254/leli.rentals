import { NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { timingSafeEqual } from 'crypto'
import { requireAdmin as requireAdminFromUtils } from './admin-role-utils'

interface AdminAuthResult {
  ok: boolean
  status?: number
  userId?: string
  reason?: 'token' | 'clerk'
}

const ADMIN_INTERNAL_TOKEN = process.env.ADMIN_INTERNAL_TOKEN

function isValidInternalToken(headerToken: string | null): boolean {
  if (!headerToken || !ADMIN_INTERNAL_TOKEN) {
    return false
  }

  try {
    const provided = Buffer.from(headerToken)
    const expected = Buffer.from(ADMIN_INTERNAL_TOKEN)

    if (provided.length !== expected.length) {
      return false
    }

    return timingSafeEqual(provided, expected)
  } catch (error) {
    console.error('Error validating admin token:', error)
    return false
  }
}

export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const headerToken =
    req.headers.get('x-admin-token') ||
    req.headers.get('authorization')?.replace(/Bearer\s+/i, '').trim() ||
    null

  if (isValidInternalToken(headerToken)) {
    return { ok: true, reason: 'token' }
  }

  const { userId } = await auth()
  if (!userId) {
    return { ok: false, status: 401 }
  }

  const { allowed } = await requireAdminFromUtils(userId)
  if (!allowed) {
    return { ok: false, status: 403, userId }
  }

  return { ok: true, userId, reason: 'clerk' }
}

/**
 * Admin authentication and authorization utilities
 */

// List of email addresses allowed as admins
// In production, move this to environment variables or database
const ADMIN_EMAILS = [
  // Add your admin emails here
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2,
  process.env.ADMIN_EMAIL_3,
].filter(Boolean) // Remove undefined values

// Optional: IP whitelist for admin access
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',') || []

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'moderator' | 'support'
  permissions: string[]
}

/**
 * Check if user is an admin
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const { userId: authUserId } = await auth()
    const id = userId || authUserId

    if (!id) return false

    const user = await client.users.getUser(id)
    const metadata = user.publicMetadata as any

    // Check if user has admin role
    if (metadata.isAdmin === true) return true

    // Check if email is in admin list
    const email = user.emailAddresses[0]?.emailAddress
    if (email && ADMIN_EMAILS.includes(email)) return true

    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const metadata = user.publicMetadata as any

    if (!metadata.isAdmin) return null

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.fullName || user.firstName || 'Admin',
      role: metadata.adminRole || 'moderator',
      permissions: metadata.adminPermissions || [],
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

/**
 * Require admin access - use in server components
 */
export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/unauthorized')
  }
}

/**
 * Check if admin has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const adminUser = await getAdminUser()

  if (!adminUser) return false

  // Super admins have all permissions
  if (adminUser.role === 'super_admin') return true

  return adminUser.permissions.includes(permission)
}

/**
 * Admin permissions list
 */
export const ADMIN_PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  SUSPEND_USERS: 'suspend_users',

  // Verification
  VIEW_VERIFICATIONS: 'view_verifications',
  APPROVE_VERIFICATIONS: 'approve_verifications',
  REJECT_VERIFICATIONS: 'reject_verifications',

  // Listings
  VIEW_LISTINGS: 'view_listings',
  EDIT_LISTINGS: 'edit_listings',
  DELETE_LISTINGS: 'delete_listings',
  FEATURE_LISTINGS: 'feature_listings',

  // Bookings
  VIEW_BOOKINGS: 'view_bookings',
  CANCEL_BOOKINGS: 'cancel_bookings',
  REFUND_BOOKINGS: 'refund_bookings',

  // Financial
  VIEW_TRANSACTIONS: 'view_transactions',
  PROCESS_PAYOUTS: 'process_payouts',

  // System
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_LOGS: 'view_logs',
} as const

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS = {
  super_admin: Object.values(ADMIN_PERMISSIONS),
  moderator: [
    ADMIN_PERMISSIONS.VIEW_USERS,
    ADMIN_PERMISSIONS.VIEW_VERIFICATIONS,
    ADMIN_PERMISSIONS.APPROVE_VERIFICATIONS,
    ADMIN_PERMISSIONS.REJECT_VERIFICATIONS,
    ADMIN_PERMISSIONS.VIEW_LISTINGS,
    ADMIN_PERMISSIONS.EDIT_LISTINGS,
    ADMIN_PERMISSIONS.VIEW_BOOKINGS,
  ],
  support: [
    ADMIN_PERMISSIONS.VIEW_USERS,
    ADMIN_PERMISSIONS.VIEW_VERIFICATIONS,
    ADMIN_PERMISSIONS.VIEW_LISTINGS,
    ADMIN_PERMISSIONS.VIEW_BOOKINGS,
  ],
}

/**
 * Grant admin access to a user
 */
export async function grantAdminAccess(
  userId: string,
  role: 'super_admin' | 'moderator' | 'support' = 'moderator'
): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        isAdmin: true,
        adminRole: role,
        adminPermissions: ROLE_PERMISSIONS[role],
        adminGrantedAt: new Date().toISOString(),
      },
    })

    return true
  } catch (error) {
    console.error('Error granting admin access:', error)
    return false
  }
}

/**
 * Revoke admin access from a user
 */
export async function revokeAdminAccess(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        isAdmin: false,
        adminRole: undefined,
        adminPermissions: undefined,
        adminRevokedAt: new Date().toISOString(),
      },
    })

    return true
  } catch (error) {
    console.error('Error revoking admin access:', error)
    return false
  }
}

/**
 * Check IP whitelist (if configured)
 */
export function checkIPWhitelist(ip: string): boolean {
  // If no whitelist configured, allow all IPs
  if (ADMIN_IP_WHITELIST.length === 0) return true

  return ADMIN_IP_WHITELIST.includes(ip)
}

/**
 * Rate limiting for admin login
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = loginAttempts.get(identifier)

  if (!record || now > record.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

export function clearRateLimit(identifier: string): void {
  loginAttempts.delete(identifier)
}

