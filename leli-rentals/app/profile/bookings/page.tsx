"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search, Calendar, DollarSign, Star, MapPin, Eye, MessageCircle,
  Clock, CheckCircle, XCircle, AlertCircle, Truck, CreditCard,
  TrendingUp, Users, Award, Filter, Download, Share2, Phone,
  Bookmark, Plus, Heart, Tag, ArrowLeft
} from "lucide-react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { bookingsDB, Booking as DBBooking } from "@/lib/interactions-database-service"
import { hybridSavedBookingsService } from "@/lib/hybrid-saved-bookings-service"
import { SavedBooking } from "@/lib/types/saved-booking"
import LocationSelector from "@/components/location-selector"
import { supabase } from "@/lib/supabase"
import { ReviewForm } from "@/components/reviews/review-form"

// Booking interface matching the display format
interface Booking {
  id?: string
  listingId: string
  userId: string
  ownerId: string
  listingTitle: string
  listingImage: string
  ownerName: string
  ownerAvatar: string
  ownerRating: number
  dates: {
    start: Date
    end: Date
    duration: number
  }
  totalPrice: number
  bookingFee: number
  subtotal: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  category: string
  location: string
  createdAt?: Date
  updatedAt?: Date
  paymentStatus: "pending" | "paid" | "refunded"
  specialRequests?: string
  cancellationPolicy?: string
}

