"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Heart,
  Share2,
  MapPin,
  Star,
  Car,
  Home,
  Wrench,
  Music,
  Shirt,
  Laptop,
  Dumbbell,
  Camera,
  Bookmark,
  Calendar,
  MessageCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Listing } from "@/lib/listings-service"
import { mockListings } from "@/lib/mock-listings-data"
import { useUser } from '@clerk/nextjs'
import { useInteractions } from "@/lib/hooks/use-interactions"
import { useToast } from "@/hooks/use-toast"
import { bookingsDB } from "@/lib/interactions-database-service"
import { notificationService } from "@/lib/notification-service"
import { useNotifications } from "@/lib/notification-context"
import GoogleMapsAutocomplete from '@/components/google-maps-autocomplete'
import { supabase } from "@/lib/supabase"
import { NotificationType } from "@/lib/types/notification"
import { AccountTypeRequiredDropdown } from "@/components/account-type-required-dropdown"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isWithinInterval, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

// Mock listings are now imported from lib/mock-listings-data.ts

const mockCategories = [
  { id: "all", name: "All Categories", count: mockListings.length },
  { id: "vehicles", name: "Vehicles", count: mockListings.filter(l => l.category === "vehicles").length },
  { id: "homes", name: "Homes & Apartments", count: mockListings.filter(l => l.category === "homes").length },
  { id: "equipment", name: "Equipment & Tools", count: mockListings.filter(l => l.category === "equipment").length },
  { id: "events", name: "Event Spaces & Venues", count: mockListings.filter(l => l.category === "events").length },
  { id: "fashion", name: "Fashion & Lifestyle", count: mockListings.filter(l => l.category === "fashion").length },
  { id: "tech", name: "Tech & Gadgets", count: mockListings.filter(l => l.category === "tech").length },
  { id: "sports", name: "Sports & Recreation", count: mockListings.filter(l => l.category === "sports").length },
]

