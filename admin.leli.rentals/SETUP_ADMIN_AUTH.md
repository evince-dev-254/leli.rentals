# Admin Authentication Setup Guide

This guide will help you configure **separate Clerk authentication** for the admin dashboard.

## Why Separate Authentication?

The admin dashboard uses **different Clerk keys** from the main application for security isolation:
- **Admin users** are managed in a separate Clerk project
- **Main app users** remain in the main Clerk project or Supabase
- Both apps share the **same Supabase database** for data access

---

## Step 1: Create a Separate Clerk Project

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click **"Add application"** or **"New application"**
3. Fill in the details:
   - **Name**: "Leli Admin Dashboard"
   - **Application type**: Choose "Regular web app"
4. After creation, you'll see your keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`
5. **Keep this tab open** - you'll need these keys in the next step

### Configure the Clerk Admin Project

In your new Clerk project settings:

1. **Navigate to**: Paths → Sign-in
   - Set the sign-in URL: `/sign-in`
   - Set the sign-up URL: `/sign-up`
   
2. **Navigate to**: Paths → After sign-in/sign-up
   - Set redirect URL: `/dashboard`

3. **Navigate to**: Authentication → Email & Phone
   - Enable **Email address** authentication
   - (Optional) Enable other methods as needed

---

## Step 2: Configure Admin Dashboard

### Update `.env.local` in Admin App

Navigate to the admin dashboard directory and create/update `.env.local`:

```bash
cd "c:\Users\evince\OneDrive\Desktop\New folder\OneDrive\Videos\leli\admin.leli.rentals"
```

Create or edit `.env.local` with the following content:

```env
# ============================================
# CLERK AUTHENTICATION (ADMIN PROJECT - SEPARATE KEYS)
# ============================================
# Use the keys from your NEW admin Clerk project
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_admin_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_admin_clerk_secret_key_here

# ============================================
# SUPABASE (SAME AS MAIN APP)
# ============================================
# Copy these from your main app's .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# API PROXY CONFIGURATION
# ============================================
# Points to the main website API
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# Shared secret token for admin → main API authentication
# This MUST match the token in your main app
ADMIN_INTERNAL_TOKEN=super-secret-string

# Admin dashboard URL
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001
```

**Replace the placeholder values:**
- `pk_test_your_admin_clerk_publishable_key_here` → Your admin Clerk publishable key
- `sk_test_your_admin_clerk_secret_key_here` → Your admin Clerk secret key
- Supabase credentials → Copy from main app
- `super-secret-string` → Create a strong random string (or keep this for local dev)

---

## Step 3: Configure Main Application

### Update `.env.local` in Main App

Navigate to the main app directory:

```bash
cd "c:\Users\evince\OneDrive\Desktop\New folder\OneDrive\Videos\leli\leli-rentals"
```

Ensure your `.env.local` includes the `ADMIN_INTERNAL_TOKEN`:

```env
# ... your existing variables ...

# Admin dashboard shared secret (must match admin app)
ADMIN_INTERNAL_TOKEN=super-secret-string
```

> **Important**: The `ADMIN_INTERNAL_TOKEN` must be **identical** in both apps.

---

## Step 4: Restart Development Servers

After updating the environment files, restart both development servers:

### Terminal 1 - Main App
```bash
cd "c:\Users\evince\OneDrive\Desktop\New folder\OneDrive\Videos\leli\leli-rentals"
# Press Ctrl+C to stop if running
npm run dev
```

### Terminal 2 - Admin App
```bash
cd "c:\Users\evince\OneDrive\Desktop\New folder\OneDrive\Videos\leli\admin.leli.rentals"
# Press Ctrl+C to stop if running
npm run dev
```

---

## Step 5: Test the Setup

### Test Admin Authentication

1. Open your browser and navigate to: `http://localhost:3001`
2. You should see the Clerk sign-in page
3. Click **"Sign up"** to create a new admin account
4. Enter an email and password
5. After signing up, you should be redirected to `/dashboard`
6. Verify you can see the admin dashboard

### Test Main App

1. Open a new tab and navigate to: `http://localhost:3000`
2. The main app should work independently
3. Its authentication is separate from the admin

### Verify Data Access

1. In the admin dashboard, navigate to **Users** or **Listings**
2. Verify that data loads from Supabase
3. Both apps should access the same database

---

## Troubleshooting

### "Clerk is not configured" Error

**Problem**: You see an error about missing Clerk configuration.

**Solution**: 
- Double-check that `.env.local` exists in the admin app directory
- Verify the Clerk keys are correct (no extra spaces)
- Restart the dev server after adding environment variables

### "Supabase not configured" Warning

**Problem**: Console shows Supabase warnings.

**Solution**:
- Copy the exact Supabase URL and anon key from your main app
- Make sure there are no line breaks in the anon key
- Restart the dev server

### Redirect Issues

**Problem**: After sign-in, you're not redirected to `/dashboard`.

**Solution**:
- Go to your Clerk dashboard
- Navigate to **Paths** settings
- Set the after sign-in URL to `/dashboard`

---

## Production Deployment

When deploying to production:

1. **Create a production Clerk project** (or use production keys from the same project)
2. Update environment variables in your hosting platform (Vercel, etc.):
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api
   ADMIN_INTERNAL_TOKEN=cwb6Rj2XlYFIfsKrQIFuG1QjScD85bdYpqGT3dsuV+w=
   NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals
   ```
3. Use a **strong, random token** for `ADMIN_INTERNAL_TOKEN` in production
4. Ensure the token matches in both apps

---

## Security Notes

✅ **Admin and main app use separate authentication systems**  
✅ **Admin users cannot access the main app (and vice versa)**  
✅ **Both apps share the same database for data management**  
✅ **API proxy is secured with a shared internal token**  

**Remember**: Never commit `.env.local` to version control!
