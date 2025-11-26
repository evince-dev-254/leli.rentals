'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Search, DollarSign, User, Clock } from 'lucide-react'

interface Booking {
  id: string
  user_id: string
  owner_id: string
  listing_id: string
  start_date: string
  end_date: string
  total_price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_id: string | null
  notes: string | null
  created_at: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')

  useEffect(() => {
    fetchBookings()
  }, [filterStatus, filterPayment])

  async function fetchBookings() {
    try {
      setLoading(true)

      // Use the proxy API to fetch bookings (bypasses RLS via main app)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterPayment !== 'all') params.append('payment_status', filterPayment)

      const response = await fetch(`/api/bookings/list?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking =>
    searchTerm === '' ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.listing_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'refunded': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const calculateDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Bookings Management</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search by booking ID, user ID, or listing ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Status Filter */}
            <select
              title="Filter bookings by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="bg-gray-900">All Status</option>
              <option value="pending" className="bg-gray-900">Pending</option>
              <option value="confirmed" className="bg-gray-900">Confirmed</option>
              <option value="completed" className="bg-gray-900">Completed</option>
              <option value="cancelled" className="bg-gray-900">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              title="Filter bookings by payment status"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="bg-gray-900">All Payments</option>
              <option value="pending" className="bg-gray-900">Pending</option>
              <option value="paid" className="bg-gray-900">Paid</option>
              <option value="refunded" className="bg-gray-900">Refunded</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-white/70">No bookings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-white">{booking.id.substring(0, 8)}...</div>
                        <div className="text-xs text-white/50 flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" />
                          {booking.user_id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-white/50">
                          to {new Date(booking.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-white">
                          <Clock className="w-4 h-4 text-white/50" />
                          {calculateDuration(booking.start_date, booking.end_date)} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-medium text-white">
                          <DollarSign className="w-4 h-4 text-white/50" />
                          KES {booking.total_price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentBadgeColor(booking.payment_status)}`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-white">{bookings.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Pending</p>
            <p className="text-2xl font-bold text-white">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Confirmed</p>
            <p className="text-2xl font-bold text-white">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Completed</p>
            <p className="text-2xl font-bold text-white">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-white">
              KES {bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_price, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
