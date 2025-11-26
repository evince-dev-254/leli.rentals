import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
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
    containedBy: () => dummyQuery,
    rangeGt: () => dummyQuery,
    rangeGte: () => dummyQuery,
    rangeLt: () => dummyQuery,
    rangeLte: () => dummyQuery,
    rangeAdjacent: () => dummyQuery,
    overlaps: () => dummyQuery,
    textSearch: () => dummyQuery,
    match: () => dummyQuery,
    not: () => dummyQuery,
    or: () => dummyQuery,
    filter: () => dummyQuery,
    order: () => dummyQuery,
    limit: () => dummyQuery,
    range: () => dummyQuery,
    single: () => Promise.resolve({ data: null, error: supabaseError }),
    maybeSingle: () => Promise.resolve({ data: null, error: supabaseError }),
    then: (resolve: any) => resolve({ data: null, error: supabaseError }),
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
      signInWithPassword: () => Promise.resolve({ data: null, error: supabaseError }),
      signUp: () => Promise.resolve({ data: null, error: supabaseError }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as any
}

// Create a dummy client if credentials are missing to prevent app crash
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
    details?: any
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

// Database types
export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          price: number | null
          status: 'draft' | 'published' | 'archived'
          images: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          price?: number | null
          status?: 'draft' | 'published' | 'archived'
          images?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          price?: number | null
          status?: 'draft' | 'published' | 'archived'
          images?: any
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}