export default function BookingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  // Load user bookings from Supabase
  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get bookings from Supabase
        const dbBookings = await bookingsDB.getUserBookings(user.id)

        // Transform and enrich bookings with listing details
        const enrichedBookings: Booking[] = await Promise.all(
          dbBookings.map(async (dbBooking: DBBooking) => {
            // Fetch listing details to enrich booking data
            let listingTitle = 'Unknown Listing'
            let listingImage = '/placeholder.svg'
            let category = 'other'
            let location = ''
            let ownerName = 'Owner'
            let ownerAvatar = '/placeholder-user.jpg'
            let ownerRating = 4.5

            try {
              // Get listing details
              const { data: listing } = await supabase
                .from('listings')
                .select('title, images, category, location, contact_info, user_id')
                .eq('id', dbBooking.listing_id)
                .single()

              if (listing) {
                listingTitle = listing.title || 'Unknown Listing'
                listingImage = Array.isArray(listing.images) && listing.images.length > 0
                  ? listing.images[0]
                  : '/placeholder.svg'
                category = listing.category || 'other'
                location = listing.location || ''

                // Get owner details if available
                if (listing.contact_info) {
                  ownerName = listing.contact_info.name || 'Owner'
                  ownerAvatar = listing.contact_info.avatar || '/placeholder-user.jpg'
                }
              }
            } catch (error) {
              console.error('Error fetching listing details:', error)
            }

            // Calculate booking fee (10% service fee)
            const subtotal = dbBooking.total_price || 0
            const bookingFee = Math.round(subtotal * 0.1)
            const totalPrice = subtotal + bookingFee

            // Calculate duration
            const startDate = new Date(dbBooking.start_date)
            const endDate = new Date(dbBooking.end_date)
            const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1

            return {
              id: dbBooking.id,
              listingId: dbBooking.listing_id,
              userId: dbBooking.user_id,
              ownerId: dbBooking.owner_id,
              listingTitle,
              listingImage,
              ownerName,
              ownerAvatar,
              ownerRating,
              dates: {
                start: startDate,
                end: endDate,
                duration
              },
              subtotal,
              bookingFee,
              totalPrice,
              status: dbBooking.status,
              category,
              location,
              paymentStatus: dbBooking.payment_status,
              createdAt: dbBooking.created_at ? new Date(dbBooking.created_at) : new Date(),
              updatedAt: dbBooking.updated_at ? new Date(dbBooking.updated_at) : new Date(),
              specialRequests: dbBooking.notes || undefined,
              cancellationPolicy: 'Free cancellation up to 24 hours before booking starts.'
            }
          })
        )

        setBookings(enrichedBookings)
      } catch (error) {
        console.error("Error loading bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load your bookings",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadBookings()
  }, [user, toast])

  // Load saved bookings
  useEffect(() => {
    const loadSavedBookings = async () => {
      if (!user) return

      setIsLoadingSaved(true)
      try {
        const userSavedBookings = await hybridSavedBookingsService.getUserSavedBookings(user.id)
        setSavedBookings(userSavedBookings)
      } catch (error) {
        console.error("Error loading saved bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load your saved bookings",
          variant: "destructive"
        })
      } finally {
        setIsLoadingSaved(false)
      }
    }
    loadSavedBookings()
  }, [user, toast])
  const [isCancellingBooking, setIsCancellingBooking] = useState(false)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null)

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesTab = activeTab === "all" || booking.status === activeTab
    return matchesSearch && matchesStatus && matchesTab
  })

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled and any refunds will be processed within 5-7 business days.",
      })

      setIsCancellingBooking(false)
      setCancellingBookingId(null)
    } catch (error) {
      toast({
        title: "Error cancelling booking",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  const handleContactOwner = async (ownerName: string) => {
    try {
      // Show loading toast
      toast({
        title: "Opening chat",
        description: `Starting a conversation with ${ownerName}...`,
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to messages page
      router.push(`/messages?owner=${encodeURIComponent(ownerName)}`)

    } catch (error) {
      toast({
        title: "Error opening chat",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewListing = (listingId: string) => {
    router.push(`/listings/details/${listingId}`)
  }

  const handleDownloadReceipt = async (bookingId: string) => {
    try {
      // Find the booking details
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) {
        toast({
          title: "Booking not found",
          description: "Unable to find booking details.",
          variant: "destructive",
        })
        return
      }

      // Show loading toast
      toast({
        title: "Generating receipt",
        description: "Creating your booking receipt...",
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate receipt content
      const receiptContent = `
LELI RENTALS - BOOKING RECEIPT
================================

Booking ID: ${booking.id}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

RENTAL DETAILS:
---------------
Item: ${booking.listingTitle}
Owner: ${booking.ownerName}
Duration: ${booking.dates.duration} day(s)
Start Date: ${booking.dates.start.toLocaleDateString()}
End Date: ${booking.dates.end.toLocaleDateString()}
Location: ${booking.location}

PRICING:
--------
Daily Rate: KSh ${(booking.subtotal / booking.dates.duration).toFixed(2)}
Total Duration: ${booking.dates.duration} day(s)
Subtotal: KSh ${booking.subtotal.toLocaleString('en-KE')}
Booking Fee (10%): KSh ${booking.bookingFee.toLocaleString('en-KE')}
Total Amount: KSh ${booking.totalPrice.toLocaleString('en-KE')}

STATUS:
-------
Booking Status: ${booking.status.toUpperCase()}
Payment Status: ${booking.paymentStatus.toUpperCase()}

POLICIES:
---------
${booking.cancellationPolicy}

Thank you for choosing Leli Rentals!
For support, contact: support@lelirentals.com
      `.trim()

      // Create and download the receipt
      const blob = new Blob([receiptContent], { type: 'text/plain' })
      if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `receipt-${booking.id}-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      toast({
        title: "✅ Receipt downloaded",
        description: "Your booking receipt has been downloaded successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error downloading receipt:', error)
      toast({
        title: "❌ Error downloading receipt",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveSavedBooking = async (listingId: string) => {
    if (!user) return

    try {
      await hybridSavedBookingsService.removeSavedBooking(user.id, listingId)
      setSavedBookings(prev => prev.filter(booking => booking.listingId !== listingId))

      toast({
        title: "Removed from saved",
        description: "The listing has been removed from your saved bookings.",
      })
    } catch (error) {
      toast({
        title: "Error removing saved booking",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBookFromSaved = (savedBooking: SavedBooking) => {
    // Navigate to listings page with the specific listing
    router.push(`/listings?id=${savedBooking.listingId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  if (!isLoaded || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 hover:bg-purple-100 dark:hover:bg-purple-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-6 sm:mb-8 fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Manage your rental bookings and track their status
              </p>
            </div>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            >
              Back to Profile
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="border-0 shadow-lg card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 fade-in-up stagger-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{bookings.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 fade-in-up stagger-2">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors duration-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                    {bookings.filter(b => b.status === "confirmed").length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Confirmed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 fade-in-up stagger-3">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-colors duration-200">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    KSh {bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString('en-KE')}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 fade-in-up stagger-4">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg transition-colors duration-200">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {bookings.length > 0 ? (Math.round(bookings.reduce((sum, b) => sum + b.ownerRating, 0) / bookings.length * 10) / 10).toFixed(1) : "0.0"}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Avg. Owner Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg mb-4 sm:mb-6 card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 fade-in-up stagger-5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 sm:h-10 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 focus-enhanced"
                  />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl p-1 transition-all duration-300">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 btn-animate">
              All Bookings
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 btn-animate">
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 btn-animate">
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 btn-animate">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 btn-animate">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 btn-animate">
              <Bookmark className="h-4 w-4 mr-1" />
              Saved for Later ({savedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Listing Image */}
                      <div className="w-full lg:w-48 h-32 overflow-hidden rounded-lg">
                        <img
                          src={booking.listingImage || "/placeholder.svg"}
                          alt={booking.listingTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">{booking.listingTitle}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(booking.dates.start).toLocaleDateString()} - {new Date(booking.dates.end).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>KSh {booking.totalPrice.toLocaleString('en-KE')} total</span>
                              </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Subtotal ({booking.dates.duration} day{booking.dates.duration > 1 ? 's' : ''}):</span>
                                <span className="font-medium">KSh {booking.subtotal.toLocaleString('en-KE')}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Booking Fee (10%):</span>
                                <span className="font-medium">KSh {booking.bookingFee.toLocaleString('en-KE')}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">KSh {booking.totalPrice.toLocaleString('en-KE')}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{booking.ownerRating}</span>
                                <span className="text-sm text-muted-foreground">({booking.ownerName})</span>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1">{booking.status}</span>
                              </Badge>
                              <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>

                            {booking.specialRequests && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Special Requests:</strong> {booking.specialRequests}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewListing(booking.listingId)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Listing
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleContactOwner(booking.ownerName)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Contact Owner
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => booking.id && handleDownloadReceipt(booking.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Receipt
                              </Button>
                            </div>

                            {booking.status === "confirmed" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => booking.id && setCancellingBookingId(booking.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel Booking
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel your booking for "{booking.listingTitle}"?
                                      {booking.cancellationPolicy && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                          <strong>Cancellation Policy:</strong> {booking.cancellationPolicy}
                                        </div>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => booking.id && handleCancelBooking(booking.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Cancel Booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {booking.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBookingForReview(booking)
                                  setShowReviewModal(true)
                                }}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Leave Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || activeTab !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Start exploring and book your first rental!"
                    }
                  </p>
                  {!searchQuery && statusFilter === "all" && activeTab === "all" && (
                    <Button
                      onClick={() => router.push('/listings')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Browse Listings
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Bookings Tab */}
          <TabsContent value="saved" className="space-y-6 mt-6">
            {isLoadingSaved ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading saved bookings...</p>
              </div>
            ) : savedBookings.length > 0 ? (
              <div className="space-y-4">
                {savedBookings.map((savedBooking) => (
                  <Card key={savedBooking.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Listing Image */}
                        <div className="w-full lg:w-48 h-32 overflow-hidden rounded-lg">
                          <img
                            src={savedBooking.listingImage}
                            alt={savedBooking.listingTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </div>

                        {/* Saved Booking Details */}
                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold">{savedBooking.listingTitle}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {savedBooking.listingLocation}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  KSh {savedBooking.listingPrice.toLocaleString('en-KE')}/day
                                </div>
                                <div className="flex items-center gap-1">
                                  <Tag className="h-4 w-4" />
                                  {savedBooking.listingCategory}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  <Bookmark className="h-3 w-3 mr-1" />
                                  Saved {new Date(savedBooking.savedAt).toLocaleDateString()}
                                </Badge>
                              </div>

                              {savedBooking.notes && (
                                <div className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {savedBooking.notes}
                                </div>
                              )}

                              {savedBooking.tags && savedBooking.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {savedBooking.tags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleBookFromSaved(savedBooking)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Book Now
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/listings?id=${savedBooking.listingId}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveSavedBooking(savedBooking.listingId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved listings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Use "Save for Later" on listings to add them here. These are items you're interested in but haven't booked yet.
                  </p>
                  <Button
                    onClick={() => router.push('/listings')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Browse Listings
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Share your feedback about your rental of {selectedBookingForReview?.listingTitle}
            </DialogDescription>
          </DialogHeader>
          {selectedBookingForReview && user && (
            <ReviewForm
              listingId={selectedBookingForReview.listingId}
              bookingId={selectedBookingForReview.id!}
              userId={user.id}
              onSuccess={() => setShowReviewModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}




