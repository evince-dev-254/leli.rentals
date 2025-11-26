# Production API Configuration Guide

This guide explains how to configure the APIs for production deployment where:
- **Main Application**: `www.leli.rentals`
- **Admin Dashboard**: `https://admin.leli.rentals/`

## Environment Variables

### Main Application (www.leli.rentals)

Create or update `.env.production` or set these in your hosting provider:

```env
# Main Application URL
NEXT_PUBLIC_APP_URL=https://www.leli.rentals

# Admin Dashboard URL (for CORS)
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
SUPPORT_EMAIL=support@leli.rentals
```

### Admin Dashboard (admin.leli.rentals)

Create or update `.env.production` in the admin dashboard project:

```env
# Main Application API URL (where APIs are hosted)
NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api

# Admin Dashboard URL
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals

# Clerk Authentication (same keys as main app)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# For API requests
NEXT_PUBLIC_APP_URL=https://www.leli.rentals
```

## API Endpoints Configuration

The admin dashboard should make requests to the main application's APIs:

### Base URL
```
https://www.leli.rentals/api
```

### Available Admin API Endpoints

1. **Get All Users**
   ```
   GET https://www.leli.rentals/api/admin/users/list
   ```

2. **Search User**
   ```
   POST https://www.leli.rentals/api/admin/search-user
   Body: { "email": "user@example.com" }
   ```

3. **Get All Listings**
   ```
   GET https://www.leli.rentals/api/admin/listings
   ```

4. **Get All Bookings**
   ```
   GET https://www.leli.rentals/api/admin/bookings
   ```

5. **Platform Statistics**
   ```
   GET https://www.leli.rentals/api/admin/stats
   ```

6. **Approve Verification**
   ```
   POST https://www.leli.rentals/api/admin/verifications/approve/:userId
   ```

7. **Reject Verification**
   ```
   POST https://www.leli.rentals/api/admin/verifications/reject/:userId
   Body: { "reason": "rejection reason" }
   ```

## CORS Configuration

The CORS configuration in `lib/admin-cors.ts` is set up to allow:
- ✅ Requests from `https://admin.leli.rentals` to `https://www.leli.rentals/api`
- ✅ Same-origin requests from `https://www.leli.rentals`
- ✅ Localhost for development

## Example API Client Setup (Admin Dashboard)

```typescript
// lib/admin-api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_API_URL || 'https://www.leli.rentals/api'

export async function fetchAdminUsers() {
  const response = await fetch(`${API_BASE_URL}/admin/users/list`, {
    method: 'GET',
    credentials: 'include', // Important for CORS with credentials
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  
  return response.json()
}

export async function searchUser(email: string) {
  const response = await fetch(`${API_BASE_URL}/admin/search-user`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to search user')
  }
  
  return response.json()
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  
  return response.json()
}

export async function approveVerification(userId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/approve/${userId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to approve verification')
  }
  
  return response.json()
}

export async function rejectVerification(userId: string, reason: string) {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/reject/${userId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to reject verification')
  }
  
  return response.json()
}
```

## Testing Production Configuration

### 1. Test CORS from Admin Dashboard

Open browser console on `https://admin.leli.rentals` and run:

```javascript
fetch('https://www.leli.rentals/api/admin/stats', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err))
```

### 2. Verify API Responses

All endpoints should return data in this format:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

Or for errors:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production (`https://`)
2. **CORS**: Only allow specific origins (admin.leli.rentals)
3. **Authentication**: All endpoints require Clerk authentication
4. **Environment Variables**: Never commit `.env.production` to git
5. **Rate Limiting**: Consider implementing rate limiting on API endpoints
6. **API Keys**: Rotate keys regularly

## Deployment Checklist

### Main Application (www.leli.rentals)
- [ ] Set `NEXT_PUBLIC_APP_URL=https://www.leli.rentals`
- [ ] Set `NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals`
- [ ] Use production Clerk keys (`pk_live_...`, `sk_live_...`)
- [ ] Configure production database connection
- [ ] Set production email service keys
- [ ] Enable HTTPS/SSL
- [ ] Test API endpoints are accessible

### Admin Dashboard (admin.leli.rentals)
- [ ] Set `NEXT_PUBLIC_MAIN_API_URL=https://www.leli.rentals/api`
- [ ] Set `NEXT_PUBLIC_ADMIN_DASHBOARD_URL=https://admin.leli.rentals`
- [ ] Use production Clerk keys (same as main app)
- [ ] Test API connections to main app
- [ ] Enable HTTPS/SSL
- [ ] Verify CORS is working

## Troubleshooting

### CORS Errors

**Problem**: Browser shows CORS policy error

**Solution**: 
- Verify `NEXT_PUBLIC_ADMIN_DASHBOARD_URL` is set correctly in main app
- Check that admin dashboard URL matches exactly (including https://)
- Ensure `credentials: 'include'` is set in fetch requests

### Authentication Errors

**Problem**: API returns 401 Unauthorized

**Solution**:
- Verify Clerk keys are the same in both apps
- Check that authentication cookies are being sent
- Ensure `withCredentials: true` or `credentials: 'include'` is set

### API Not Found (404)

**Problem**: API endpoints return 404

**Solution**:
- Verify `NEXT_PUBLIC_MAIN_API_URL` includes `/api` at the end
- Check that Next.js API routes are deployed correctly
- Verify route file paths match the endpoints

## Support

For issues:
1. Check browser console for CORS errors
2. Check Network tab for failed requests
3. Verify environment variables are set correctly
4. Test API endpoints directly with Postman/curl
5. Check server logs for errors

