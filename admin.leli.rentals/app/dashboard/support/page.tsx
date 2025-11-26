'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { MessageCircle, AlertCircle, CheckCircle, Clock, User, Search } from 'lucide-react'

interface Ticket {
    id: string
    user_id: string
    user_email?: string
    subject: string
    description: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category: string
    created_at: string
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchTickets()
    }, [filterStatus])

    async function fetchTickets() {
        try {
            setLoading(true)
            const response = await fetch(`/api/support/tickets?status=${filterStatus}`)
            const data = await response.json()
            setTickets(data || [])
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTickets = tickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            case 'in_progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
            case 'resolved': return 'bg-green-500/20 text-green-300 border-green-500/30'
            case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 font-bold'
            case 'high': return 'text-orange-400'
            case 'medium': return 'text-yellow-400'
            case 'low': return 'text-green-400'
            default: return 'text-gray-400'
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-4">Customer Support</h1>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <option value="all" className="bg-gray-900">All Status</option>
                            <option value="open" className="bg-gray-900">Open</option>
                            <option value="in_progress" className="bg-gray-900">In Progress</option>
                            <option value="resolved" className="bg-gray-900">Resolved</option>
                            <option value="closed" className="bg-gray-900">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center text-white py-8">Loading tickets...</div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center text-white/70 py-8">No tickets found</div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <div key={ticket.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{ticket.subject}</h3>
                                        <div className="flex items-center gap-2 text-sm text-white/50">
                                            <User className="w-3 h-3" />
                                            {ticket.user_email || ticket.user_id}
                                            <span className="mx-1">•</span>
                                            <Clock className="w-3 h-3" />
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className={`text-xs uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority} Priority
                                        </span>
                                    </div>
                                </div>
                                <p className="text-white/80 text-sm mb-4 bg-black/20 p-3 rounded-lg">
                                    {ticket.description}
                                </p>
                                <div className="flex justify-end gap-2">
                                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all">
                                        View Details
                                    </button>
                                    <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-sm transition-all">
                                        Reply
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
