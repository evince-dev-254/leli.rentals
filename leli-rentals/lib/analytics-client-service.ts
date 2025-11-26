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

export interface GrowthMetrics {
  userGrowth: number
  listingGrowth: number
  bookingGrowth: number
  revenueGrowth: number
}

export class AnalyticsClientService {
  private baseUrl = '/api/analytics'

  // Get overall site analytics
  async getSiteAnalytics(): Promise<SiteAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/site`)
      if (!response.ok) {
        throw new Error('Failed to fetch site analytics')
      }
      return await response.json()
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
      const response = await fetch(`${this.baseUrl}/categories`)
      if (!response.ok) {
        throw new Error('Failed to fetch category analytics')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching category analytics:', error)
      return []
    }
  }

  // Get user analytics
  async getUserAnalytics(limit: number = 50): Promise<UserAnalytics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user analytics')
      }
      const data = await response.json()
      
      // Convert date strings back to Date objects
      return data.map((user: any) => ({
        ...user,
        joinDate: new Date(user.joinDate),
        lastActive: new Date(user.lastActive)
      }))
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return []
    }
  }

  // Get revenue analytics by time period
  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<RevenueAnalytics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/revenue?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch revenue analytics')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching revenue analytics:', error)
      return []
    }
  }

  // Get top performing listings
  async getTopListings(limit: number = 20): Promise<ListingAnalytics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/listings?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch top listings')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching top listings:', error)
      return []
    }
  }

  // Get growth metrics
  async getGrowthMetrics(): Promise<GrowthMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/growth`)
      if (!response.ok) {
        throw new Error('Failed to fetch growth metrics')
      }
      return await response.json()
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

export const analyticsClientService = new AnalyticsClientService()
