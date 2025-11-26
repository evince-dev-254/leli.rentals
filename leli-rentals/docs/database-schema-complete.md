# Complete Database Schema Documentation

## Overview
This document outlines the complete Firestore database schema for the Leli Rentals application, including all collections, indexes, and security rules for storing user inputs.

## Collections and Their Purpose

### 1. User Management
- **`users`** - Core user authentication and profile data
- **`userProfiles`** - Extended user profile information
- **`userSettings`** - User preferences and settings

### 2. Listings and Rentals
- **`listings`** - Rental listings (vehicles, homes, equipment, etc.)
- **`properties`** - Property information (if different from listings)

### 3. User Interactions
- **`savedBookings`** - User's saved/favorited listings
- **`favorites`** - User's favorite listings
- **`bookings`** - Actual rental bookings
- **`user_interactions`** - Likes, saves, views, shares tracking
- **`listing_stats`** - Aggregated statistics for listings

### 4. Reviews and Ratings
- **`userReviews`** - User reviews and ratings
- **`applications`** - Rental applications

### 5. Communication and Support
- **`notifications`** - User notifications
- **`chatSessions`** - AI support chat sessions
- **`supportTickets`** - Customer support tickets
- **`support-messages`** - Support messages

### 6. Financial
- **`payments`** - Payment records
- **`agreements`** - Rental agreements

## Detailed Collection Schemas

### Users Collection (`users`)
```typescript
{
  id: string,                    // User ID
  email: string,                 // User email
  firstName?: string,            // First name
  lastName?: string,             // Last name
  displayName?: string,          // Display name
  phoneNumber?: string,          // Phone number
  profilePictureUrl?: string,    // Profile picture URL
  userType: 'renter' | 'owner' | 'both', // User type
  createdAt: Timestamp,          // Account creation date
  updatedAt: Timestamp,          // Last update date
  isEmailVerified: boolean,      // Email verification status
  provider: 'google' | 'email'   // Authentication provider
}
```

### Listings Collection (`listings`)
```typescript
{
  id: string,                    // Listing ID
  title: string,                 // Listing title
  description: string,           // Short description
  fullDescription?: string,       // Detailed description
  price: number,                 // Daily rental price
  category: string,              // Category (vehicles, homes, etc.)
  location: string,              // Location
  rating: number,                // Average rating
  reviews: number,               // Number of reviews
  image: string,                 // Primary image URL
  images: string[],              // All image URLs
  amenities: string[],           // Available amenities
  available: boolean,            // Availability status
  ownerId: string,               // Owner user ID
  owner: {                       // Owner information
    id: string,
    name: string,
    avatar: string,
    rating: number,
    verified: boolean
  },
  createdAt: Timestamp,          // Creation date
  updatedAt: Timestamp          // Last update date
}
```

### Saved Bookings Collection (`savedBookings`)
```typescript
{
  id: string,                    // Saved booking ID
  userId: string,               // User ID
  listingId: string,           // Listing ID
  listingTitle: string,         // Listing title
  listingImage: string,         // Listing image
  listingPrice: number,         // Listing price
  listingLocation: string,      // Listing location
  listingCategory: string,      // Listing category
  savedAt: Timestamp,           // When it was saved
  notes?: string,               // User notes
  tags?: string[]               // User tags
}
```

### Bookings Collection (`bookings`)
```typescript
{
  id: string,                   // Booking ID
  userId: string,               // Renter user ID
  ownerId: string,              // Owner user ID
  listingId: string,            // Listing ID
  listingTitle: string,         // Listing title
  listingImage: string,         // Listing image
  startDate: Timestamp,         // Rental start date
  endDate: Timestamp,           // Rental end date
  totalPrice: number,           // Total rental price
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed', // Booking status
  paymentStatus: 'pending' | 'paid' | 'refunded', // Payment status
  createdAt: Timestamp,         // Booking creation date
  updatedAt: Timestamp          // Last update date
}
```

### User Interactions Collection (`user_interactions`)
```typescript
{
  id: string,                   // Interaction ID
  userId: string,               // User ID
  listingId: string,            // Listing ID
  interactionType: 'like' | 'save' | 'view' | 'share', // Type of interaction
  timestamp: Timestamp,         // When interaction occurred
  metadata?: {                  // Additional data
    duration?: number,          // For views
    source?: string,           // For views
    platform?: string,         // For shares
    recipient?: string         // For shares
  }
}
```

