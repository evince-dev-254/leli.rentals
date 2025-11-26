# Admin Authentication Architecture

## How It Works

The admin dashboard uses **separate Clerk authentication** from the main application, providing complete isolation between admin and regular users.

### Key Principles

1. **Separate Clerk Project**: The admin dashboard has its own Clerk project with different API keys
2. **Authentication = Authorization**: Any user who can authenticate via this Clerk project is considered an admin
3. **No Supabase Role Checking**: Unlike the main app, admin access doesn't require checking `user_profiles` table in Supabase
4. **Shared Database Access**: Admin users can read/write to the same Supabase database as the main app

### Authentication Flow

```
User visits admin.leli.rentals
         ↓
Middleware checks if route is protected (/dashboard/*)
         ↓
If protected, Clerk auth.protect() is called
         ↓
User is redirected to Clerk sign-in if not authenticated
         ↓
After sign-in, user is redirected to /dashboard
         ↓
✅ Access granted (no additional role checks needed)
```

### Why This Approach?

**Security Through Isolation:**
- Only people you explicitly invite to the admin Clerk project can access the dashboard
- No way for regular users from the main app to access admin dashboard
- No shared authentication state between apps

**Simplicity:**
- No need to sync Clerk users with Supabase `user_profiles` table
- No need to manage roles in database for admin access
- Clerk handles all user management for admins

### Managing Admin Users

To add or remove admin users:

1. Go to your Clerk admin project dashboard
2. Navigate to "Users"
3. Invite new users or delete existing ones
4. Users can only access admin dashboard if they exist in this Clerk project

### Advanced: Role-Based Access Control Within Admin

If you need different permission levels within the admin dashboard (e.g., super admin vs. regular admin):

**Option 1: Use Clerk Metadata**
```typescript
// Add public metadata to Clerk user
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    adminRole: 'super_admin' // or 'admin'
  }
})

// Check in your code
const { sessionClaims } = await auth()
const adminRole = sessionClaims?.metadata?.adminRole
```

**Option 2: Use Clerk Organizations**
```typescript
// Create organizations in Clerk dashboard (e.g., "Super Admins", "Admins")
// Check membership in your code
const { orgRole } = await auth()
const isSuperAdmin = orgRole === 'super_admin'
```

**Option 3: Use Supabase Table (current setup)**
- The `user_profiles` table in Supabase can still be used for granular permissions
- But it's not required for basic admin dashboard access
- Only needed if you want per-admin role management

## Security Considerations

### Production Checklist

- [ ] Use production Clerk keys (`pk_live_...` and `sk_live_...`)
- [ ] Enable MFA for all admin users in Clerk settings
- [ ] Set up email domain restrictions in Clerk (e.g., only allow `@yourcompany.com`)
- [ ] Enable session controls (max session duration, idle timeout)
- [ ] Monitor Clerk dashboard for suspicious sign-in attempts
- [ ] Use strong `ADMIN_INTERNAL_TOKEN` for API proxy (minimum 32 characters)
- [ ] Enable CORS restrictions on main app API

### Clerk Security Settings

Recommended settings in your admin Clerk project:

1. **Attack Protection**
   - Enable bot detection
   - Enable rate limiting
   - Require email verification

2. **Session Management**
   - Set max session duration (e.g., 7 days)
   - Enable idle timeout (e.g., 1 hour)
   - Require re-authentication for sensitive actions

3. **Email Restrictions**
   - Only allow sign-ups from specific domains
   - Or use invitation-only mode

## Comparison: Admin vs. Main App

| Feature | Admin Dashboard | Main Application |
|---------|----------------|------------------|
| **Auth Provider** | Clerk (admin project) | Clerk/Supabase (main project) |
| **User Base** | Admins only | Regular users |
| **Access Control** | Clerk authentication only | May use Supabase roles |
| **User Sign-up** | Restricted/Invitation | Public |
| **Database** | Read/write Supabase | Read/write Supabase |

## Files Modified

- [`proxy.ts`](file:///c:/Users/evince/OneDrive/Desktop/New%20folder/OneDrive/Videos/leli/admin.leli.rentals/proxy.ts) - Middleware that protects `/dashboard` routes
- [`app/layout.tsx`](file:///c:/Users/evince/OneDrive/Desktop/New%20folder/OneDrive/Videos/leli/admin.leli.rentals/app/layout.tsx) - Wraps app with ClerkProvider

## Troubleshooting

### "Access Denied" Error

**Old behavior**: Checked if user has `admin` or `super_admin` role in Supabase  
**New behavior**: Any authenticated Clerk user can access dashboard

If you still see this error:
1. Clear browser cookies
2. Sign out completely from Clerk
3. Sign in again
4. Check that `.env.local` has correct Clerk keys
5. Restart the dev server

### Want to Re-enable Role Checking?

If you need to check Supabase roles for admin access, modify `proxy.ts`:

```typescript
import { checkUserRole } from './lib/supabase'

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const { userId } = await auth.protect()
    
    // Add Supabase role check
    const role = await checkUserRole(userId)
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return NextResponse.next()
})
```

**Note**: If you do this, you'll need to ensure admin users exist in Supabase `user_profiles` table with appropriate roles.
