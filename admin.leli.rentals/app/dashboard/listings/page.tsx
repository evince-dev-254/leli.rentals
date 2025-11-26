'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Search, Home, Eye, MapPin, User, Mail, Phone } from 'lucide-react'

interface Listing {
  id: string
  user_id: string
  owner_email?: string
  owner_phone?: string
  title: string
  description: string | null
  category: string | null
  subcategory: string | null
  price: number
  price_type: string
  location: string | null
  status: 'draft' | 'published' | 'archived'
  views: number
  images: string[]
  created_at: string
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchListings()
  }, [filterStatus, filterCategory])

  async function fetchListings() {
    try {
      setLoading(true)

      // Use the proxy API to fetch listings (bypasses RLS via main app)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)

      const response = await fetch(`/api/listings/list?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }

      const data = await response.json()
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing =>
    searchTerm === '' ||
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'archived': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Listings Management</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search by title, location, category, or owner email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Status Filter */}
            <select
              title="Filter listings by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="bg-gray-900">All Status</option>
              <option value="published" className="bg-gray-900">Published</option>
              <option value="draft" className="bg-gray-900">Draft</option>
              <option value="archived" className="bg-gray-900">Archived</option>
            </select>

            {/* Category Filter */}
            <select
              title="Filter listings by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="bg-gray-900">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat || ''} className="bg-gray-900">{cat}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={fetchListings}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-white/70">No listings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {listing.images?.[0] ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                              <Home className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{listing.title}</div>
                            <div className="flex items-center gap-1 text-xs text-white/50">
                              <MapPin className="w-3 h-3" />
                              {listing.location || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-white">
                            <Mail className="w-3 h-3 text-white/70" />
                            {listing.owner_email || 'No email'}
                          </div>
                          {listing.owner_phone && (
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <Phone className="w-3 h-3" />
                              {listing.owner_phone}
                            </div>
                          )}
                          <div className="text-xs text-white/30 font-mono">ID: {listing.user_id.substring(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white capitalize">{listing.category || 'N/A'}</span>
                        {listing.subcategory && (
                          <div className="text-xs text-white/50 capitalize">{listing.subcategory}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          KES {listing.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-white/50">{listing.price_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(listing.status)}`}>
                          {listing.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                          <Eye className="w-3 h-3" />
                          {listing.views} views
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-white">{listings.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Published</p>
            <p className="text-2xl font-bold text-white">
              {listings.filter(l => l.status === 'published').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Total Views</p>
            <p className="text-2xl font-bold text-white">
              {listings.reduce((sum, l) => sum + l.views, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Avg Price</p>
            <p className="text-2xl font-bold text-white">
              KES {Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
