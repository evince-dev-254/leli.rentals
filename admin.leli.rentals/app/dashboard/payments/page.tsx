'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Search, DollarSign, CreditCard, TrendingUp, Calendar } from 'lucide-react'

interface Payment {
    id: string
    user_id: string
    amount: number
    currency: string
    payment_method: string
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    transaction_id: string | null
    description: string | null
    created_at: string
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useEffect(() => {
        fetchPayments()
    }, [filterStatus])

    async function fetchPayments() {
        try {
            setLoading(true)

            // Use the proxy API to fetch payments (bypasses RLS via main app)
            const params = new URLSearchParams()
            if (filterStatus !== 'all') params.append('status', filterStatus)

            const response = await fetch(`/api/payments/list?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch payments')
            }

            const data = await response.json()

            // Data transformation is now handled by the API
            setPayments(data || [])
        } catch (error) {
            console.error('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPayments = payments.filter(payment =>
        searchTerm === '' ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30'
            case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
            case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30'
            case 'refunded': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-4">Payment Tracking</h1>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search by payment ID, user ID, or transaction ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>

                        <select
                            title="Filter payments by status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <option value="all" className="bg-gray-900">All Status</option>
                            <option value="paid" className="bg-gray-900">Paid</option>
                            <option value="pending" className="bg-gray-900">Pending</option>
                            <option value="failed" className="bg-gray-900">Failed</option>
                            <option value="refunded" className="bg-gray-900">Refunded</option>
                        </select>

                        <button
                            onClick={fetchPayments}
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
                            <p className="text-white/70 text-sm">Total Revenue</p>
                        </div>
                        <p className="text-2xl font-bold text-white">KES {totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            <p className="text-white/70 text-sm">Pending</p>
                        </div>
                        <p className="text-2xl font-bold text-white">KES {pendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Total Transactions</p>
                        <p className="text-2xl font-bold text-white">{payments.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Success Rate</p>
                        <p className="text-2xl font-bold text-white">
                            {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-white">Loading payments...</div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="p-8 text-center text-white/70">No payments found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Payment ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-white">{payment.id.substring(0, 8)}...</div>
                                                {payment.description && (
                                                    <div className="text-xs text-white/50">{payment.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-white/70">{payment.user_id.substring(0, 12)}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-white">
                                                    {payment.currency} {payment.amount.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-white">
                                                    <CreditCard className="w-4 h-4 text-white/50" />
                                                    {payment.payment_method}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-white/70">
                                                    {payment.transaction_id || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-white/70">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
