'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Tag, Percent, Calendar, CheckCircle, XCircle, Search } from 'lucide-react'

interface Coupon {
    id: string
    owner_id: string
    code: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    start_date: string
    expiry_date: string | null
    max_uses: number | null
    current_uses: number
    is_active: boolean
    created_at: string
}

interface SpecialOffer {
    id: string
    owner_id: string
    listing_id: string
    title: string
    description: string
    discount_percentage: number
    start_date: string
    end_date: string
    is_active: boolean
    views_count: number
    bookings_generated: number
    listings?: {
        title: string
    }
}

export default function CouponsPage() {
    const [activeTab, setActiveTab] = useState<'coupons' | 'offers'>('coupons')
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchData()
    }, [activeTab])

    async function fetchData() {
        try {
            setLoading(true)
            if (activeTab === 'coupons') {
                const response = await fetch('/api/coupons/list')
                const data = await response.json()
                setCoupons(data || [])
            } else {
                const response = await fetch('/api/special-offers/list')
                const data = await response.json()
                setOffers(data || [])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.owner_id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredOffers = offers.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.listings?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.owner_id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-white">Promotions Management</h1>

                        {/* Tabs */}
                        <div className="flex bg-white/10 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('coupons')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'coupons'
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Coupons
                            </button>
                            <button
                                onClick={() => setActiveTab('offers')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'offers'
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Special Offers
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                            type="text"
                            placeholder={activeTab === 'coupons' ? "Search by code or owner ID..." : "Search by title, listing, or owner ID..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-white">Loading...</div>
                    ) : activeTab === 'coupons' ? (
                        // Coupons Table
                        filteredCoupons.length === 0 ? (
                            <div className="p-8 text-center text-white/70">No coupons found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/20">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Discount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Usage</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Owner</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredCoupons.map((coupon) => (
                                            <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-blue-400" />
                                                        <span className="font-mono font-bold text-white">{coupon.code}</span>
                                                    </div>
                                                    {coupon.description && <div className="text-xs text-white/50 mt-1">{coupon.description}</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-white">
                                                    {coupon.discount_type === 'percentage' ? (
                                                        <span className="text-green-300">{coupon.discount_value}% OFF</span>
                                                    ) : (
                                                        <span className="text-green-300">KES {coupon.discount_value} OFF</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-white/70">
                                                    {coupon.current_uses} / {coupon.max_uses || '∞'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {coupon.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                                            <CheckCircle className="w-3 h-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                                                            <XCircle className="w-3 h-3" /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-white/50 font-mono">
                                                    {coupon.owner_id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                                    {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        // Special Offers Table
                        filteredOffers.length === 0 ? (
                            <div className="p-8 text-center text-white/70">No special offers found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/20">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Listing</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Discount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Performance</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Dates</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredOffers.map((offer) => (
                                            <tr key={offer.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-white">{offer.title}</div>
                                                    {offer.description && <div className="text-xs text-white/50 mt-1 truncate max-w-[200px]">{offer.description}</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                                                    {offer.listings?.title || 'Unknown Listing'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-white">
                                                    <span className="flex items-center gap-1 text-purple-300 font-bold">
                                                        <Percent className="w-3 h-3" />
                                                        {offer.discount_percentage}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                                    <div className="flex flex-col gap-1">
                                                        <span>👁️ {offer.views_count} views</span>
                                                        <span>📅 {offer.bookings_generated} bookings</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {offer.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                                            <CheckCircle className="w-3 h-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                                                            <XCircle className="w-3 h-3" /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="text-green-400/70">Start: {new Date(offer.start_date).toLocaleDateString()}</span>
                                                        <span className="text-red-400/70">End: {new Date(offer.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
