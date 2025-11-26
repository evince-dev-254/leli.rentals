# Environment Variables

Create a `.env.local` file for local development or set these in your deployment platform (Vercel, etc.) for production.

## Local Development

```env
# Clerk Authentication (admin project keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Main Website API URL (local)
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# Shared token used by admin → main API proxy
ADMIN_INTERNAL_TOKEN=super-secret-string

# Admin Dashboard URL (for CORS reference)
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

## Production

For production deployment, set these environment variables in your hosting platform:

```env
# Clerk Authentication (production keys for admin portal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Main Website API URL (production)
NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api

# Shared token used by admin → main API proxy (must match main app ADMIN_INTERNAL_TOKEN)
ADMIN_INTERNAL_TOKEN=cwb6Rj2XlYFIfsKrQIFuG1QjScD85bdYpqGT3dsuV+w=

# Admin Dashboard URL (production domain)
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals
```

**Important**: The admin dashboard at `https://admin.leli.rentals` connects to the main app API at `https://www.leli.rentals/api`

## Setup Instructions

1. Copy this file to `.env.local` in the project root
2. Replace all placeholder values (`xxx`) with your actual Clerk keys
3. Set `NEXT_PUBLIC_MAIN_API_URL` to point to your main website's API endpoint
4. For local development, ensure your main site runs on port 3000
5. For production, use the production URLs

## Notes

- The admin Clerk project can be separate from the main site
- The API URL should point to `/api` endpoint of the main site
- `ADMIN_INTERNAL_TOKEN` must match the `ADMIN_INTERNAL_TOKEN` configured in the main app so the proxy can authenticate
- CORS must be configured on the main site to allow requests from the admin dashboard domain

