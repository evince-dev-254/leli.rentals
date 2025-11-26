# API Setup Guide

This guide explains how to connect the Leli Admin Dashboard to the main website backend to get real-time data.

## Overview

The Admin Dashboard connects to the main website's backend API to fetch and manage data.

- **Production**: Admin dashboard at `https://admin.leli.rentals` connects to main app at `https://www.leli.rentals/api`
- **Development**: Dashboard at `http://localhost:3001` connects to main app at `http://localhost:3000/api`

The API client automatically detects the environment and uses the appropriate URL.

## Prerequisites

1. **Main Website Running**: The main Leli Rentals website must be running and accessible
2. **Backend API**: The main site's backend API must be running on the configured port
3. **Shared Authentication**: Both sites use the same Clerk authentication keys

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication (same as main site)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Main Website API URL
# For local development:
NEXT_PUBLIC_MAIN_API_URL=http://localhost:3000/api

# For production:
# NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api

# Admin Dashboard URL (for CORS reference)
# For local development:
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001

# For production:
# NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals
```

### 2. Backend Configuration

Your main website backend needs to expose the following API endpoints:

#### Required Endpoints

1. **Get All Users**
   - `GET /api/admin/users/list`
   - Returns: List of all platform users

2. **Search User**
   - `POST /api/admin/search-user`
   - Body: `{ "email": "user@example.com" }`
   - Returns: User details

3. **Get All Listings**
   - `GET /api/admin/listings`
   - Returns: List of all platform listings

4. **Get All Bookings**
   - `GET /api/admin/bookings`
   - Returns: List of all platform bookings

5. **Platform Statistics**
   - `GET /api/admin/stats`
   - Returns: Platform statistics (users, bookings, revenue, etc.)

6. **Approve Verification**
   - `POST /api/admin/verifications/approve/:userId`
   - Returns: Success confirmation

7. **Reject Verification**
   - `POST /api/admin/verifications/reject/:userId`
   - Body: `{ "reason": "rejection reason" }`
   - Returns: Success confirmation

## Running the Setup

### Step 1: Start the Main Website

```bash
# Navigate to the main website directory
cd ../leli-rentals  # or your main site directory

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The main website should now be running at `http://localhost:3000`

### Step 2: Configure the Admin Dashboard

```bash
# In the admin dashboard directory
cd leli-admin-dashboard

# Create .env.local if you haven't already
cp ENV_EXAMPLE.md .env.local

# Edit .env.local with your actual Clerk keys and API URL
```

### Step 3: Start the Admin Dashboard

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The admin dashboard should now be running at `http://localhost:3001`

### Step 4: Verify Connection

1. Open the admin dashboard at `http://localhost:3001`
2. Sign in with your Clerk credentials
3. Navigate to the dashboard
4. You should see real-time data loading from the main website API

## Troubleshooting

### Network Errors

**Problem**: Console shows "Network Error" or "API Network Error"

**Solutions**:
1. Verify the main website is running at `http://localhost:3000`
2. Check that `NEXT_PUBLIC_MAIN_API_URL` in `.env.local` is correct
3. Ensure the backend API endpoints exist and are accessible
4. Restart both servers

### CORS Errors

**Problem**: Browser console shows CORS policy errors

**Solution**: Configure CORS on the main website to allow requests from the admin dashboard domain.

Example for Express.js:
```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'https://admin.leli.rentals'],
  credentials: true
}))
```

### Authentication Issues

**Problem**: API requests are rejected with 401/403 errors

**Solutions**:
1. Ensure both sites use the same Clerk keys
2. Verify `withCredentials: true` in the API client
3. Check that authentication cookies are being sent
4. Ensure Clerk is properly configured on both sites

### No Data Showing

**Problem**: Dashboard loads but shows "0" or empty data

**Solutions**:
1. Check the Network tab in browser DevTools to see API responses
2. Verify the backend API endpoints return data in the expected format
3. Check browser console for specific error messages
4. Ensure database has data in the main website

## API Response Format

All API endpoints should return data in this format:

```typescript
// Success response
{
  success: true,
  users: [...],      // or listings, bookings, stats, etc.
  message?: string
}

// Error response
{
  success: false,
  error: "Error message",
  message?: string
}
```

## Production Deployment

### Production URLs

- **Admin Dashboard**: `https://admin.leli.rentals`
- **Main App API**: `https://www.leli.rentals/api`

### Vercel Environment Variables

Set these in your Vercel project settings:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_key
NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals
```

### Critical Steps

1. **Configure CORS on Main App**: Update CORS settings on `www.leli.rentals` to allow requests from `https://admin.leli.rentals`

   Example Express.js CORS configuration:
   ```javascript
   app.use(cors({
     origin: [
       'https://admin.leli.rentals',
       'http://localhost:3001' // Keep for testing
     ],
     credentials: true
   }))
   ```

2. **SSL/HTTPS**: Both sites must use HTTPS in production
3. **Clerk Keys**: Use production Clerk keys (pk_live_* and sk_live_*)
4. **Cookie Domain**: Ensure Clerk cookies work across subdomains if needed

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive configuration
- Implement proper authentication and authorization on backend API
- Use HTTPS in production
- Implement rate limiting on API endpoints
- Add proper logging and monitoring

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Axios Documentation](https://axios-http.com/docs/intro)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify network requests in DevTools
3. Check server logs on both main site and admin dashboard
4. Ensure all environment variables are correctly set

