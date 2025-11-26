'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAdminUsers, UserProfile } from '@/lib/admin-role-utils'
import { useUser } from '@clerk/nextjs'
import DashboardLayout from '@/components/dashboard-layout'
import { Shield, Crown, Plus, Trash2 } from 'lucide-react'

export default function AdminsPage() {
    const { user: currentUser } = useUser()
    const [admins, setAdmins] = useState<UserProfile[]>([])
    const [allUsers, setAllUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState('')

    useEffect(() => {
        fetchAdmins()
        fetchAllUsers()
    }, [])

    async function fetchAdmins() {
        try {
            const data = await getAdminUsers()
            setAdmins(data)
        } catch (error) {
            console.error('Error fetching admins:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchAllUsers() {
        try {
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('role', 'user')
                .order('created_at', { ascending: false }) as any

            setAllUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    async function promoteToAdmin() {
        if (!selectedUserId) return

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ role: 'admin' })
                .eq('user_id', selectedUserId) as any

            if (error) throw error

            alert('User promoted to admin successfully!')
            setShowAddModal(false)
            setSelectedUserId('')
            fetchAdmins()
            fetchAllUsers()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred'
            alert(`Error: ${message}`)
        }
    }

    async function removeAdmin(userId: string) {
        const confirmed = confirm('Are you sure you want to remove this admin?')
        if (!confirmed) return

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ role: 'user' })
                .eq('user_id', userId) as any

            if (error) throw error

            alert('Admin removed successfully!')
            fetchAdmins()
            fetchAllUsers()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred'
            alert(`Error: ${message}`)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Admin Management</h1>
                            <p className="text-white/70">Manage admin users and permissions</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Admin
                        </button>
                    </div>
                </div>

                {/* Admins Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-3 p-8 text-center text-white">Loading admins...</div>
                    ) : admins.length === 0 ? (
                        <div className="col-span-3 p-8 text-center text-white/70">No admins found</div>
                    ) : (
                        admins.map((admin) => (
                            <div
                                key={admin.id}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${admin.role === 'super_admin'
                                            ? 'bg-purple-500/20'
                                            : 'bg-blue-500/20'
                                            }`}>
                                            {admin.role === 'super_admin' ? (
                                                <Crown className="w-6 h-6 text-purple-300" />
                                            ) : (
                                                <Shield className="w-6 h-6 text-blue-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white capitalize">
                                                {admin.role.replace('_', ' ')}
                                            </h3>
                                            <p className="text-xs text-white/50 font-mono">
                                                {admin.user_id.substring(0, 16)}...
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {admin.phone && (
                                        <div className="text-sm text-white/70">
                                            📱 {admin.phone}
                                        </div>
                                    )}
                                    {admin.location && (
                                        <div className="text-sm text-white/70">
                                            📍 {admin.location}
                                        </div>
                                    )}
                                    <div className="text-xs text-white/50">
                                        Added {new Date(admin.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {admin.role !== 'super_admin' && admin.user_id !== currentUser?.id && (
                                    <button
                                        onClick={() => removeAdmin(admin.user_id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove Admin
                                    </button>
                                )}

                                {admin.role === 'super_admin' && (
                                    <div className="text-center text-xs text-purple-300 font-medium">
                                        🔒 Super Admin (Protected)
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Total Admins</p>
                        <p className="text-2xl font-bold text-white">{admins.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Super Admins</p>
                        <p className="text-2xl font-bold text-white">
                            {admins.filter(a => a.role === 'super_admin').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Regular Admins</p>
                        <p className="text-2xl font-bold text-white">
                            {admins.filter(a => a.role === 'admin').length}
                        </p>
                    </div>
                </div>

                {/* Add Admin Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>

                            <div className="mb-4">
                                <label className="block text-sm text-white/70 mb-2">Select User</label>
                                <select
                                    title="Select user to promote to admin"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                >
                                    <option value="" className="bg-gray-900">Select a user...</option>
                                    {allUsers.map(user => (
                                        <option key={user.user_id} value={user.user_id} className="bg-gray-900">
                                            {user.user_id.substring(0, 20)}... {user.phone ? `(${user.phone})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={promoteToAdmin}
                                    disabled={!selectedUserId}
                                    className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Promote to Admin
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setSelectedUserId('')
                                    }}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