### Listing Stats Collection (`listing_stats`)
```typescript
{
  id: string,                   // Stats ID
  listingId: string,            // Listing ID
  totalViews: number,           // Total view count
  totalLikes: number,           // Total like count
  totalSaves: number,           // Total save count
  totalShares: number,          // Total share count
  popularityScore: number,      // Calculated popularity score
  trendingScore: number,        // Calculated trending score
  lastUpdated: Timestamp        // Last stats update
}
```

### User Reviews Collection (`userReviews`)
```typescript
{
  id: string,                   // Review ID
  reviewerId: string,           // Reviewer user ID
  revieweeId: string,           // Reviewee user ID
  listingId?: string,           // Listing ID (if reviewing a listing)
  rating: number,               // Rating (1-5)
  comment?: string,             // Review comment
  createdAt: Timestamp          // Review creation date
}
```

### Notifications Collection (`notifications`)
```typescript
{
  id: string,                   // Notification ID
  userId: string,                // User ID
  type: 'booking' | 'message' | 'system' | 'promotion', // Notification type
  title: string,                // Notification title
  message: string,              // Notification message
  read: boolean,                // Read status
  data?: any,                   // Additional data
  createdAt: Timestamp          // Creation date
}
```

## Database Indexes

The following indexes have been configured in `firestore.indexes.json`:

### Saved Bookings Indexes
- `userId` + `savedAt` (DESC) - For getting user's saved bookings chronologically
- `userId` + `listingCategory` - For filtering saved bookings by category
- `userId` + `listingId` - For checking if a listing is saved

### Favorites Indexes
- `userId` + `createdAt` (DESC) - For getting user's favorites chronologically
- `userId` + `listingId` - For checking if a listing is favorited

### Bookings Indexes
- `userId` + `createdAt` (DESC) - For getting user's bookings chronologically
- `userId` + `status` - For filtering bookings by status
- `ownerId` + `createdAt` (DESC) - For getting owner's bookings

### Listings Indexes
- `category` + `createdAt` (DESC) - For filtering listings by category
- `category` + `price` (ASC) - For sorting listings by price within category
- `location` + `createdAt` (DESC) - For filtering listings by location
- `ownerId` + `createdAt` (DESC) - For getting owner's listings
- `available` + `createdAt` (DESC) - For filtering available listings

### User Interactions Indexes
- `userId` + `listingId` + `interactionType` - For checking specific interactions
- `userId` + `interactionType` + `timestamp` (DESC) - For getting user's interactions by type

### Listing Stats Indexes
- `listingId` - For getting stats for a specific listing
- `popularityScore` (DESC) - For getting popular listings
- `trendingScore` (DESC) - For getting trending listings

### Reviews Indexes
- `revieweeId` + `createdAt` (DESC) - For getting reviews for a user
- `reviewerId` + `createdAt` (DESC) - For getting reviews by a user

### Notifications Indexes
- `userId` + `read` + `createdAt` (DESC) - For getting unread notifications
- `userId` + `createdAt` (DESC) - For getting all user notifications

### Support Indexes
- `userId` + `createdAt` (DESC) - For getting user's chat sessions
- `userId` + `status` + `createdAt` (DESC) - For getting user's support tickets
- `status` + `createdAt` (DESC) - For getting all support tickets by status

## Security Rules

All collections have appropriate security rules in `firestore.rules`:

- **Users can only access their own data** (userId matches authenticated user)
- **Listings are readable by all authenticated users** but only writable by owners
- **User interactions are private** to each user
- **Reviews are readable by all** but only writable by reviewers
- **Support data is private** to each user

## Deployment Instructions

1. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Firestore Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Verify Deployment:**
   - Check Firebase Console for deployed rules and indexes
   - Test queries to ensure indexes are working
   - Monitor performance and adjust indexes as needed

## Performance Considerations

- **Composite indexes** are created for all common query patterns
- **Client-side sorting** is used where possible to reduce index requirements
- **Pagination** should be implemented for large result sets
- **Caching** strategies should be considered for frequently accessed data

## Data Migration

If you need to migrate existing data:
1. Export existing data from current storage
2. Transform data to match new schema
3. Import data to Firestore collections
4. Update application code to use new collections
5. Test all functionality thoroughly

## Monitoring and Maintenance

- **Monitor query performance** in Firebase Console
- **Review index usage** and remove unused indexes
- **Update rules** as new features are added
- **Backup data** regularly
- **Monitor costs** and optimize queries for efficiency
