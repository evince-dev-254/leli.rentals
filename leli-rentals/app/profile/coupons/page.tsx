"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Plus, Trash2, Tag, Loader2, AlertCircle } from "lucide-react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { couponService, Coupon } from "@/lib/coupon-service"

export default function CouponsPage() {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const { toast } = useToast()

    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discount_type: "percentage" as "percentage" | "fixed",
        discount_value: "",
        min_booking_amount: "",
        max_uses: "",
        expiry_date: ""
    })

    // Fetch coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            if (!user) return

            try {
                const data = await couponService.getOwnerCoupons(user.id)
                setCoupons(data)
            } catch (error) {
                console.error("Error fetching coupons:", error)
                toast({
                    title: "Error",
                    description: "Failed to load coupons.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (isLoaded && user) {
            fetchCoupons()
        }
    }, [user, isLoaded, toast])

    const handleCreateCoupon = async () => {
        if (!user) return
        if (!formData.code || !formData.discount_value) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields.",
                variant: "destructive"
            })
            return
        }

        setIsCreating(true)
        try {
            await couponService.createCoupon({
                owner_id: user.id,
                code: formData.code.toUpperCase(),
                description: formData.description,
                discount_type: formData.discount_type,
                discount_value: Number(formData.discount_value),
                min_booking_amount: formData.min_booking_amount ? Number(formData.min_booking_amount) : undefined,
                max_uses: formData.max_uses ? Number(formData.max_uses) : undefined,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : undefined,
                start_date: new Date().toISOString()
            })

            toast({
                title: "Success",
                description: "Coupon created successfully!"
            })

            // Refresh list
            const data = await couponService.getOwnerCoupons(user.id)
            setCoupons(data)

            // Reset form and close dialog
            setFormData({
                code: "",
                description: "",
                discount_type: "percentage",
                discount_value: "",
                min_booking_amount: "",
                max_uses: "",
                expiry_date: ""
            })
            setShowCreateDialog(false)

        } catch (error: any) {
            console.error("Error creating coupon:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to create coupon.",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return

        try {
            await couponService.deleteCoupon(id)
            setCoupons(coupons.filter(c => c.id !== id))
            toast({
                title: "Deleted",
                description: "Coupon deleted successfully."
            })
        } catch (error) {
            console.error("Error deleting coupon:", error)
            toast({
                title: "Error",
                description: "Failed to delete coupon.",
                variant: "destructive"
            })
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
                        <p className="text-gray-500">Create and manage discount codes for your listings.</p>
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Coupon</DialogTitle>
                                <DialogDescription>
                                    Create a discount code that renters can use when booking your listings.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Coupon Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="SUMMER2024"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Discount Type</Label>
                                        <Select
                                            value={formData.discount_type}
                                            onValueChange={(val: "percentage" | "fixed") => setFormData({ ...formData, discount_type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount (KSh)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="value">Discount Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        placeholder={formData.discount_type === 'percentage' ? "10" : "1000"}
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Summer special discount"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="min_amount">Min Booking (KSh)</Label>
                                        <Input
                                            id="min_amount"
                                            type="number"
                                            placeholder="0"
                                            value={formData.min_booking_amount}
                                            onChange={(e) => setFormData({ ...formData, min_booking_amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_uses">Usage Limit</Label>
                                        <Input
                                            id="max_uses"
                                            type="number"
                                            placeholder="Unlimited"
                                            value={formData.max_uses}
                                            onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input
                                        id="expiry"
                                        type="date"
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                <Button onClick={handleCreateCoupon} disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Coupon"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Coupons</CardTitle>
                        <CardDescription>
                            Manage your active and expired coupons.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-12">
                                <Tag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No coupons yet</h3>
                                <p className="text-gray-500 mt-2">Create your first coupon to attract more bookings.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Discount</TableHead>
                                            <TableHead>Usage</TableHead>
                                            <TableHead>Expiry</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.map((coupon) => (
                                            <TableRow key={coupon.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{coupon.code}</span>
                                                        {coupon.description && (
                                                            <span className="text-xs text-gray-500">{coupon.description}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {coupon.discount_type === 'percentage'
                                                        ? `${coupon.discount_value}%`
                                                        : `KSh ${coupon.discount_value}`}
                                                </TableCell>
                                                <TableCell>
                                                    {coupon.current_uses} / {coupon.max_uses || '∞'}
                                                </TableCell>
                                                <TableCell>
                                                    {coupon.expiry_date
                                                        ? format(new Date(coupon.expiry_date), 'MMM d, yyyy')
                                                        : 'No expiry'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
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
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