export default function ListingsPage() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { interactions, toggleLike, toggleSave, trackView, trackShare } = useInteractions()
  const { addNotification } = useNotifications()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Enhanced filter states
  const [availabilityFilter, setAvailabilityFilter] = useState("any")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [ratingFilter, setRatingFilter] = useState("any")
  const [locationFilter, setLocationFilter] = useState("")

  // Check if user has account type
  const hasAccountType = user && (
    (user.publicMetadata?.accountType as string) ||
    (user.unsafeMetadata?.accountType as string)
  )

  // Fetch listings from Supabase
  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching listings:', error)
        // Fallback to mock data if Supabase fails
        setListings(mockListings)
        setCategories(mockCategories)
        return
      }

      // Fetch active bookings for availability check
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('listing_id, start_date, end_date, status')
        .neq('status', 'cancelled')
        .gte('end_date', new Date().toISOString())

      if (bookingsData) {
        setBookings(bookingsData)
      }

      if (data && data.length > 0) {
        // Transform Supabase data to Listing format
        const transformedListings: Listing[] = data.map((item: any) => {
          // Handle images: use database images if available, only fallback if truly missing
          const dbImages = Array.isArray(item.images) && item.images.length > 0
            ? item.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
            : null

          return {
            id: item.id,
            title: item.title,
            description: item.description || '',
            fullDescription: item.description || '',
            price: item.price,
            location: item.location || '',
            rating: 4.5, // Default rating
            reviews: Math.floor(Math.random() * 200) + 10,
            image: dbImages?.[0] || '/placeholder.svg',
            images: dbImages || ['/placeholder.svg'],
            amenities: item.features || [],
            available: true,
            category: item.category,
            owner: {
              id: item.user_id,
              name: item.contact_info?.name || 'Owner',
              rating: 4.8,
              verified: true,
              phone: item.contact_info?.phone || ''
            },
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at || item.created_at)
          }
        })

        setListings(transformedListings)

        // Update categories with actual counts
        const categoryCount: Record<string, number> = {}
        transformedListings.forEach(l => {
          categoryCount[l.category] = (categoryCount[l.category] || 0) + 1
        })

        setCategories([
          { id: "all", name: "All Categories", count: transformedListings.length },
          { id: "vehicles", name: "Vehicles", count: categoryCount['vehicles'] || 0 },
          { id: "homes", name: "Homes & Apartments", count: categoryCount['homes'] || 0 },
          { id: "equipment", name: "Equipment & Tools", count: categoryCount['equipment'] || 0 },
          { id: "events", name: "Event Spaces & Venues", count: categoryCount['events'] || 0 },
          { id: "fashion", name: "Fashion & Lifestyle", count: categoryCount['fashion'] || 0 },
          { id: "tech", name: "Tech & Gadgets", count: categoryCount['tech'] || 0 },
          { id: "sports", name: "Sports & Recreation", count: categoryCount['sports'] || 0 },
        ])
      } else {
        // No data from Supabase, use mock data
        setListings(mockListings)
        setCategories(mockCategories)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      // Fallback to mock data
      setListings(mockListings)
      setCategories(mockCategories)
    }
  }

  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
    fetchListings()
  }, [])

  useEffect(() => {
    const search = searchParams ? searchParams.get("search") : null
    const category = searchParams ? searchParams.get("category") : null

    if (search) setSearchQuery(search)
    if (category) setSelectedCategory(category)
  }, [searchParams])

  useEffect(() => {
    let filteredListings = [...mockListings]

    // Filter by category
    if (selectedCategory !== "all") {
      filteredListings = filteredListings.filter(listing => listing.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredListings = filteredListings.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query)
      )
    }

    // Filter by location
    if (locationFilter) {
      const location = locationFilter.toLowerCase()
      filteredListings = filteredListings.filter(listing =>
        listing.location.toLowerCase().includes(location)
      )
    }

    // Filter by price range
    filteredListings = filteredListings.filter(listing =>
      listing.price >= priceRange.min && listing.price <= priceRange.max
    )

    // Filter by rating
    if (ratingFilter !== "any") {
      const minRating = parseFloat(ratingFilter)
      filteredListings = filteredListings.filter(listing => listing.rating >= minRating)
    }

    // Filter by availability
    if (dateRange?.from && dateRange?.to) {
      filteredListings = filteredListings.filter(listing => {
        // Check if listing has any overlapping bookings
        const hasOverlap = bookings.some(booking => {
          if (booking.listing_id !== listing.id) return false

          const bookingStart = parseISO(booking.start_date)
          const bookingEnd = parseISO(booking.end_date)
          const rangeStart = dateRange.from!
          const rangeEnd = dateRange.to!

          // Check for overlap
          return (
            (rangeStart <= bookingEnd && rangeStart >= bookingStart) ||
            (rangeEnd <= bookingEnd && rangeEnd >= bookingStart) ||
            (rangeStart <= bookingStart && rangeEnd >= bookingEnd)
          )
        })

        return !hasOverlap
      })
    } else if (availabilityFilter !== "any") {
      // Legacy simple filter
      filteredListings = filteredListings.filter(listing => {
        // Mock availability logic - in real app, this would check actual availability
        const isAvailable = Math.random() > 0.3 // 70% chance of being available
        return isAvailable
      })
    }

    // Sort listings
    filteredListings.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        case "oldest":
          return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "popularity":
          return (b.reviews || 0) - (a.reviews || 0)
        default:
          return 0
      }
    })

    setListings(filteredListings)
  }, [selectedCategory, searchQuery, sortBy, priceRange, availabilityFilter, ratingFilter, locationFilter])

  // Show account type reminder if not set - BLOCK ACCESS
  if (isLoaded && user && !hasAccountType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <AccountTypeRequiredDropdown blocking={true} />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Account Type Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please select an account type above to access listings and other features.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vehicles": return Car
      case "homes": return Home
      case "equipment": return Wrench
      case "events": return Music
      case "fashion": return Shirt
      case "tech": return Laptop
      case "sports": return Dumbbell
      default: return Camera
    }
  }

  // Interaction handlers
  const handleLike = async (listingId: string) => {
    if (!listingId) return

    // Use a demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    // Check the current liked state BEFORE toggling
    const wasLiked = interactions[listingId]?.liked

    try {
      await toggleLike(listingId)
      toast({
        title: wasLiked ? "Unliked" : "Liked!",
        description: wasLiked ? "Removed from liked listings" : "Added to your liked listings"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      })
    }
  }

  const handleSave = async (listingId: string) => {
    if (!listingId || !user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save listings.",
        variant: "destructive",
      })
      return
    }

    // Check the current saved state BEFORE toggling
    const wasSaved = interactions[listingId]?.saved

    try {
      await toggleSave(listingId)
      const listing = listings.find(l => l.id === listingId)

      toast({
        title: wasSaved ? "Unsaved" : "Saved!",
        description: wasSaved ? "Removed from saved listings" : "Added to your saved listings"
      })

      // Create a persistent notification only when saving, not unsaving
      if (!wasSaved && listing) {
        addNotification({
          userId: user.id,
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title: 'Item Saved!',
          message: `You saved the listing: "${listing.title}".`,
          link: `/profile/favorites`,
          isRead: false
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive"
      })
    }
  }

  const handleShare = async (listingId: string, title: string) => {
    if (!listingId || !title) return

    // Use a demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    try {
      if (typeof window !== 'undefined' && navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out this rental: ${title}`,
          url: window.location.href
        })
        await trackShare(listingId, 'native_share')
      } else if (typeof window !== 'undefined') {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${title} - ${window.location.href}`)
        await trackShare(listingId, 'clipboard')
        toast({
          title: "Link copied!",
          description: "Listing link copied to clipboard"
        })
      }
    } catch (error) {
      console.error('Share error:', error)
      toast({
        title: "Error",
        description: "Failed to share listing",
        variant: "destructive"
      })
    }
  }

  const handleViewDetails = async (listingId: string) => {
    if (!listingId) return

    // Track view
    await trackView(listingId, { source: 'listing_card' })

    // Navigate to details page
    router.push(`/listings/details/${listingId}`)
  }


  const handleBookNow = async (listing: Listing) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make bookings.",
        variant: "destructive",
      })
      return
    }

    if (!listing.id) {
      toast({
        title: "Error",
        description: "Invalid listing data.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a booking with default dates (today + 1 day)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Calculate duration in days
      const duration = Math.ceil((tomorrow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      const bookingData = {
        user_id: user.id,
        owner_id: listing.owner?.id || 'unknown',
        listing_id: listing.id,
        start_date: today.toISOString(),
        end_date: tomorrow.toISOString(),
        total_price: listing.price * duration,
        status: 'pending' as const,
        payment_status: 'pending' as const,
        notes: `Booking for ${listing.title}. Location: ${listing.location}. Category: ${listing.category}.`
      }

      const renterName = user.fullName || user.firstName || 'User'
      const result = await bookingsDB.createBooking(bookingData, renterName, listing.title)

      if (!result.success) {
        throw new Error('Failed to create booking in database')
      }

      const bookingId = result.id

      // Send booking confirmation email
      fetch('/api/emails/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.emailAddresses[0]?.emailAddress,
          userName: user.firstName || 'there',
          booking: {
            id: bookingId || 'pending',
            itemName: listing.title,
            itemImage: listing.image,
            startDate: today.toISOString(),
            endDate: tomorrow.toISOString(),
            totalPrice: listing.price * duration,
            ownerName: listing.owner?.name || 'Owner',
            ownerEmail: 'owner@example.com'
          }
        })
      }).catch(err => console.error('Booking email error:', err))

      // Add a persistent notification for the booking
      addNotification({
        userId: user.id,
        type: NotificationType.BOOKING_REQUEST,
        title: 'Booking Request Sent!',
        message: `Your booking request for "${listing.title}" has been sent to the owner.`,
        link: `/profile/bookings`,
        isRead: false
      })

      console.log('Booking created successfully with ID:', bookingId)

      // Enhanced booking success notification
      const bookingToast = toast({
        title: "🎉 Booking Successful!",
        description: `"${listing.title}" booked for ${duration} day${duration > 1 ? 's' : ''}`,
        duration: 3000,
        action: (
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                bookingToast.dismiss()
                router.push('/profile/bookings')
              }}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              View Bookings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bookingToast.dismiss()}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Dismiss
            </Button>
          </div>
        ),
      })

      // Show browser notification
      try {
        await notificationService.showBookingSuccessNotification(listing.title, duration)
      } catch (error) {
        console.log('Browser notification not available:', error)
      }

      // Auto-dismiss toast and redirect after delay
      setTimeout(() => {
        bookingToast.dismiss()
        router.push('/profile/bookings')
      }, 4000)
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Error creating booking",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-purple-600/95 to-indigo-700/95"></div>
        <div className="absolute inset-0 bg-[url('/luxury-cars-in-modern-showroom.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-12 fade-in-up">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight px-4">
              Discover Amazing Rentals
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto opacity-90 leading-relaxed mb-6 sm:mb-8 px-4">
              Find the perfect rental for your needs. From luxury vehicles to premium equipment,
              beautiful homes to cutting-edge electronics.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base px-4">
              <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="hidden xs:inline">140+ Items Available</span>
                <span className="xs:hidden">140+ Items</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="hidden xs:inline">7 Categories</span>
                <span className="xs:hidden">7 Cats</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="hidden xs:inline">Instant Booking</span>
                <span className="xs:hidden">Instant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="mb-8 sm:mb-12 fade-in-up stagger-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                  placeholder="Search rentals, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-12 md:h-14 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 focus-enhanced rounded-lg sm:rounded-xl text-sm sm:text-base"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10 sm:h-12 md:h-14 btn-animate bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg sm:rounded-xl px-3 sm:px-6"
                >
                  <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline text-sm sm:text-base">Advanced Filters</span>
                  <span className="sm:hidden text-sm">Filters</span>
                  {(locationFilter || availabilityFilter !== "any" || ratingFilter !== "any" || priceRange.min > 0 || priceRange.max < 100000) && (
                    <span className="ml-1 sm:ml-2 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      {[locationFilter, availabilityFilter !== "any" ? "avail" : "", ratingFilter !== "any" ? "rating" : "", priceRange.min > 0 || priceRange.max < 100000 ? "price" : ""].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="h-10 sm:h-12 md:h-14 btn-animate bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg sm:rounded-xl px-3 sm:px-4"
                >
                  {viewMode === "grid" ? <List className="h-4 w-4 sm:h-5 sm:w-5" /> : <Grid className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 text-center px-4">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 fade-in-up stagger-2 px-2 sm:px-0">
              {categories.map((category, index) => {
                const IconComponent = getCategoryIcon(category.id)
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base btn-animate transition-all duration-300 rounded-lg sm:rounded-xl px-2 sm:px-4 md:px-6 ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 md:mr-3 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden text-xs">{category.name.split(' ')[0]}</span>
                    <Badge
                      variant="secondary"
                      className={`ml-1 sm:ml-2 md:ml-3 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 transition-colors duration-200 ${selectedCategory === category.id
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                        }`}
                    >
                      {category.count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8 fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocationFilter("")
                      setAvailabilityFilter("any")
                      setDateRange(undefined)
                      setRatingFilter("any")
                      setPriceRange({ min: 0, max: 100000 })
                      setSortBy("newest")
                    }}
                    className="text-sm px-3 py-1 h-8"
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Price Range (KSh)</label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <GoogleMapsAutocomplete
                    label="Location"
                    placeholder="Search for city or area..."
                    defaultValue={locationFilter}
                    onPlaceSelect={(place) => {
                      setLocationFilter(place.formatted_address)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Availability Dates</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Rating</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500/20"
                    aria-label="Filter by rating"
                  >
                    <option value="any">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500/20"
                    aria-label="Sort results"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 px-4 pr-8 border border-gray-300 rounded-xl bg-white text-sm dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                aria-label="Sort listings by"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Showing <span className="font-bold text-blue-600 dark:text-blue-400">{listings.length}</span> results
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Live Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className={`grid gap-3 sm:gap-4 md:gap-6 ${viewMode === "grid"
            ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
          }`}>
          {listings.map((listing, index) => {
            const IconComponent = getCategoryIcon(listing.category)
            return (
              <Card
                key={listing.id}
                className={`group cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${index < 8 ? 'fade-in-up' : ''
                  }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={listing.image || listing.images?.[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.onerror = null
                      t.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {listing.category}
                      </span>
                    </div>
                  </div>

                  {/* Like Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => listing.id && handleLike(listing.id)}
                    disabled={listing.id ? interactions[listing.id]?.loading : false}
                    className={`absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 ${listing.id && interactions[listing.id]?.liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${listing.id && interactions[listing.id]?.liked ? 'fill-current' : ''}`} />
                  </Button>

                  {/* Price */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        KSh {listing.price.toLocaleString()}/day
                      </span>
                    </div>
                  </div>

                  {/* Share Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => listing.id && listing.title && handleShare(listing.id, listing.title)}
                    className="absolute bottom-3 right-3 h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {listing.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(listing.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {listing.rating} ({listing.reviews})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src={listing.owner.avatar} alt={listing.owner.name} />
                        <AvatarFallback className="text-xs">{listing.owner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {listing.owner.name}
                      </span>
                      {listing.owner.verified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 hidden sm:inline-flex">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {listing.amenities.slice(0, 2).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                          {amenity}
                        </Badge>
                      ))}
                      {listing.amenities.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                          +{listing.amenities.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white btn-animate shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => listing.id && handleViewDetails(listing.id)}
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate directly to messages page with owner info
                          const messagesUrl = `/messages?owner=${encodeURIComponent(listing.owner?.name || 'Unknown')}&listing=${encodeURIComponent(listing.title)}&ownerId=${listing.owner?.id || 'unknown'}`
                          router.push(messagesUrl)
                        }}
                        className="btn-animate transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Message Owner</span>
                        <span className="sm:hidden">Message</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => listing.id && handleSave(listing.id)}
                        disabled={listing.id ? interactions[listing.id]?.loading : false}
                        className={`btn-animate transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 ${listing.id && interactions[listing.id]?.saved
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 transition-transform duration-200 ${listing.id && interactions[listing.id]?.saved ? 'fill-current text-green-600 dark:text-green-400' : ''}`} />
                        <span className="hidden sm:inline">{listing.id && interactions[listing.id]?.saved ? 'Saved' : 'Save'}</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBookNow(listing)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white btn-animate shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Book Now</span>
                        <span className="sm:hidden">Book</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No listings found</h3>
              <p className="text-sm">Try adjusting your search criteria or browse all categories.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




