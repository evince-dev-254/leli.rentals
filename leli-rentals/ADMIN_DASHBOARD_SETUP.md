# Admin Dashboard Setup Instructions

## Files Created in Main App (leli-rentals)

1. **Database Migration**: `database/admin-role-system.sql`
   - Adds `role` column to `user_profiles` table
   - Creates `admin_activity_log` table
   - Adds helper functions

2. **Admin Role Utilities**: `lib/admin-roles.ts`
   - Functions to check user roles
   - Promote/demote admin users
   - Log admin actions

## Files to Create in Admin Dashboard (admin.leli.rentals)

### 1. lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not configured in admin dashboard')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null as any

export { isSupabaseConfigured }

// Helper function to check if user is admin
export async function checkUserRole(userId: string) {
  if (!isSupabaseConfigured) return null

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
```

### 2. middleware.ts (REPLACE EXISTING)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/unauthorized'])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  if (isProtectedRoute(request)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check admin role from database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', userId)
          .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### 3. app/unauthorized/page.tsx (NEW FILE)

```typescript
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-white/90 mb-6">
          You do not have permission to access the admin dashboard. 
          Only users with admin privileges can access this area.
        </p>
        <Link 
          href="/"
          className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
```

### 4. Update .env.local in Admin Dashboard

Add these variables:

```env
# Clerk Authentication (MUST match main app - use SAME keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_from_main_app
CLERK_SECRET_KEY=your_secret_from_main_app

# Supabase (Direct database access)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Main Website API URL
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# Admin Dashboard URL
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

## Setup Steps

1. **Run Database Migration**
   - Go to Supabase SQL Editor
   - Run the SQL from `database/admin-role-system.sql`

2. **Create Initial Admin User**
   - Run this SQL in Supabase to make yourself admin:
   ```sql
   -- Replace 'your_clerk_user_id' with your actual Clerk user ID
   INSERT INTO user_profiles (user_id, role)
   VALUES ('your_clerk_user_id', 'super_admin')
   ON CONFLICT (user_id) 
   DO UPDATE SET role = 'super_admin';
   ```

3. **Update Admin Dashboard**
   - Create the files listed above
   - Update .env.local with Supabase credentials
   - Ensure Clerk keys match main app

4. **Test**
   - Start main app: `npm run dev` (port 3000)
   - Start admin dashboard: `npm run dev` (port 3001)
   - Sign in and verify admin access works
