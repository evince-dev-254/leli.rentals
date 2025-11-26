import { db } from './database'

export interface SiteAnalytics {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
  activeUsers: number
  conversionRate: number
}

export interface CategoryAnalytics {
  category: string
  listings: number
  bookings: number
  revenue: number
  averagePrice: number
}

export interface UserAnalytics {
  userId: string
  userName: string
  userEmail: string
  totalBookings: number
  totalSpent: number
  averageRating: number
  joinDate: Date
  lastActive: Date
}

export interface RevenueAnalytics {
  period: string
  revenue: number
  bookings: number
  averageBookingValue: number
}

export interface ListingAnalytics {
  listingId: string
  title: string
  category: string
  views: number
  bookings: number
  revenue: number
  rating: number
  conversionRate: number
}

export class AnalyticsService {
  // Get overall site analytics
  async getSiteAnalytics(): Promise<SiteAnalytics> {
    try {
      // Check if database is available
      if (!db) {
        console.warn('Database not available, returning mock data')
        return {
          totalUsers: 0,
          totalListings: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeUsers: 0,
          conversionRate: 0
        }
      }
      
      const client = await db.connect()
      
      try {
        // Get total users
        const usersResult = await client.query(`
          SELECT COUNT(*) as total_users
          FROM users
        `)
        
        // Get total listings
        const listingsResult = await client.query(`
          SELECT COUNT(*) as total_listings
          FROM listings
        `)
        
        // Get total bookings
        const bookingsResult = await client.query(`
          SELECT COUNT(*) as total_bookings
          FROM bookings
        `)
        
        // Get total revenue
        const revenueResult = await client.query(`
          SELECT COALESCE(SUM(total_price), 0) as total_revenue
          FROM bookings
          WHERE payment_status = 'paid'
        `)
        
        // Get active users (users with bookings in last 30 days)
        const activeUsersResult = await client.query(`
          SELECT COUNT(DISTINCT user_id) as active_users
          FROM bookings
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `)
        
        // Calculate conversion rate (bookings / unique listing views)
        const conversionResult = await client.query(`
          SELECT 
            COUNT(DISTINCT b.user_id) as unique_bookers,
            COUNT(DISTINCT l.id) as unique_listings_viewed
          FROM bookings b
          JOIN listings l ON b.listing_id = l.id
        `)
        
        const uniqueBookers = parseInt(conversionResult.rows[0]?.unique_bookers || '0')
        const uniqueListingsViewed = parseInt(conversionResult.rows[0]?.unique_listings_viewed || '0')
        const conversionRate = uniqueListingsViewed > 0 ? (uniqueBookers / uniqueListingsViewed) * 100 : 0
        
        return {
          totalUsers: parseInt(usersResult.rows[0]?.total_users || '0'),
          totalListings: parseInt(listingsResult.rows[0]?.total_listings || '0'),
          totalBookings: parseInt(bookingsResult.rows[0]?.total_bookings || '0'),
          totalRevenue: parseFloat(revenueResult.rows[0]?.total_revenue || '0'),
          activeUsers: parseInt(activeUsersResult.rows[0]?.active_users || '0'),
          conversionRate: Math.round(conversionRate * 100) / 100
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error fetching site analytics:', error)
      return {
        totalUsers: 0,
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeUsers: 0,
        conversionRate: 0
      }
    }
  }

  // Get analytics by category
  async getCategoryAnalytics(): Promise<CategoryAnalytics[]> {
    try {
      const client = await db.connect()
      
      try {
        const result = await client.query(`
          SELECT 
            l.category,
            COUNT(DISTINCT l.id) as listings,
            COUNT(b.id) as bookings,
            COALESCE(SUM(b.total_price), 0) as revenue,
            COALESCE(AVG(l.price), 0) as average_price
          FROM listings l
          LEFT JOIN bookings b ON l.id = b.listing_id AND b.payment_status = 'paid'
          GROUP BY l.category
          ORDER BY revenue DESC
        `)
        
        return result.rows.map(row => ({
          category: row.category,
          listings: parseInt(row.listings),
          bookings: parseInt(row.bookings),
          revenue: parseFloat(row.revenue),
          averagePrice: parseFloat(row.average_price)
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error fetching category analytics:', error)
      return []
    }
  }

  // Get user analytics
  async getUserAnalytics(limit: number = 50): Promise<UserAnalytics[]> {
    try {
      const client = await db.connect()
      
      try {
        const result = await client.query(`
          SELECT 
            u.id as user_id,
            u.name as user_name,
            u.email as user_email,
            COUNT(b.id) as total_bookings,
            COALESCE(SUM(b.total_price), 0) as total_spent,
            COALESCE(AVG(r.rating), 0) as average_rating,
            u.created_at as join_date,
            MAX(b.created_at) as last_active
          FROM users u
          LEFT JOIN bookings b ON u.id = b.user_id
          LEFT JOIN reviews r ON u.id = r.reviewee_id
          GROUP BY u.id, u.name, u.email, u.created_at
          ORDER BY total_spent DESC
          LIMIT $1
        `, [limit])
        
        return result.rows.map(row => ({
          userId: row.user_id,
          userName: row.user_name,
          userEmail: row.user_email,
          totalBookings: parseInt(row.total_bookings),
          totalSpent: parseFloat(row.total_spent),
          averageRating: parseFloat(row.average_rating),
          joinDate: new Date(row.join_date),
          lastActive: new Date(row.last_active || row.join_date)
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return []
    }
  }

  // Get revenue analytics by time period
  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<RevenueAnalytics[]> {
    try {
      const client = await db.connect()
      
      try {
        let dateFormat: string
        let interval: string
        
        switch (period) {
          case 'daily':
            dateFormat = 'YYYY-MM-DD'
            interval = '1 day'
            break
          case 'weekly':
            dateFormat = 'YYYY-"W"WW'
            interval = '1 week'
            break
          case 'monthly':
            dateFormat = 'YYYY-MM'
            interval = '1 month'
            break
        }
        
        const result = await client.query(`
          SELECT 
            TO_CHAR(created_at, $1) as period,
            SUM(total_price) as revenue,
            COUNT(*) as bookings,
            AVG(total_price) as average_booking_value
          FROM bookings
          WHERE payment_status = 'paid'
            AND created_at >= NOW() - INTERVAL '12 months'
          GROUP BY TO_CHAR(created_at, $1)
          ORDER BY period DESC
        `, [dateFormat])
        
        return result.rows.map(row => ({
          period: row.period,
          revenue: parseFloat(row.revenue),
          bookings: parseInt(row.bookings),
          averageBookingValue: parseFloat(row.average_booking_value)
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error)
      return []
    }
  }

  // Get top performing listings
  async getTopListings(limit: number = 20): Promise<ListingAnalytics[]> {
    try {
      const client = await db.connect()
      
      try {
        const result = await client.query(`
          SELECT 
            l.id as listing_id,
            l.title,
            l.category,
            l.views,
            COUNT(b.id) as bookings,
            COALESCE(SUM(b.total_price), 0) as revenue,
            COALESCE(AVG(r.rating), 0) as rating,
            CASE 
              WHEN l.views > 0 THEN (COUNT(b.id)::float / l.views) * 100
              ELSE 0 
            END as conversion_rate
          FROM listings l
          LEFT JOIN bookings b ON l.id = b.listing_id AND b.payment_status = 'paid'
          LEFT JOIN reviews r ON l.id = r.listing_id
          GROUP BY l.id, l.title, l.category, l.views
          ORDER BY revenue DESC
          LIMIT $1
        `, [limit])
        
        return result.rows.map(row => ({
          listingId: row.listing_id,
          title: row.title,
          category: row.category,
          views: parseInt(row.views || '0'),
          bookings: parseInt(row.bookings),
          revenue: parseFloat(row.revenue),
          rating: parseFloat(row.rating),
          conversionRate: Math.round(parseFloat(row.conversion_rate) * 100) / 100
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error fetching top listings:', error)
      return []
    }
  }

  // Get growth metrics
  async getGrowthMetrics(): Promise<{
    userGrowth: number
    listingGrowth: number
    bookingGrowth: number
    revenueGrowth: number
  }> {
    try {
      const client = await db.connect()
      
      try {
        // Get current month metrics
        const currentResult = await client.query(`
          SELECT 
            COUNT(DISTINCT u.id) as users,
            COUNT(DISTINCT l.id) as listings,
            COUNT(DISTINCT b.id) as bookings,
            COALESCE(SUM(b.total_price), 0) as revenue
          FROM users u
          LEFT JOIN listings l ON u.id = l.owner_id
          LEFT JOIN bookings b ON l.id = b.listing_id AND b.payment_status = 'paid'
          WHERE u.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            OR l.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            OR b.created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `)
        
        // Get previous month metrics
        const previousResult = await client.query(`
          SELECT 
            COUNT(DISTINCT u.id) as users,
            COUNT(DISTINCT l.id) as listings,
            COUNT(DISTINCT b.id) as bookings,
            COALESCE(SUM(b.total_price), 0) as revenue
          FROM users u
          LEFT JOIN listings l ON u.id = l.owner_id
          LEFT JOIN bookings b ON l.id = b.listing_id AND b.payment_status = 'paid'
          WHERE u.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            AND u.created_at < DATE_TRUNC('month', CURRENT_DATE)
            OR (l.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                AND l.created_at < DATE_TRUNC('month', CURRENT_DATE))
            OR (b.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                AND b.created_at < DATE_TRUNC('month', CURRENT_DATE))
        `)
        
        const current = currentResult.rows[0]
        const previous = previousResult.rows[0]
        
        const calculateGrowth = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return ((current - previous) / previous) * 100
        }
        
        return {
          userGrowth: calculateGrowth(
            parseInt(current?.users || '0'),
            parseInt(previous?.users || '0')
          ),
          listingGrowth: calculateGrowth(
            parseInt(current?.listings || '0'),
            parseInt(previous?.listings || '0')
          ),
          bookingGrowth: calculateGrowth(
            parseInt(current?.bookings || '0'),
            parseInt(previous?.bookings || '0')
          ),
          revenueGrowth: calculateGrowth(
            parseFloat(current?.revenue || '0'),
            parseFloat(previous?.revenue || '0')
          )
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error fetching growth metrics:', error)
      return {
        userGrowth: 0,
        listingGrowth: 0,
        bookingGrowth: 0,
        revenueGrowth: 0
      }
    }
  }
}

export const analyticsService = new AnalyticsService()
