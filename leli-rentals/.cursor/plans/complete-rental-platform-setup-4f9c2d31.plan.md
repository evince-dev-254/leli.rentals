<!-- 4f9c2d31-35e0-4866-b5f2-53c1fd10f435 69a05d80-b0ab-479f-a0f4-e895edf5f0cd -->
# Complete Rental Platform Setup

## 1. Google Maps Setup & Integration

### Step 1.1: Get Google Maps API Key (Manual)

Guide user to:

1. Go to https://console.cloud.google.com/
2. Create new project "Leli Rentals"
3. Enable APIs: Maps JavaScript API, Places API, Geocoding API
4. Create API key in Credentials section
5. Restrict key to your domain (localhost:3000 for dev)

### Step 1.2: Add Google Maps to Environment

- **File**: `.env.local`
- Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`

### Step 1.3: Implement Location Autocomplete

- **File**: `app/dashboard/owner/setup/page.tsx` (Step 3 - Location)
- Replace text input with Google Places Autocomplete
- Extract formatted_address, lat/lng, place_id
- Save to Clerk metadata: `locationInfo.coordinates`, `locationInfo.placeId`

- **File**: `app/list-item/page.tsx`
- Update location input with same autocomplete component
- Store precise coordinates for each listing

### Step 1.4: Create Reusable Component

- **New File**: `components/google-maps-autocomplete.tsx`
- Props: onPlaceSelect, defaultValue, placeholder
- Uses @react-google-maps/api library
- Returns full place data object

## 2. Stripe Account Setup & Integration

### Step 2.1: Create Stripe Account (Manual)

Guide user to:

1. Go to https://stripe.com and sign up
2. Complete business verification
3. Get API keys from Dashboard > Developers > API keys
4. Copy Publishable key and Secret key

### Step 2.2: Add Stripe to Environment

- **File**: `.env.local`
- Add:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```


### Step 2.3: Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Step 2.4: Implement Subscription Payment

- **New File**: `lib/stripe-client.ts`
- Initialize Stripe with publishable key
- Export loadStripe function

- **New File**: `app/api/create-subscription/route.ts`
- Accept packageId (basic, professional, enterprise)
- Create Stripe Customer with user email
- Create Subscription with price ID
- Return client_secret for payment

- **File**: `app/dashboard/owner/billing/page.tsx`
- Add Stripe Elements checkout flow
- On package selection, call API to create subscription
- Redirect to payment confirmation
- Update Clerk metadata on success

### Step 2.5: Set Up Payout System (Stripe Connect)

- **New File**: `app/api/create-connect-account/route.ts`
- Create Stripe Connect Express account for owners
- Store account_id in Clerk metadata

- **File**: `app/dashboard/owner/setup/page.tsx` (Step 2)
- After form submission, create Connect account
- Redirect to Stripe onboarding flow
- Return to dashboard on completion

### Step 2.6: Webhook Handler

- **New File**: `app/api/webhooks/stripe/route.ts`
- Handle events: customer.subscription.created, updated, deleted
- Handle payment_intent.succeeded for payouts
- Update user metadata based on subscription status

## 3. International Phone Input

### Step 3.1: Install Package

```bash
npm install react-phone-number-input
```

### Step 3.2: Update Owner Setup Form

- **File**: `app/dashboard/owner/setup/page.tsx`
- Import PhoneInput from react-phone-number-input
- Replace phone text input in Step 1
- Add CSS import: `import 'react-phone-number-input/style.css'`
- Validate format before submission

### Step 3.3: Add to Profile Page

- **File**: `app/profile/page.tsx`
- Update phone number edit with PhoneInput
- Save E.164 format to Clerk metadata

## 4. Auto-Population from Clerk Data

### Step 4.1: Profile Auto-Sync

- **File**: `app/profile/page.tsx`
- On component mount, check if profile fields are empty
- If empty, populate from Clerk user object:
  - firstName → user.firstName
  - lastName → user.lastName
  - email → user.emailAddresses[0].emailAddress
  - phone → user.phoneNumbers[0].phoneNumber
  - profilePicture → user.imageUrl

### Step 4.2: Owner Setup Pre-fill

- **File**: `app/dashboard/owner/setup/page.tsx`
- Pre-fill businessName with user.fullName
- Pre-fill accountHolderName with user.fullName
- Pre-fill phoneNumber from user.phoneNumbers

### Step 4.3: Listing Creation Pre-fill

