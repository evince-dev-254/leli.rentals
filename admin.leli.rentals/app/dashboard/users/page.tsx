'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Search, User, Shield, Crown, Mail, Phone, MapPin, Users, Database } from 'lucide-react'

interface UserProfile {
  id: string
  user_id: string
  email: string
  role: 'user' | 'admin' | 'super_admin'
  account_type: string | null
  verification_status: string
  phone: string | null
  location: string | null
  created_at: string
  last_sign_in_at?: string
}

interface ClerkUser {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  createdAt?: number
  lastSignInAt?: number
  imageUrl?: string
  unsafeMetadata?: {
    accountType?: string
    verificationStatus?: string
  }
  publicMetadata?: Record<string, any>
}

export default function UsersPage() {
  const [viewMode, setViewMode] = useState<'database' | 'clerk'>('database')
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([])
  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')

  useEffect(() => {
    if (viewMode === 'database') {
      fetchDbUsers()
    } else {
      fetchClerkUsers()
    }
  }, [viewMode])

  async function fetchDbUsers() {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/list?role=${filterRole}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      console.log('Fetched DB Users:', data)
      // Handle both array (direct from Supabase) and object (from proxy) formats
      const usersList = Array.isArray(data) ? data : (data.users || [])
      setDbUsers(usersList)
    } catch (error) {
      console.error('Error fetching database users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchClerkUsers() {
    try {
      setLoading(true)
      const response = await fetch('/api/users/clerk')
      if (!response.ok) throw new Error('Failed to fetch Clerk users')
      const data = await response.json()
      setClerkUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching Clerk users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDbUsers = dbUsers.filter(user => {
    const userId = user.user_id || user.id || ''
    return searchTerm === '' ||
      userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredClerkUsers = clerkUsers.filter(user =>
    searchTerm === '' ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'admin': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getVerificationBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">User Management</h1>

          {/* View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/20">
              <button
                onClick={() => setViewMode('database')}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${viewMode === 'database'
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/70'
                  }`}
              >
                <Database className="w-4 h-4" />
                Database ({dbUsers.length})
              </button>
              <button
                onClick={() => setViewMode('clerk')}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${viewMode === 'clerk'
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/70'
                  }`}
              >
                <Users className="w-4 h-4" />
                Clerk ({clerkUsers.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Role Filter (only for database view) */}
            {viewMode === 'database' && (
              <select
                title="Filter users by role"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value)
                  fetchDbUsers()
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all" className="bg-gray-900">All Roles</option>
                <option value="user" className="bg-gray-900">Users</option>
                <option value="admin" className="bg-gray-900">Admins</option>
                <option value="super_admin" className="bg-gray-900">Super Admins</option>
              </select>
            )}

            {/* Refresh */}
            <button
              onClick={() => viewMode === 'database' ? fetchDbUsers() : fetchClerkUsers()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Database Users View */}
        {viewMode === 'database' && (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full p-8 text-center text-white">Loading users...</div>
              ) : filteredDbUsers.length === 0 ? (
                <div className="col-span-full p-8 text-center text-white/70">No users found</div>
              ) : (
                filteredDbUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-white/70">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm font-medium text-white">{user.email}</span>
                          </div>
                          <div className="text-xs text-white/30 font-mono mt-1">
                            ID: {user.user_id.substring(0, 16)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                        {user.account_type && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                            {user.account_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 bg-black/20 p-3 rounded-lg">
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <MapPin className="w-3 h-3" />
                          {user.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVerificationBadgeColor(user.verification_status)}`}>
                        {user.verification_status}
                      </span>
                      <span className="text-xs text-white/50">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{dbUsers.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Admins</p>
                <p className="text-2xl font-bold text-white">
                  {dbUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Verified</p>
                <p className="text-2xl font-bold text-white">
                  {dbUsers.filter(u => u.verification_status === 'approved').length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {dbUsers.filter(u => u.verification_status === 'pending').length}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Clerk Users View */}
        {viewMode === 'clerk' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full p-8 text-center text-white">Loading Clerk users...</div>
              ) : filteredClerkUsers.length === 0 ? (
                <div className="col-span-full p-8 text-center text-white/70">No Clerk users found</div>
              ) : (
                filteredClerkUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
                  >
                    <div className="mb-4">
                      <div className="flex items-start gap-3 mb-3">
                        {user.imageUrl && (
                          <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white/20" />
                        )}
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="text-xs text-white/30 font-mono mt-1">
                            {user.id.substring(0, 16)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {user.unsafeMetadata?.accountType && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                            {user.unsafeMetadata.accountType}
                          </span>
                        )}
                        {user.unsafeMetadata?.verificationStatus && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVerificationBadgeColor(user.unsafeMetadata.verificationStatus)}`}>
                            {user.unsafeMetadata.verificationStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                      {user.lastSignInAt && (
                        <span>Last sign-in: {new Date(user.lastSignInAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clerk Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Total Clerk Users</p>
                <p className="text-2xl font-bold text-white">{clerkUsers.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Owners</p>
                <p className="text-2xl font-bold text-white">
                  {clerkUsers.filter(u => u.unsafeMetadata?.accountType === 'owner').length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm">Renters</p>
                <p className="text-2xl font-bold text-white">
                  {clerkUsers.filter(u => u.unsafeMetadata?.accountType === 'renter').length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
