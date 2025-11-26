# User Interactions Database Schema

## Collections

### 1. user_interactions
Stores all user interactions with listings (likes, saves, views, shares)

```typescript
interface UserInteraction {
  id: string
  userId: string
  listingId: string
  interactionType: 'like' | 'save' | 'view' | 'share'
  timestamp: Date
  metadata?: {
    // For views
    duration?: number // time spent viewing in seconds
    source?: string // where they came from (search, category, etc.)
    
    // For shares
    platform?: string // social media platform or method
    recipient?: string // who they shared with
    
    // For likes/saves
    notes?: string // user notes about the listing
  }
}
```

### 2. listing_stats
Aggregated statistics for each listing

```typescript
interface ListingStats {
  id: string
  listingId: string
  totalViews: number
  totalLikes: number
  totalSaves: number
  totalShares: number
  uniqueViewers: number
  lastUpdated: Date
  
  // Time-based stats
  viewsToday: number
  viewsThisWeek: number
  viewsThisMonth: number
  
  // Popularity metrics
  popularityScore: number // calculated based on interactions
  trendingScore: number // recent activity boost
}
```

### 3. user_favorites
User's saved/favorited listings

```typescript
interface UserFavorite {
  id: string
  userId: string
  listingId: string
  createdAt: Date
  notes?: string
  tags?: string[] // user-defined tags for organization
}
```

### 4. listing_details_views
Detailed view tracking for analytics

```typescript
interface ListingDetailsView {
  id: string
  userId: string
  listingId: string
  viewedAt: Date
  sessionId: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
}
```

## API Endpoints

### Interactions API
- `POST /api/interactions/like` - Like/unlike a listing
- `POST /api/interactions/save` - Save/unsave a listing
- `POST /api/interactions/view` - Track listing view
- `POST /api/interactions/share` - Track listing share

### User Data API
- `GET /api/user/favorites` - Get user's saved listings
- `GET /api/user/interactions` - Get user's interaction history
- `GET /api/listings/:id/stats` - Get listing statistics

### Analytics API
- `GET /api/analytics/popular` - Get most popular listings
- `GET /api/analytics/trending` - Get trending listings
- `GET /api/analytics/user-activity` - Get user activity summary
