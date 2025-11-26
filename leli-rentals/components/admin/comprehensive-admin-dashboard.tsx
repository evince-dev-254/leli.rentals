'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  MessageSquare,
  AlertTriangle,
  Package,
  Settings,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserX
} from 'lucide-react'

interface PlatformStats {
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

interface Listing {
  id: string
  title: string
  category: string
  price: number
  status: string
  created_at: string
  user_id: string
  owner_name?: string
  views?: number
}

interface Booking {
  id: string
  listing_id: string
  listing_title: string
  user_id: string
  customer_name: string
  status: string
  total_price: number
  created_at: string
  start_date: string
  end_date: string
}

export default function ComprehensiveAdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, listingsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/listings'),
        fetch('/api/admin/bookings')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        setListings(listingsData.listings || [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.bookings || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus
    const matchesCategory = filterCategory === 'all' || listing.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchQuery ||
      booking.listing_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete platform overview and management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.users.total.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(stats.growth.usersGrowth)}
                  <span className={`text-sm ${getGrowthColor(stats.growth.usersGrowth)}`}>
                    {Math.abs(stats.growth.usersGrowth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.users.owners} owners • {stats.users.renters} renters
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Home className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.listings.published.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(stats.growth.listingsGrowth)}
                  <span className={`text-sm ${getGrowthColor(stats.growth.listingsGrowth)}`}>
                    {Math.abs(stats.growth.listingsGrowth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.listings.total} total • {stats.listings.draft} drafts
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.bookings.total.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(stats.growth.bookingsGrowth)}
                  <span className={`text-sm ${getGrowthColor(stats.growth.bookingsGrowth)}`}>
                    {Math.abs(stats.growth.bookingsGrowth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.bookings.pending} pending • {stats.bookings.confirmed} confirmed
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(stats.growth.revenueGrowth)}
                  <span className={`text-sm ${getGrowthColor(stats.growth.revenueGrowth)}`}>
                    {Math.abs(stats.growth.revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.revenue.monthly)} this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Secondary Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                    <p className="text-2xl font-bold">{stats.users.verified}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                    <p className="text-2xl font-bold">{stats.users.pendingVerification}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Booking Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.revenue.averageBooking)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Bookings</p>
                    <p className="text-2xl font-bold">{stats.bookings.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="verifications">
              Verifications
              {stats && stats.users.pendingVerification > 0 && (
                <Badge className="ml-2 bg-amber-500">{stats.users.pendingVerification}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>System status and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">API Status</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Database</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="font-medium">Pending Actions</span>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900">
                      {stats?.users.pendingVerification || 0} verifications
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Listings by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats && Object.entries(stats.listings.categories)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="capitalize text-sm font-medium">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{
                                  width: `${((count as number) / Math.max(stats.listings.total, 1)) * 100}%`
                                }}
                                aria-label={`${category} category percentage`}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold w-8 text-right">{count as number}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">New booking: {booking.listing_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.customer_name} • {formatDate(booking.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(booking.status)}>{booking.status}</Badge>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin-panel')} className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Open User Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Management</CardTitle>
                <CardDescription>Review and moderate all listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                    aria-label="Filter by status"
                    title="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                    aria-label="Filter by category"
                    title="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    {stats && Object.keys(stats.listings.categories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Title</th>
                        <th className="text-left p-3 font-semibold">Category</th>
                        <th className="text-left p-3 font-semibold">Price</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Created</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.slice(0, 50).map((listing) => (
                        <tr key={listing.id} className="border-t hover:bg-muted/50">
                          <td className="p-3 font-medium">{listing.title}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">{listing.category}</Badge>
                          </td>
                          <td className="p-3">{formatCurrency(listing.price || 0)}</td>
                          <td className="p-3">
                            <Badge className={getStatusBadge(listing.status)}>{listing.status}</Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {formatDate(listing.created_at)}
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/listings/${listing.id}`)}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredListings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No listings found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Monitor and manage all platform bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                    aria-label="Filter bookings by status"
                    title="Filter bookings by status"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Listing</th>
                        <th className="text-left p-3 font-semibold">Customer</th>
                        <th className="text-left p-3 font-semibold">Dates</th>
                        <th className="text-left p-3 font-semibold">Amount</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.slice(0, 50).map((booking) => (
                        <tr key={booking.id} className="border-t hover:bg-muted/50">
                          <td className="p-3 font-medium">{booking.listing_title}</td>
                          <td className="p-3">{booking.customer_name}</td>
                          <td className="p-3 text-sm">
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          </td>
                          <td className="p-3 font-semibold">{formatCurrency(booking.total_price)}</td>
                          <td className="p-3">
                            <Badge className={getStatusBadge(booking.status)}>{booking.status}</Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {formatDate(booking.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredBookings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed insights and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin/analytics')} className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Open Analytics Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ID Verification</CardTitle>
                <CardDescription>Review and approve user verifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin/verify-users')} className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Open Verification Tool
                </Button>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {stats?.users.pendingVerification || 0} verification{stats && stats.users.pendingVerification !== 1 ? 's' : ''} pending review
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">General Settings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Platform configuration options
                    </p>
                    <Button variant="outline">Configure Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

