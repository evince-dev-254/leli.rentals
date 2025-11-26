'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard-layout'
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react'

interface Subscription {
    id: string
    user_id: string
    plan: 'free' | 'basic' | 'professional' | 'premium'
    status: 'active' | 'cancelled' | 'expired'
    start_date: string
    end_date: string | null
    auto_renew: boolean
    created_at: string
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [filterPlan, setFilterPlan] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useEffect(() => {
        fetchSubscriptions()
    }, [filterPlan, filterStatus])

    async function fetchSubscriptions() {
        try {
            setLoading(true)

            // Fetch subscriptions from the admin API (bypasses RLS)
            const params = new URLSearchParams()
            if (filterPlan !== 'all') params.append('plan', filterPlan)
            if (filterStatus !== 'all') params.append('status', filterStatus)

            const response = await fetch(`/api/subscriptions/list?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch subscriptions')
            }

            const data = await response.json()
            setSubscriptions(data || [])
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'premium': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            case 'professional': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            case 'basic': return 'bg-green-500/20 text-green-300 border-green-500/30'
            case 'free': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30'
            case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30'
            case 'expired': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    const planPrices = {
        free: 0,
        basic: 999,
        professional: 2499,
        premium: 4999
    }

    const totalRevenue = subscriptions
        .filter(s => s.status === 'active' && s.plan !== 'free')
        .reduce((sum, s) => sum + (planPrices[s.plan as keyof typeof planPrices] || 0), 0)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-4">Subscription Management</h1>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            title="Filter subscriptions by plan"
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <option value="all" className="bg-gray-900">All Plans</option>
                            <option value="free" className="bg-gray-900">Free</option>
                            <option value="basic" className="bg-gray-900">Basic</option>
                            <option value="professional" className="bg-gray-900">Professional</option>
                            <option value="premium" className="bg-gray-900">Premium</option>
                        </select>

                        <select
                            title="Filter subscriptions by status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <option value="all" className="bg-gray-900">All Status</option>
                            <option value="active" className="bg-gray-900">Active</option>
                            <option value="cancelled" className="bg-gray-900">Cancelled</option>
                            <option value="expired" className="bg-gray-900">Expired</option>
                        </select>

                        <button
                            onClick={fetchSubscriptions}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            <p className="text-white/70 text-sm">Monthly Revenue</p>
                        </div>
                        <p className="text-2xl font-bold text-white">KES {totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <p className="text-white/70 text-sm">Active Subscribers</p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.filter(s => s.status === 'active' && s.plan !== 'free').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-purple-400" />
                            <p className="text-white/70 text-sm">Premium Users</p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.filter(s => s.plan === 'premium').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            <p className="text-white/70 text-sm">Conversion Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.length > 0
                                ? Math.round((subscriptions.filter(s => s.plan !== 'free').length / subscriptions.length) * 100)
                                : 0}%
                        </p>
                    </div>
                </div>

                {/* Subscriptions Table */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-white">Loading subscriptions...</div>
                    ) : subscriptions.length === 0 ? (
                        <div className="p-8 text-center text-white/70">No subscriptions found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            User ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Monthly Fee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Start Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            End Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Auto Renew
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-white">{sub.user_id.substring(0, 16)}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${getPlanBadgeColor(sub.plan)}`}>
                                                    {sub.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadgeColor(sub.status)}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-white">
                                                    KES {planPrices[sub.plan as keyof typeof planPrices].toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                                {new Date(sub.start_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                                {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${sub.auto_renew
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : 'bg-gray-500/20 text-gray-300'
                                                    }`}>
                                                    {sub.auto_renew ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Plan Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Free Plan</p>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.filter(s => s.plan === 'free').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Basic Plan</p>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.filter(s => s.plan === 'basic').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Professional Plan</p>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.filter(s => s.plan === 'professional').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Premium Plan</p>
                        <p className="text-2xl font-bold text-white">
                            {subscriptions.filter(s => s.plan === 'premium').length}
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
