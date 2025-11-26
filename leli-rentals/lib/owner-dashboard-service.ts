import { supabase } from './supabase'

export interface OwnerStats {
  totalEarnings: number
  totalBookings: number
  activeListings: number
  rating: number
}

export interface OwnerListing {
  id: string
  title: string
  category: string
  price: number
  status: 'active' | 'inactive' | 'pending' | 'published' | 'draft'
  bookings: number
  rating: number
  views: number
  image: string
  createdAt: Date
  ownerId: string
}

export interface OwnerBooking {
  id: string
  listingId: string
  listingTitle: string
  customerId: string
  customerName: string
  customerAvatar: string
  startDate: Date
  endDate: Date
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: Date
}

export interface OwnerActivity {
  id: string
  type: 'booking' | 'payment' | 'review' | 'listing_update'
  title: string
  description: string
  timestamp: Date
  listingId?: string
  bookingId?: string
}

export class OwnerDashboardService {
  // Get owner statistics
  async getOwnerStats(ownerId: string): Promise<OwnerStats> {
    try {
      // Get total earnings from paid bookings
      const { data: earningsData, error: earningsError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('owner_id', ownerId)
        .eq('payment_status', 'paid')

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError)
      }

      const totalEarnings = earningsData?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

      // Get total bookings count
      const { count: totalBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)

      if (bookingsError) {
        console.error('Error fetching bookings count:', bookingsError)
      }

      // Get active/published listings count
      const { count: activeListings, error: listingsError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .in('status', ['published', 'active'])

      if (listingsError) {
        console.error('Error fetching listings count:', listingsError)
      }

      // Get average rating from reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', ownerId)

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      }

      const avgRating = reviewsData && reviewsData.length > 0
        ? reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length
        : 0
        
        return {
        totalEarnings,
        totalBookings: totalBookings || 0,
        activeListings: activeListings || 0,
        rating: Number(avgRating.toFixed(1))
      }
    } catch (error) {
      console.error('Error fetching owner stats:', error)
      return {
        totalEarnings: 0,
        totalBookings: 0,
        activeListings: 0,
        rating: 0
      }
    }
  }

  // Get owner listings
  async getOwnerListings(ownerId: string): Promise<OwnerListing[]> {
    try {
      // Fetch listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false })

      if (listingsError) {
        console.error('Error fetching listings:', listingsError)
        return []
      }
      
      if (!listings || listings.length === 0) {
        return []
      }

      // Get bookings count and reviews for each listing
      const listingsWithStats = await Promise.all(
        listings.map(async (listing) => {
          // Get bookings count
          const { count: bookingsCount } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id)

          // Get reviews and calculate average rating
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('listing_id', listing.id)

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : 0

          // Get views count
          const { count: viewsCount } = await supabase
            .from('listing_views')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id)

          return {
            id: listing.id,
            title: listing.title,
            category: listing.category,
            price: listing.price,
            status: listing.status,
            bookings: bookingsCount || 0,
            rating: Number(avgRating.toFixed(1)),
            views: viewsCount || 0,
            image: listing.images?.[0] || '/placeholder.jpg',
            createdAt: new Date(listing.created_at),
            ownerId: listing.user_id
          }
        })
      )

      return listingsWithStats
    } catch (error) {
      console.error('Error fetching owner listings:', error)
      return []
    }
  }

  // Get owner bookings
  async getOwnerBookings(ownerId: string): Promise<OwnerBooking[]> {
    try {
      // Fetch bookings for owner's listings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, listings!inner(title, user_id)')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        return []
      }
      
      if (!bookings || bookings.length === 0) {
        return []
      }

      // Get user profiles for customer info using Clerk IDs
      const bookingsWithCustomerInfo = await Promise.all(
        bookings.map(async (booking: any) => {
          // Try to get user profile from our database
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('name, avatar_url')
            .eq('user_id', booking.user_id)
            .single()

          return {
            id: booking.id,
            listingId: booking.listing_id,
            listingTitle: booking.listings?.title || 'Unknown Listing',
            customerId: booking.user_id,
            customerName: userProfile?.name || 'User',
            customerAvatar: userProfile?.avatar_url || '/default-avatar.png',
            startDate: new Date(booking.start_date),
            endDate: new Date(booking.end_date),
            totalPrice: booking.total_price,
            status: booking.status,
            paymentStatus: booking.payment_status,
            createdAt: new Date(booking.created_at)
          }
        })
      )

      return bookingsWithCustomerInfo
    } catch (error) {
      console.error('Error fetching owner bookings:', error)
      return []
    }
  }

  // Get owner activity
  async getOwnerActivity(ownerId: string, limit: number = 10): Promise<OwnerActivity[]> {
    try {
      const activities: OwnerActivity[] = []

      // Get recent bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, created_at, total_price, user_id, listing_id, listings!inner(title)')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (bookingsError) {
        console.error('Error fetching booking activities:', bookingsError)
      } else if (bookings) {
        for (const booking of bookings) {
          // Get user profile
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('user_id', booking.user_id)
            .single()

          activities.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: 'New booking received',
            description: `${(booking.listings as any)?.title || 'Unknown Listing'} - ${userProfile?.name || 'User'}`,
            timestamp: new Date(booking.created_at),
            bookingId: booking.id,
            listingId: booking.listing_id
          })
        }
      }

      // Get recent payments (paid bookings)
      const { data: payments, error: paymentsError } = await supabase
        .from('bookings')
        .select('id, created_at, total_price, user_id, listing_id, listings!inner(title)')
        .eq('owner_id', ownerId)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (paymentsError) {
        console.error('Error fetching payment activities:', paymentsError)
      } else if (payments) {
        for (const payment of payments) {
          // Get user profile
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('user_id', payment.user_id)
            .single()

          activities.push({
            id: `payment-${payment.id}`,
            type: 'payment',
          title: 'Payment received',
            description: `KSh ${payment.total_price} from ${userProfile?.name || 'User'}`,
            timestamp: new Date(payment.created_at),
            bookingId: payment.id,
            listingId: payment.listing_id
          })
        }
      }

      // Get recent reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, created_at, rating, comment, listing_id')
        .eq('reviewee_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (reviewsError) {
        console.error('Error fetching review activities:', reviewsError)
      } else if (reviews) {
        for (const review of reviews) {
          activities.push({
            id: `review-${review.id}`,
            type: 'review',
            title: 'New review received',
            description: `${review.rating} stars${review.comment ? ': ' + review.comment.substring(0, 50) : ''}`,
            timestamp: new Date(review.created_at),
            listingId: review.listing_id
          })
        }
      }

      // Sort all activities by timestamp and return top N
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching owner activity:', error)
      return []
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(ownerId: string): Promise<{
    bookingSuccessRate: number
    averageRating: number
    totalReviews: number
  }> {
    try {
      // Get completed bookings count
      const { count: completedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('status', 'completed')

      // Get total bookings count
      const { count: totalCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)

      const bookingSuccessRate = totalCount && totalCount > 0
        ? Math.round(((completedCount || 0) / totalCount) * 100)
        : 0

      // Get reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', ownerId)

      const totalReviews = reviews?.length || 0
      const averageRating = totalReviews > 0
        ? reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0
        
        return {
        bookingSuccessRate,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      return {
        bookingSuccessRate: 0,
        averageRating: 0,
        totalReviews: 0
      }
    }
  }
}

export const ownerDashboardService = new OwnerDashboardService()
