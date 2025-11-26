/**
 * Supabase client with Clerk authentication
 * This client automatically includes the Clerk JWT token for Supabase RLS
 */

import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Hook to get a Supabase client with Clerk authentication
 * Use this instead of the regular supabase client when you need RLS
 * 
 * @example
 * ```typescript
 * const supabase = useSupabaseClient()
 * const { data } = await supabase.from('listings').select('*')
 * ```
 */
export function useSupabaseClient() {
  const { getToken } = useAuth()

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: async () => {
        // Get Clerk token with Supabase template
        const token = await getToken({ template: 'supabase' })
        
        return {
          Authorization: token ? `Bearer ${token}` : '',
        }
      },
    },
  })

  return supabase
}

/**
 * Get a Supabase client with Clerk authentication for server-side use
 * 
 * @param getToken - Clerk's getToken function from server-side auth
 * @example
 * ```typescript
 * import { auth } from '@clerk/nextjs/server'
 * 
 * const { getToken } = auth()
 * const supabase = await getSupabaseServerClient(getToken)
 * ```
 */
export async function getSupabaseServerClient(getToken: () => Promise<string | null>) {
  const token = await getToken({ template: 'supabase' })

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  })

  return supabase
}