- **File**: `app/list-item/page.tsx`
- Auto-fill owner contact info from Clerk metadata
- Pre-select location from owner's primary location

## 5. Enhanced Listing Creation

### Step 5.1: Add Category Selection

- **File**: `app/list-item/page.tsx`
- Categories already exist in code (lines 40-50)
- Ensure category dropdown is properly wired
- Add subcategory based on main category selection

### Step 5.2: Draft & Preview System

- **File**: `app/list-item/page.tsx`
- Add "Save as Draft" button (saves to localStorage or DB with status: 'draft')
- Add "Preview" button that shows modal with listing card preview
- Only "Publish" button updates status to 'active' and makes visible

### Step 5.3: Owner-Only Access Enforcement

- Already implemented in `middleware.ts` (lines 31-36)
- Route `/list-item` is protected for owners only
- Verify middleware redirects renters properly

## 6. Document Verification & Auto-Suspension

### Step 6.1: Mock Verification Process

- **File**: `app/dashboard/owner/verification/page.tsx`
- On document upload, set status to 'pending'
- After 2 seconds (mock), auto-approve:
  - Update metadata: `verificationStatus: 'approved'`
  - Set `isVerified: true`
  - Remove `needsVerification` flag

### Step 6.2: Suspension Check Service

- **New File**: `lib/suspension-checker.ts`
- Function to check if verification deadline passed
- Calculate days remaining from metadata.verificationDeadline
- If deadline passed and not verified:
  - Set `accountSuspended: true`
  - Set `suspensionReason: 'verification_expired'`
  - Trigger email notification

### Step 6.3: Auto-Suspension Cron Job

- **New File**: `app/api/cron/check-suspensions/route.ts`
- Query users where `needsVerification: true`
- Check if deadline < current date
- Suspend accounts and send emails
- In production, set up Vercel Cron to run daily

### Step 6.4: Email Notification

- **New File**: `lib/email-service.ts`
- Use Resend or SendGrid for emails
- Templates for: suspension warning (2 days), suspension notice
- Send to user.emailAddresses[0].emailAddress

### Step 6.5: Suspension Banner

- **File**: `components/header.tsx`
- Check user.publicMetadata.accountSuspended
- If true, show red banner: "Account suspended - verify your ID"
- Block access to owner features (middleware)

## 7. Unused Pages Audit

### Step 7.1: Create Audit Report

- **New File**: `scripts/audit-pages.js`
- Scan all page.tsx files in app directory
- Check for imports/usage in other files
- Generate markdown report with:
  - Unused pages (no imports found)
  - Duplicate functionality pages
  - Recommendations for deletion

### Step 7.2: Potentially Unused Pages

Based on current structure, likely candidates:

- `app/onboarding/page.tsx` (duplicate of get-started)
- `app/onboarding/account-type/page.tsx` (old flow, replaced by get-started)
- `app/verification/page.tsx` (duplicate of dashboard/owner/verification)
- `app/profile/create-listing/page.tsx` (duplicate of list-item)
- `app/test-integration/page.tsx` (test file)
- `app/categories/page.tsx` (if not linked anywhere)

### Step 7.3: Generate Report

Run script and save output to `UNUSED_PAGES_REPORT.md` for user review

## 8. Final Integration & Testing

### Step 8.1: Environment Variables Summary

Create `.env.local.example` with all required keys:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
```

### Step 8.2: Update Documentation

- Update README.md with setup instructions
- Add section for API key configuration
- Document owner vs renter flows

### Step 8.3: Test Critical Flows

1. Sign up as renter → free trial → browse listings
2. Sign up as owner → setup → billing → verification → create listing
3. Account switching → verify data preservation
4. Suspension check → verify email sent

### To-dos

- [ ] Update sign-up/sign-in redirects and create get-started account selection page
- [ ] Create owner setup form with business info, payout details, and location
- [ ] Implement owner billing packages page with 3 tiers and Stripe integration
- [ ] Add renter free trial system with benefits tracking
- [ ] Build document upload verification with admin review and auto-suspension
- [ ] Integrate Google Maps Autocomplete and Geolocation for location selection
- [ ] Set up Stripe payment processing, subscriptions, and payout system
- [ ] Add international phone input with country code selector
- [ ] Update list-item page with category selection and owner-only access
- [ ] Auto-populate profile from Clerk user data and sync updates
- [ ] Add route protection for owner-only and renter-only pages
- [ ] Audit and delete unused pages, verify duplicates