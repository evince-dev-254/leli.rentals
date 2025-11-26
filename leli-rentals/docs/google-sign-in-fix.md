# Google Sign-In Account Type Selection Fix

## Problem
When users sign in with Google (or any OAuth method), the account type was automatically being set to 'renter' instead of allowing users to choose.

## Solution
Implemented the following fixes:

### 1. Created Clerk Webhook Handler
- **File**: `app/api/webhooks/clerk/route.ts`
- **Purpose**: Intercepts new user creation events and sets `accountType: 'not_selected'` instead of defaulting to 'renter'
- **Note**: Requires `CLERK_WEBHOOK_SECRET` environment variable and webhook setup in Clerk dashboard

### 2. Updated Account Type Defaults
Changed all places where account type defaulted to 'renter' to use 'not_selected' instead:

- `app/page.tsx` - Homepage now redirects users without account type to `/get-started`
- `app/profile/page.tsx` - Profile page defaults to 'not_selected'
- `app/profile/switch-account/page.tsx` - Switch account page checks both metadata locations
- `app/get-started/page.tsx` - Enhanced account type checking with Clerk metadata

### 3. Enhanced Redirect Logic
- Homepage (`app/page.tsx`) now checks if user has account type on load
- If account type is missing or 'not_selected', redirects to `/get-started`
- Get-started page checks both localStorage and Clerk metadata for account type

## Setup Instructions

### Option 1: Using Webhook (Recommended)
1. Install svix package (if not already installed):
   ```bash
   npm install svix
   ```

2. Set up webhook in Clerk Dashboard:
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Select event: `user.created`
   - Copy the webhook secret
   - Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_...`

### Option 2: Client-Side Only (Current Implementation)
The current code already handles this client-side:
- Users are redirected to `/get-started` if they don't have an account type
- Account type selection is required before accessing main features

## Testing
1. Sign in with Google
2. Should be redirected to `/get-started` page
3. Must select either "Renter" or "Owner" account type
4. After selection, redirected to appropriate dashboard

## Files Modified
- `app/api/webhooks/clerk/route.ts` (new)
- `app/page.tsx`
- `app/profile/page.tsx`
- `app/profile/switch-account/page.tsx`
- `app/get-started/page.tsx`

## Future Improvements
- Add account type selection modal on first login
- Show account type selection in onboarding flow
- Prevent access to certain pages until account type is selected

