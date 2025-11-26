# Admin Dashboard API Setup

## ✅ Fixed Issues

### 1. React Hooks Error in ProfilePage
- **Issue**: Conditional `useEffect` hooks causing "Rendered more hooks than during the previous render" error
- **Fix**: Moved all `useEffect` hooks to be called unconditionally before any conditional returns
- **Location**: `app/profile/page.tsx`

### 2. Admin API Routes
All required admin API endpoints are already implemented and ready to use:

## 📋 Available Admin API Endpoints

### 1. Get All Users
- **Endpoint**: `GET /api/admin/users/list`
- **Description**: Returns list of all platform users
- **Response Format**:
```json
{
  "success": true,
  "users": [...],
  "totalCount": 100
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required (currently allows all authenticated users for development)

### 2. Search User
- **Endpoint**: `POST /api/admin/search-user`
- **Description**: Search for a user by email address
- **Request Body**: 
```json
{
  "email": "user@example.com"
}
```
- **Response Format**:
```json
{
  "success": true,
  "user": {
    "id": "user_xxx",
    "firstName": "John",
    "lastName": "Doe",
    "emailAddresses": [...],
    "phoneNumbers": [...],
    "createdAt": "...",
    "unsafeMetadata": {...},
    "publicMetadata": {...}
  }
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required

### 3. Get All Listings
- **Endpoint**: `GET /api/admin/listings`
- **Description**: Returns list of all platform listings with owner information
- **Response Format**:
```json
{
  "success": true,
  "listings": [...],
  "total": 50
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required

### 4. Get All Bookings
- **Endpoint**: `GET /api/admin/bookings`
- **Description**: Returns list of all platform bookings with customer and listing information
- **Response Format**:
```json
{
  "success": true,
  "bookings": [...],
  "total": 75
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required

### 5. Platform Statistics
- **Endpoint**: `GET /api/admin/stats`
- **Description**: Returns comprehensive platform statistics
- **Response Format**:
```json
{
  "users": {
    "total": 1000,
    "owners": 400,
    "renters": 600,
    "verified": 350,
    "pendingVerification": 25
  },
  "listings": {
    "total": 500,
    "published": 450,
    "draft": 30,
    "archived": 20,
    "categories": {...},
    "recent": 50
  },
  "bookings": {
    "total": 750,
    "pending": 10,
    "confirmed": 50,
    "completed": 680,
    "cancelled": 10,
    "recent": 75
  },
  "revenue": {
    "total": 150000,
    "monthly": 15000,
    "weekly": 3500,
    "averageBooking": 200
  },
  "growth": {
    "usersGrowth": 0,
    "listingsGrowth": 0,
    "bookingsGrowth": 0,
    "revenueGrowth": 0
  }
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required

### 6. Approve Verification
- **Endpoint**: `POST /api/admin/verifications/approve/:userId`
- **Description**: Approve a user's ID verification
- **URL Parameters**: `userId` (string)
- **Response Format**:
```json
{
  "success": true,
  "message": "Verification approved successfully"
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required
- **Features**:
  - Validates that required documents are submitted
  - Ensures status is 'pending' before approval
  - Sends email notification
  - Sends in-app notification

### 7. Reject Verification
- **Endpoint**: `POST /api/admin/verifications/reject/:userId`
- **Description**: Reject a user's ID verification with a reason
- **URL Parameters**: `userId` (string)
- **Request Body**:
```json
{
  "reason": "Documents are unclear"
}
```
- **Response Format**:
```json
{
  "success": true,
  "message": "Verification rejected"
}
```
- **CORS**: ✅ Enabled
- **Authentication**: ✅ Required
- **Features**:
  - Stores rejection reason
  - Sends email notification with reason
  - Sends in-app notification

## 🔧 Configuration

### CORS Setup
All admin API endpoints include CORS headers via `lib/admin-cors.ts`:
- Allows requests from admin dashboard (`NEXT_PUBLIC_ADMIN_DASHBOARD_URL`)
- Allows requests from main site (`NEXT_PUBLIC_APP_URL`)
- Allows localhost for development
- Includes proper headers for credentials

### Environment Variables
Make sure these are set in your `.env.local`:

```env
# Main Website URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Dashboard URL (for CORS)
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3001

# Clerk Authentication (shared between both sites)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 📝 API Response Format

All endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {...},  // or "users", "listings", "bookings", etc.
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional additional details"
}
```

## 🚀 Usage from Admin Dashboard

The admin dashboard should make requests like:

```typescript
// Example: Fetch all users
const response = await fetch('http://localhost:3000/api/admin/users/list', {
  method: 'GET',
  credentials: 'include', // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
})

const data = await response.json()
if (data.success) {
  console.log(data.users)
}
```

## 🔒 Authentication

Currently, all endpoints check for authentication but allow all authenticated users (development mode). To enable admin-only access:

1. Uncomment the admin check in each route file
2. Set user role in Clerk metadata:
```typescript
await client.users.updateUser(userId, {
  publicMetadata: {
    role: 'admin'
  }
})
```

## 🧪 Testing

All endpoints support:
- ✅ CORS preflight (OPTIONS requests)
- ✅ Authentication via Clerk
- ✅ Error handling
- ✅ Consistent response format

## 📦 Database Queries

The APIs query:
- **Clerk**: User data, metadata, authentication
- **Supabase**: Listings, bookings, user profiles, statistics

## ⚠️ Notes

1. **Search User**: Updated to support both `email` and `emailAddress` in request body for backward compatibility
2. **Authentication**: Currently relaxed for development - restrict to admins only in production
3. **CORS**: Configured to allow requests from admin dashboard subdomain in production
4. **Error Handling**: All endpoints include try-catch blocks and proper error responses

## 🔄 Next Steps

1. ✅ React Hooks error fixed
2. ✅ All admin API endpoints ready
3. ✅ CORS configured
4. ⏳ Test all endpoints from admin dashboard
5. ⏳ Enable admin role checking for production

