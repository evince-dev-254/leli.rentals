import apiClient from '../api-client'

export interface PlatformStats {
  users: {
    total: number
    newToday: number
    activeLast30Days: number
    owners: number
    renters: number
    verified: number
    pendingVerification: number
  }
  listings: {
    total: number
    published: number
    draft: number
    archived: number
    categories: Record<string, number>
    recent: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    recent: number
  }
  revenue: {
    total: number
    monthly: number
    weekly: number
    averageBooking: number
  }
  growth: {
    usersGrowth: number
    listingsGrowth: number
    bookingsGrowth: number
    revenueGrowth: number
  }
}

export const statsService = {
  // Get platform statistics
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await apiClient.get<PlatformStats>('/admin/stats')
    return response.data
  },
}

