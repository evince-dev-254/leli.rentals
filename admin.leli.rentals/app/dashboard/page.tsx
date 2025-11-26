'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard-layout'
import StatsCard from '@/components/stats-card'
import { Users, Home, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
  activeListings: number
  pendingBookings: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeListings: 0,
    pendingBookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)

      // Fetch all stats in parallel
      const [usersResult, listingsResult, bookingsResult] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact' }),
        supabase.from('bookings').select('*', { count: 'exact' }),
      ]) as any

      const listings = listingsResult.data || []
      const bookings = bookingsResult.data || []

      // Calculate stats
      const activeListings = listings.filter((l: any) => l.status === 'published').length
      const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length
      const totalRevenue = bookings
        .filter((b: any) => b.payment_status === 'paid')
        .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

      setStats({
        totalUsers: usersResult.count || 0,
        totalListings: listings.length,
        totalBookings: bookings.length,
        totalRevenue,
        activeListings,
        pendingBookings,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Leli Admin</h1>
          <p className="text-white/70">Manage your rental platform from one place</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            subtitle="Registered users"
          />
          <StatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={Home}
            subtitle={`${stats.activeListings} active`}
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            subtitle={`${stats.pendingBookings} pending`}
          />
          <StatsCard
            title="Total Revenue"
            value={`KES ${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            subtitle="From completed bookings"
          />
          <StatsCard
            title="Active Listings"
            value={stats.activeListings}
            icon={TrendingUp}
            subtitle="Published listings"
          />
          <StatsCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={Activity}
            subtitle="Awaiting confirmation"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/users"
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all text-center"
            >
              <Users className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-medium">Manage Users</p>
            </a>
            <a
              href="/dashboard/listings"
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all text-center"
            >
              <Home className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-medium">View Listings</p>
            </a>
            <a
              href="/dashboard/bookings"
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all text-center"
            >
              <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-medium">Manage Bookings</p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
