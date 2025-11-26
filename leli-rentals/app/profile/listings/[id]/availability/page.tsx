"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { format, isSameDay, addDays, startOfDay } from "date-fns"
import { Calendar as CalendarIcon, Lock, Unlock, Info, ArrowLeft, Loader2 } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { bookingsDB, Booking } from "@/lib/interactions-database-service"

export default function AvailabilityPage() {
    const { id } = useParams()
    const listingId = id as string
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const { toast } = useToast()

    const [listing, setListing] = useState<any>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
    const [isBlocking, setIsBlocking] = useState(false)
    const [showBlockDialog, setShowBlockDialog] = useState(false)
    const [showUnblockDialog, setShowUnblockDialog] = useState(false)
    const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<Booking | null>(null)

    // Fetch listing and bookings
    useEffect(() => {
        const fetchData = async () => {
            if (!user || !listingId) return

            try {
                // 1. Fetch listing to verify ownership
                const { data: listingData, error: listingError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', listingId)
                    .single()

                if (listingError) throw listingError

                if (listingData.owner_id !== user.id) {
                    toast({
                        title: "Access Denied",
                        description: "You don't have permission to manage this listing.",
                        variant: "destructive"
                    })
                    router.push('/profile/listings')
                    return
                }

                setListing(listingData)

                // 2. Fetch all bookings for this listing
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('listing_id', listingId)
                    .neq('status', 'cancelled') // Don't show cancelled bookings

                if (bookingsError) throw bookingsError

                setBookings(bookingsData || [])
            } catch (error) {
                console.error("Error fetching data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load availability data.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (isLoaded && user) {
            fetchData()
        }
    }, [user, isLoaded, listingId, router, toast])

    // Helper to check if a date is blocked by owner
    const isBlockedByOwner = (date: Date) => {
        return bookings.some(booking =>
            booking.user_id === user?.id &&
            booking.status === 'confirmed' &&
            isDateInRange(date, new Date(booking.start_date), new Date(booking.end_date))
        )
    }

    // Helper to check if a date is booked by a renter
    const isBookedByRenter = (date: Date) => {
        return bookings.some(booking =>
            booking.user_id !== user?.id &&
            booking.status === 'confirmed' &&
            isDateInRange(date, new Date(booking.start_date), new Date(booking.end_date))
        )
    }

    // Helper to check if a date is pending
    const isPendingBooking = (date: Date) => {
        return bookings.some(booking =>
            booking.status === 'pending' &&
            isDateInRange(date, new Date(booking.start_date), new Date(booking.end_date))
        )
    }

    const isDateInRange = (date: Date, start: Date, end: Date) => {
        const d = startOfDay(date)
        const s = startOfDay(start)
        const e = startOfDay(end)
        return d >= s && d <= e
    }

    // Handle date selection
    const handleSelect = (range: DateRange | undefined) => {
        setSelectedRange(range)
        if (range?.from) {
            // Check if selected range overlaps with existing bookings
            // For now, just open dialog if valid
            setShowBlockDialog(true)
        }
    }

    // Block dates
    const handleBlockDates = async () => {
        if (!selectedRange?.from || !user || !listing) return

        setIsBlocking(true)
        try {
            const startDate = selectedRange.from
            const endDate = selectedRange.to || selectedRange.from

            // Create a "self-booking" to block dates
            const bookingData = {
                user_id: user.id, // Owner is the "renter"
                owner_id: user.id,
                listing_id: listing.id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                total_price: 0, // No cost for blocking
                status: 'confirmed' as const,
                payment_status: 'paid' as const, // Treat as paid/settled
                notes: 'Blocked by owner'
            }

            const result = await bookingsDB.createBooking(bookingData)

            if (result.success) {
                toast({
                    title: "Dates Blocked",
                    description: "The selected dates have been blocked from your calendar."
                })

                // Refresh bookings
                const { data } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('listing_id', listingId)
                    .neq('status', 'cancelled')

                setBookings(data || [])
                setSelectedRange(undefined)
            } else {
                throw new Error("Failed to block dates")
            }
        } catch (error) {
            console.error("Error blocking dates:", error)
            toast({
                title: "Error",
                description: "Failed to block dates. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsBlocking(false)
            setShowBlockDialog(false)
        }
    }

    // Unblock dates (cancel self-booking)
    const handleUnblock = async () => {
        if (!selectedBookingToCancel) return

        setIsBlocking(true)
        try {
            const result = await bookingsDB.updateBookingStatus(
                selectedBookingToCancel.id!,
                'cancelled'
            )

            if (result.success) {
                toast({
                    title: "Dates Unblocked",
                    description: "The dates are now available for booking."
                })

                // Refresh bookings
                const { data } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('listing_id', listingId)
                    .neq('status', 'cancelled')

                setBookings(data || [])
            } else {
                throw new Error("Failed to unblock dates")
            }
        } catch (error) {
            console.error("Error unblocking dates:", error)
            toast({
                title: "Error",
                description: "Failed to unblock dates.",
                variant: "destructive"
            })
        } finally {
            setIsBlocking(false)
            setShowUnblockDialog(false)
            setSelectedBookingToCancel(null)
        }
    }

    // Custom day content to show status indicators
    const modifiers = {
        blocked: (date: Date) => isBlockedByOwner(date),
        booked: (date: Date) => isBookedByRenter(date),
        pending: (date: Date) => isPendingBooking(date)
    }

    const modifiersStyles = {
        blocked: { backgroundColor: '#374151', color: 'white' }, // Gray-700
        booked: { backgroundColor: '#DC2626', color: 'white' }, // Red-600
        pending: { backgroundColor: '#D97706', color: 'white' } // Amber-600
    }

    if (isLoading) {
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
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/profile/listings')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Listings
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
                            <p className="text-gray-500">
                                {listing?.title}
                            </p>
                        </div>

                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                                <span>Blocked by You</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                <span>Booked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                                <span>Pending Request</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                            <CardDescription>
                                Select dates to block them from being booked. Click on blocked dates to unblock them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <DayPicker
                                mode="range"
                                selected={selectedRange}
                                onSelect={handleSelect}
                                modifiers={modifiers}
                                modifiersStyles={modifiersStyles}
                                disabled={[
                                    { before: new Date() } // Disable past dates
                                ]}
                                className="p-4 border rounded-lg bg-white shadow-sm"
                            />
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Bookings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bookings.filter(b => b.user_id !== user?.id && new Date(b.end_date) >= new Date()).length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings
                                            .filter(b => b.user_id !== user?.id && new Date(b.end_date) >= new Date())
                                            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                                            .slice(0, 5)
                                            .map(booking => (
                                                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div>
                                                        <div className="font-medium">
                                                            {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                                                        </div>
                                                        <div className="text-sm text-gray-500 capitalize">
                                                            {booking.status} • ${booking.total_price}
                                                        </div>
                                                    </div>
                                                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Your Blocks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bookings.filter(b => b.user_id === user?.id && b.status === 'confirmed' && new Date(b.end_date) >= new Date()).length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No active blocks</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings
                                            .filter(b => b.user_id === user?.id && b.status === 'confirmed' && new Date(b.end_date) >= new Date())
                                            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                                            .map(booking => (
                                                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div>
                                                        <div className="font-medium">
                                                            {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Blocked
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            setSelectedBookingToCancel(booking)
                                                            setShowUnblockDialog(true)
                                                        }}
                                                    >
                                                        Unblock
                                                    </Button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Block Dates Dialog */}
            <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block Dates</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to block these dates? Renters will not be able to book your item during this period.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedRange?.from && (
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                                <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                                <span className="font-medium">
                                    {format(selectedRange.from, 'PPP')}
                                    {selectedRange.to && ` - ${format(selectedRange.to, 'PPP')}`}
                                </span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
                        <Button onClick={handleBlockDates} disabled={isBlocking}>
                            {isBlocking ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Blocking...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Block Dates
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unblock Dates Dialog */}
            <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unblock Dates</DialogTitle>
                        <DialogDescription>
                            This will make these dates available for renters to book again.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>Cancel</Button>
                        <Button onClick={handleUnblock} disabled={isBlocking}>
                            {isBlocking ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Unblocking...
                                </>
                            ) : (
                                <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unblock Dates
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
