import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase credentials not configured in admin dashboard. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
}

// Create a dummy client with proper method chaining if credentials are missing
const createDummySupabaseClient = () => {
    const supabaseError = {
        message: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.',
        details: 'Missing Supabase credentials',
        hint: 'Check your environment variables',
        code: 'SUPABASE_NOT_CONFIGURED'
    }

    const dummyQuery = {
        select: () => dummyQuery,
        insert: () => dummyQuery,
        update: () => dummyQuery,
        delete: () => dummyQuery,
        eq: () => dummyQuery,
        neq: () => dummyQuery,
        gt: () => dummyQuery,
        gte: () => dummyQuery,
        lt: () => dummyQuery,
        lte: () => dummyQuery,
        like: () => dummyQuery,
        ilike: () => dummyQuery,
        is: () => dummyQuery,
        in: () => dummyQuery,
        contains: () => dummyQuery,
        order: () => dummyQuery,
        limit: () => dummyQuery,
        range: () => dummyQuery,
        single: () => Promise.resolve({ data: null, error: supabaseError }),
        maybeSingle: () => Promise.resolve({ data: null, error: supabaseError }),
        then: (resolve: (value: unknown) => void) => resolve({ data: null, error: supabaseError }),
        catch: () => Promise.resolve({ data: null, error: supabaseError }),
    }

    return {
        from: () => dummyQuery,
        channel: () => ({
            on: () => ({
                subscribe: () => ({ unsubscribe: () => { } })
            }),
        }),
        removeChannel: () => Promise.resolve({ status: 'ok', error: null }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        },
    }
}

// Create Supabase client for admin dashboard
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : createDummySupabaseClient()

export { isSupabaseConfigured }

// Database types for admin operations
export interface UserPreferences {
    [key: string]: unknown
}

export interface UserProfile {
    id: string
    user_id: string
    bio: string | null
    avatar_url: string | null
    phone: string | null
    location: string | null
    role: 'user' | 'admin' | 'super_admin'
    account_type: 'renter' | 'owner'
    verification_status: 'unverified' | 'pending' | 'approved' | 'rejected'
    preferences: UserPreferences
    created_at: string
    updated_at: string
}

export interface AdminActivityDetails {
    [key: string]: unknown
}

export interface AdminActivityLog {
    id: string
    admin_user_id: string
    action_type: string
    target_user_id: string | null
    target_resource_type: string | null
    target_resource_id: string | null
    details: AdminActivityDetails
    ip_address: string | null
    user_agent: string | null
    created_at: string
}

export interface ListingAvailability {
    [key: string]: unknown
}

export interface ListingContactInfo {
    [key: string]: unknown
}

export interface Listing {
    id: string
    user_id: string
    title: string
    description: string | null
    category: string | null
    subcategory: string | null
    price: number
    price_type: string
    location: string | null
    availability: ListingAvailability
    features: string[]
    images: string[]
    rules: string[]
    contact_info: ListingContactInfo
    status: 'draft' | 'published' | 'archived'
    views: number
    created_at: string
    updated_at: string
}

export interface Booking {
    id: string
    user_id: string
    owner_id: string
    listing_id: string
    start_date: string
    end_date: string
    total_price: number
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    payment_status: 'pending' | 'paid' | 'refunded'
    payment_id: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

// Helper function to check if user is admin
export async function checkUserRole(userId: string): Promise<'user' | 'admin' | 'super_admin' | null> {
    if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, cannot check user role')
        return null
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

    if (error) {
        console.error('Error checking user role:', error)
        return null
    }

    return data?.role || 'user'
}

// Helper function to log admin actions
export async function logAdminAction(
    adminUserId: string,
    actionType: string,
    details?: {
        targetUserId?: string
        targetResourceType?: string
        targetResourceId?: string
        details?: AdminActivityDetails
    }
) {
    if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, cannot log admin action')
        return null
    }

    const { data, error } = await supabase
        .from('admin_activity_log')
        .insert({
            admin_user_id: adminUserId,
            action_type: actionType,
            target_user_id: details?.targetUserId || null,
            target_resource_type: details?.targetResourceType || null,
            target_resource_id: details?.targetResourceId || null,
            details: details?.details || null,
        })
        .select()
        .single()

    if (error) {
        console.error('Error logging admin action:', error)
        return null
    }

    return data
}
