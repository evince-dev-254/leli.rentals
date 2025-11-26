'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Tag, Trash2, Calendar, Percent, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface Coupon {
    id: string
    code: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_booking_amount?: number
    max_discount_amount?: number
    start_date: string
    expiry_date?: string
    max_uses?: number
    current_uses: number
    is_active: boolean
}

export default function CouponsPage() {
    const { user } = useUser()
    const { toast } = useToast()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_booking_amount: '',
        max_discount_amount: '',
        start_date: '',
        expiry_date: '',
        max_uses: ''
    })

    useEffect(() => {
        if (user) {
            fetchCoupons()
        }
    }, [user])

    const fetchCoupons = async () => {
        try {
            const response = await fetch(`/api/coupons?ownerId=${user?.id}`)
            if (!response.ok) throw new Error('Failed to fetch coupons')
            const data = await response.json()
            setCoupons(data)
        } catch (error) {
            console.error('Error fetching coupons:', error)
            toast({
                title: "Error",
                description: "Failed to load coupons",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateCoupon = async () => {
        try {
            setIsCreating(true)

            // Validation
            if (!newCoupon.code || !newCoupon.discount_value || !newCoupon.start_date || !newCoupon.expiry_date) {
                toast({
                    title: "Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                })
                return
            }

            const payload = {
                owner_id: user?.id,
                code: newCoupon.code.toUpperCase(),
                description: newCoupon.description,
                discount_type: newCoupon.discount_type,
                discount_value: parseFloat(newCoupon.discount_value),
                min_booking_amount: newCoupon.min_booking_amount ? parseFloat(newCoupon.min_booking_amount) : null,
                max_discount_amount: newCoupon.max_discount_amount ? parseFloat(newCoupon.max_discount_amount) : null,
                start_date: new Date(newCoupon.start_date).toISOString(),
                expiry_date: newCoupon.expiry_date ? new Date(newCoupon.expiry_date).toISOString() : null,
                max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null
            }

            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to create coupon')

            toast({
                title: "Success",
                description: "Coupon created successfully"
            })

            setShowCreateModal(false)
            fetchCoupons()
            setNewCoupon({
                code: '',
                description: '',
                discount_type: 'percentage',
                discount_value: '',
                min_booking_amount: '',
                max_discount_amount: '',
                start_date: '',
                expiry_date: '',
                max_uses: ''
            })
        } catch (error) {
            console.error('Error creating coupon:', error)
            toast({
                title: "Error",
                description: "Failed to create coupon",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this coupon?')) return

        try {
            const response = await fetch(`/api/coupons?id=${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete coupon')

            toast({
                title: "Success",
                description: "Coupon deactivated successfully"
            })

            fetchCoupons()
        } catch (error) {
            console.error('Error deleting coupon:', error)
            toast({
                title: "Error",
                description: "Failed to deactivate coupon",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Coupons & Deals</h1>
                    <p className="text-gray-600 mt-2">Manage discounts for your properties</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Coupon</DialogTitle>
                            <DialogDescription>Set up a new discount code for your customers</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    placeholder="SUMMER2024"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Discount Type</Label>
                                <Select
                                    value={newCoupon.discount_type}
                                    onValueChange={(value) => setNewCoupon({ ...newCoupon, discount_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Discount Value *</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    placeholder={newCoupon.discount_type === 'percentage' ? "10" : "50"}
                                    value={newCoupon.discount_value}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_uses">Usage Limit (Optional)</Label>
                                <Input
                                    id="max_uses"
                                    type="number"
                                    placeholder="100"
                                    value={newCoupon.max_uses}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={newCoupon.start_date}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry_date">Expiry Date *</Label>
                                <Input
                                    id="expiry_date"
                                    type="date"
                                    value={newCoupon.expiry_date}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min_amount">Min Booking Amount (Optional)</Label>
                                <Input
                                    id="min_amount"
                                    type="number"
                                    placeholder="100"
                                    value={newCoupon.min_booking_amount}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, min_booking_amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_discount">Max Discount Amount (Optional)</Label>
                                <Input
                                    id="max_discount"
                                    type="number"
                                    placeholder="50"
                                    value={newCoupon.max_discount_amount}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, max_discount_amount: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Summer sale discount for all properties"
                                    value={newCoupon.description}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button onClick={handleCreateCoupon} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Coupon'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Coupons</CardTitle>
                    <CardDescription>View and manage your active discount codes</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading coupons...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No coupons created yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-blue-600" />
                                                {coupon.code}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{coupon.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <span className="flex items-center"><Percent className="h-3 w-3 mr-1" /> {coupon.discount_value}%</span>
                                                ) : (
                                                    <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> {coupon.discount_value}</span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.current_uses} / {coupon.max_uses || '∞'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(coupon.start_date), 'MMM d')} - {coupon.expiry_date ? format(new Date(coupon.expiry_date), 'MMM d, yyyy') : 'No expiry'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteCoupon(coupon.id)}
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
