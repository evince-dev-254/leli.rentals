'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Tag, Trash2, Edit, TrendingUp, Eye, Calendar, Percent } from 'lucide-react'
import { format } from 'date-fns'

interface Listing {
    id: string
    title: string
}

interface SpecialOffer {
    id: string
    owner_id: string
    listing_id: string | null
    title: string
    description?: string
    discount_percentage: number
    start_date: string
    end_date: string
    is_active: boolean
    views_count: number
    bookings_generated: number
    created_at: string
}

export default function SpecialOffersPage() {
    const { user } = useUser()
    const { toast } = useToast()
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [newOffer, setNewOffer] = useState({
        title: '',
        description: '',
        listing_id: '',
        discount_percentage: '',
        start_date: '',
        end_date: ''
    })

    useEffect(() => {
        if (user) {
            fetchOffers()
            fetchListings()
        }
    }, [user])

    const fetchOffers = async () => {
        try {
            const response = await fetch(`/api/special-offers?ownerId=${user?.id}`)
            if (!response.ok) throw new Error('Failed to fetch special offers')
            const data = await response.json()
            setOffers(data)
        } catch (error) {
            console.error('Error fetching special offers:', error)
            toast({
                title: "Error",
                description: "Failed to load special offers",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchListings = async () => {
        try {
            const response = await fetch(`/api/owner/listings?ownerId=${user?.id}`)
            if (!response.ok) throw new Error('Failed to fetch listings')
            const data = await response.json()
            setListings(data)
        } catch (error) {
            console.error('Error fetching listings:', error)
        }
    }

    const handleCreateOffer = async () => {
        try {
            setIsCreating(true)

            // Validation
            if (!newOffer.title || !newOffer.discount_percentage || !newOffer.start_date || !newOffer.end_date) {
                toast({
                    title: "Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                })
                return
            }

            const discountValue = parseFloat(newOffer.discount_percentage)
            if (discountValue <= 0 || discountValue > 100) {
                toast({
                    title: "Error",
                    description: "Discount percentage must be between 1 and 100",
                    variant: "destructive"
                })
                return
            }

            const payload = {
                owner_id: user?.id,
                title: newOffer.title,
                description: newOffer.description || null,
                listing_id: newOffer.listing_id || null,
                discount_percentage: discountValue,
                start_date: new Date(newOffer.start_date).toISOString(),
                end_date: new Date(newOffer.end_date).toISOString()
            }

            const response = await fetch('/api/special-offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create special offer')
            }

            toast({
                title: "Success",
                description: "Special offer created successfully"
            })

            setShowCreateModal(false)
            fetchOffers()
            setNewOffer({
                title: '',
                description: '',
                listing_id: '',
                discount_percentage: '',
                start_date: '',
                end_date: ''
            })
        } catch (error: any) {
            console.error('Error creating special offer:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to create special offer",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteOffer = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this special offer?')) return

        try {
            const response = await fetch(`/api/special-offers?id=${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete special offer')

            toast({
                title: "Success",
                description: "Special offer deactivated successfully"
            })

            fetchOffers()
        } catch (error) {
            console.error('Error deleting special offer:', error)
            toast({
                title: "Error",
                description: "Failed to deactivate special offer",
                variant: "destructive"
            })
        }
    }

    const getListingTitle = (listingId: string | null) => {
        if (!listingId) return 'All Listings'
        const listing = listings.find(l => l.id === listingId)
        return listing?.title || 'Unknown Listing'
    }

    const isOfferActive = (offer: SpecialOffer) => {
        if (!offer.is_active) return false
        const now = new Date()
        const start = new Date(offer.start_date)
        const end = new Date(offer.end_date)
        return now >= start && now <= end
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
                    <p className="text-gray-600 mt-2">Create promotional deals for your listings</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Offer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Special Offer</DialogTitle>
                            <DialogDescription>Set up a promotional deal that will be displayed automatically</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="title">Offer Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Summer Sale - 30% Off!"
                                    value={newOffer.title}
                                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Limited time offer for the summer season"
                                    value={newOffer.description}
                                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="listing">Apply To</Label>
                                <Select
                                    value={newOffer.listing_id}
                                    onValueChange={(value) => setNewOffer({ ...newOffer, listing_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All my listings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All my listings</SelectItem>
                                        {listings.map((listing) => (
                                            <SelectItem key={listing.id} value={listing.id}>
                                                {listing.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount % *</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="25"
                                    value={newOffer.discount_percentage}
                                    onChange={(e) => setNewOffer({ ...newOffer, discount_percentage: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={newOffer.start_date}
                                    onChange={(e) => setNewOffer({ ...newOffer, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date *</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={newOffer.end_date}
                                    onChange={(e) => setNewOffer({ ...newOffer, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button onClick={handleCreateOffer} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Offer'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Special Offers</CardTitle>
                    <CardDescription>Manage promotional deals that apply automatically to bookings</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading offers...</div>
                    ) : offers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No special offers created yet</p>
                            <p className="text-sm mt-2">Create an offer to attract more customers</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Applies To</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Performance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {offers.map((offer) => (
                                    <TableRow key={offer.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                {offer.title}
                                                {offer.description && (
                                                    <div className="text-xs text-gray-500 mt-1">{offer.description}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{getListingTitle(offer.listing_id)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                <Percent className="h-3 w-3 mr-1" />
                                                {offer.discount_percentage}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(offer.start_date), 'MMM d')} - {format(new Date(offer.end_date), 'MMM d, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-3 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {offer.views_count}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {offer.bookings_generated}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={isOfferActive(offer) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {isOfferActive(offer) ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteOffer(offer.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
