"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { 
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
  Calendar,
  ArrowLeft,
  CheckCircle,
  Users,
  Clock,
  Shield,
  Award,
  MessageCircle,
  Phone,
  Mail,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Download
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Listing } from "@/lib/listings-service"
import { mockListings } from "@/lib/mock-listings-data"
import { useUser } from "@clerk/nextjs"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { useToast } from "@/hooks/use-toast"
import { bookingsDB } from "@/lib/interactions-database-service"
import { paystackService } from "@/lib/paystack-service"
import { paymentService } from "@/lib/payment-service"
import { notificationService } from "@/lib/notification-service"
import { supabase } from "@/lib/supabase"

export default function ListingDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const { interactions, toggleLike, toggleSave, trackView, trackShare } = useInteractions()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [listingStatus, setListingStatus] = useState<'draft' | 'published' | 'pending' | 'archived' | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    phoneNumber: "",
    mpesaCode: "",
    bankAccount: "",
    walletAddress: ""
  })

  useEffect(() => {
    setMounted(true)
    if (!id) {
      setLoading(false)
      return
    }
    
    const fetchListing = async () => {
      try {
        // First, try to fetch published listing (for public access)
        let { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single()

        // If not found and user is logged in, try to fetch regardless of status
        // (allows owners to view their own drafts/pending listings)
        if ((error || !data) && user?.id) {
          const { data: userListing, error: userError } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single()
          
          // If found and user is the owner, allow viewing
          if (userListing && userListing.user_id === user.id) {
            data = userListing
            error = null
          }
        }

        if (error || !data) {
          // Fallback to mock data if not found in database
          const foundListing = mockListings.find(l => l.id === id)
          if (foundListing) {
            setListing(foundListing)
            // Track view
            trackView(id, { source: 'listing_details' })
            
            // Find related listings (same category, different items)
            const related = mockListings
              .filter(l => l.category === foundListing.category && l.id !== foundListing.id)
              .slice(0, 4)
            setRelatedListings(related)
          } else {
            toast({
              title: "Listing not found",
              description: "The listing you're looking for doesn't exist or has been removed.",
              variant: "destructive",
            })
          }
          setLoading(false)
          return
        }

        // Transform Supabase data to Listing format
        // Handle images: use database images if available, only fallback to placeholder if truly missing
        const dbImages = Array.isArray(data.images) && data.images.length > 0 
          ? data.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
          : null
        
        console.log('Listing images from database:', {
          listingId: data.id,
          title: data.title,
          rawImages: data.images,
          filteredImages: dbImages,
          imageCount: dbImages?.length || 0
        })
        
        const transformedListing: Listing = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          fullDescription: data.description || '',
          price: data.price || 0,
          location: data.location || '',
          rating: 4.5, // Default rating
          reviews: Math.floor(Math.random() * 200) + 10,
          image: dbImages?.[0] || '/placeholder.svg',
          images: dbImages && dbImages.length > 0 ? dbImages : ['/placeholder.svg'],
          amenities: data.features || [],
          available: data.availability?.available !== false,
          category: data.category || 'other',
          owner: {
            id: data.user_id,
            name: data.contact_info?.name || 'Owner',
            avatar: '/placeholder.svg',
            rating: 4.8,
            verified: true,
            phone: data.contact_info?.phone || ''
          },
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at || data.created_at)
        }

        setListing(transformedListing)
        setListingStatus(data.status || 'published')
        setIsOwner(user?.id === data.user_id)
        
        // Track view
        trackView(id, { source: 'listing_details' })
        
        // Find related listings (same category, different items)
        const { data: relatedData } = await supabase
          .from('listings')
          .select('*')
          .eq('category', data.category)
          .eq('status', 'published')
          .neq('id', id)
          .limit(4)

        if (relatedData && relatedData.length > 0) {
          const related: Listing[] = relatedData.map((item: any) => {
            // Handle images: use database images if available
            const dbImages = Array.isArray(item.images) && item.images.length > 0
              ? item.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
              : null
            
            return {
              id: item.id,
              title: item.title,
              description: item.description || '',
              fullDescription: item.description || '',
              price: item.price || 0,
              location: item.location || '',
              rating: 4.5,
              reviews: Math.floor(Math.random() * 200) + 10,
              image: dbImages?.[0] || '/placeholder.svg',
              images: dbImages || ['/placeholder.svg'],
              amenities: item.features || [],
              available: item.availability?.available !== false,
              category: item.category || 'other',
              owner: {
                id: item.user_id,
                name: item.contact_info?.name || 'Owner',
                avatar: '/placeholder.svg',
                rating: 4.8,
                verified: true,
                phone: item.contact_info?.phone || ''
              },
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.updated_at || item.created_at)
            }
          })
          setRelatedListings(related)
        } else {
          // Fallback to mock related listings
          const related = mockListings
            .filter(l => l.category === transformedListing.category && l.id !== transformedListing.id)
            .slice(0, 4)
          setRelatedListings(related)
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
        toast({
          title: "Error loading listing",
          description: "Failed to load listing details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id, trackView, toast])

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

  const handleLike = async () => {
    if (!listing?.id) return
    
    // Check the current liked state BEFORE toggling
    const wasLiked = interactions[listing.id]?.liked
    
    try {
      await toggleLike(listing.id)
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

  const handleSave = async () => {
    if (!listing?.id) return
    
    // Check the current saved state BEFORE toggling
    const wasSaved = interactions[listing.id]?.saved
    
    try {
      await toggleSave(listing.id)
      toast({
        title: wasSaved ? "Unsaved" : "Saved!",
        description: wasSaved ? "Removed from saved listings" : "Added to your saved listings"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive"
      })
    }
  }

  const handleShare = async () => {
    if (!listing?.id || !listing?.title) return

    try {
      if (typeof window !== 'undefined' && navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `Check out this rental: ${listing.title}`,
          url: window.location.href
        })
        await trackShare(listing.id, 'native_share')
      } else if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(`${listing.title} - ${window.location.href}`)
        await trackShare(listing.id, 'clipboard')
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

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make bookings.",
        variant: "destructive",
      })
      return
    }

    if (!listing) return

    setShowBookingModal(true)
  }

  const handleContactOwner = async (ownerName: string) => {
    try {
      // Get ownerId from listing - check if listing has user_id or ownerId
      let ownerId = listing?.owner?.id || (listing as any)?.user_id || (listing as any)?.owner_id
      
      // If ownerId not in listing, try to fetch from Supabase
      if (!ownerId && listing?.id) {
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data, error } = await supabase
            .from('listings')
            .select('user_id')
            .eq('id', listing.id)
            .single()
          
          if (!error && data) {
            ownerId = data.user_id
          }
        } catch (error) {
          console.error('Error fetching ownerId:', error)
        }
      }

      // Navigate to messages page with owner pre-filled
      const params = new URLSearchParams({
        owner: ownerName,
        listing: listing?.title || '',
        listingImage: listing?.images?.[0] || ''
      })
      
      if (ownerId) {
        params.set('ownerId', ownerId)
      }
      
      const messagesUrl = `/messages?${params.toString()}`
      console.log('Navigating to messages:', messagesUrl)

      // Use window.location for more reliable navigation
      if (typeof window !== 'undefined') {
        window.location.href = messagesUrl
      } else {
        router.push(messagesUrl)
      }

      toast({
        title: "Opening Messages",
        description: `Redirecting to chat with ${ownerName}...`,
        duration: 2000,
      })
    } catch (error) {
      console.error('Error opening messages:', error)
      toast({
        title: "Error opening chat",
        description: "Please try again or navigate to Messages manually.",
        variant: "destructive",
      })
    }
  }

  const handleCallOwner = (phoneNumber: string) => {
    try {
      // Open phone dialer
      if (typeof window !== 'undefined') {
        window.location.href = `tel:${phoneNumber.replace(/\D/g, '')}`
      }
      
      toast({
        title: "Opening phone dialer",
        description: `Calling ${phoneNumber}...`,
      })
    } catch (error) {
      toast({
        title: "Error opening phone",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      })
      return
    }

    if (!listing || !user) return

    // Handle Paystack payment separately
    if (selectedPaymentMethod === "paystack") {
      if (!paymentDetails.walletAddress) {
        toast({
          title: "Email required",
          description: "Please enter your email address for Paystack payment.",
          variant: "destructive",
        })
        return
      }

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const duration = Math.ceil((tomorrow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const subtotal = listing.price * duration
      const bookingFee = Math.round(subtotal * 0.1) // 10% booking fee
      const totalAmount = subtotal + bookingFee

      // Initialize Paystack payment with mobile money support
      paystackService.initializePayment({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: paymentDetails.walletAddress,
        amount: paystackService.convertToKobo(totalAmount, 'KES'),
        currency: 'KES',
        reference: paystackService.generateReference(),
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'mpesa', 'airtel', 'pesapal'], // Enable mobile money
        metadata: {
          listingId: id,
          listingTitle: listing.title,
          userId: user.id,
          duration: duration
        },
        callback: async (response) => {
          if (response.status === 'success') {
            try {
              const bookingData = {
                user_id: user.id,
                listing_id: id,
                owner_id: listing.owner?.id || 'unknown',
                start_date: today.toISOString(),
                end_date: tomorrow.toISOString(),
                total_price: totalAmount, // Includes booking fee
                status: 'confirmed' as const,
                payment_status: 'paid' as const,
                payment_id: response.reference,
                notes: `Booked via Paystack. Transaction: ${response.transaction}. Subtotal: KSh ${subtotal}, Booking Fee: KSh ${bookingFee}, Total: KSh ${totalAmount}`
              }

              const renterName = user.fullName || user.firstName || 'User'
              const result = await bookingsDB.createBooking(bookingData, renterName, listing.title)
              
              if (!result.success) {
                throw new Error('Failed to create booking in database')
              }
              
              toast({
                title: "🎉 Payment Successful!",
                description: `Successfully booked "${listing.title}" for ${duration} day${duration > 1 ? 's' : ''} via Paystack. Check your bookings page for details.`,
                duration: 5000,
              })
              
              // Close modal and reset form
              setShowBookingModal(false)
              setSelectedPaymentMethod("")
              setPaymentDetails({
                cardNumber: "",
                expiryDate: "",
                cvv: "",
                cardName: "",
                phoneNumber: "",
                mpesaCode: "",
                bankAccount: "",
                walletAddress: ""
              })
              
              // Redirect to bookings page
              setTimeout(() => {
                router.push('/profile/bookings')
              }, 2000)
            } catch (error) {
              console.error('Error creating booking after payment:', error)
              toast({
                title: "❌ Booking Failed",
                description: "Payment was successful but booking creation failed. Please contact support.",
                variant: "destructive",
                duration: 5000,
              })
            }
          } else {
            toast({
              title: "❌ Payment Failed",
              description: response.message || "Payment was not successful. Please try again.",
              variant: "destructive",
              duration: 5000,
            })
          }
        },
        onClose: () => {
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again anytime.",
            duration: 3000,
          })
        }
      })
      return
    }


    // Handle other payment methods
    setBookingLoading(true)
    
    try {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const duration = Math.ceil((tomorrow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const subtotal = listing.price * duration
      const bookingFee = Math.round(subtotal * 0.1) // 10% booking fee
      const totalPrice = subtotal + bookingFee

      const bookingData = {
        user_id: user.id,
        listing_id: id,
        owner_id: listing.owner?.id || 'unknown',
        start_date: today.toISOString(),
        end_date: tomorrow.toISOString(),
        total_price: totalPrice, // Include booking fee in total
        status: 'confirmed' as const,
        payment_status: 'paid' as const,
        notes: `Booked via ${selectedPaymentMethod}. Subtotal: KSh ${subtotal}, Booking Fee: KSh ${bookingFee}, Total: KSh ${totalPrice}`
      }

      const renterName = user.fullName || user.firstName || 'User'
      const result = await bookingsDB.createBooking(bookingData, renterName, listing.title)
      
      if (!result.success) {
        throw new Error('Failed to create booking in database')
      }
      
      // Enhanced success notification
      toast({
        title: "🎉 Booking Confirmed!",
        description: `Successfully booked "${listing.title}" for ${duration} day${duration > 1 ? 's' : ''} via ${selectedPaymentMethod}. Check your bookings page for details.`,
        duration: 8000,
        action: (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/profile/bookings')}
            >
              View Bookings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
            >
              Stay Here
            </Button>
          </div>
        ),
      })

      // Show browser notification
      try {
        await notificationService.showBookingConfirmationNotification(listing.title, duration, selectedPaymentMethod)
      } catch (error) {
        console.log('Browser notification not available:', error)
      }
      
      // Close modal and reset form
      setShowBookingModal(false)
      setSelectedPaymentMethod("")
      setPaymentDetails({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
        phoneNumber: "",
        mpesaCode: "",
        bankAccount: "",
        walletAddress: ""
      })
      
      // Optional: Redirect to bookings page after a short delay
      setTimeout(() => {
        router.push('/profile/bookings')
      }, 2000)
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "❌ Booking Failed",
        description: "There was an error creating your booking. Please try again or contact support.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setBookingLoading(false)
    }
  }

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Listing Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/listings')} className="btn-animate">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const IconComponent = getCategoryIcon(listing.category)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <button 
            onClick={() => router.push('/listings')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Listings
          </button>
          <span>/</span>
          <button 
            onClick={() => router.push(`/listings/${listing.category}`)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors capitalize"
          >
            {listing.category}
          </button>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{listing.title}</span>
        </nav>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 btn-animate"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden card-animate">
              <div className="aspect-video relative group">
                <img
                  src={listing.images?.[currentImageIndex] || listing.image || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.onerror = null
                    t.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Category Badge and Status Badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {listing.category}
                    </span>
                  </div>
                  {isOwner && listingStatus && listingStatus !== 'published' && (
                    <Badge 
                      className={`${
                        listingStatus === 'draft' 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : listingStatus === 'pending'
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {listingStatus === 'draft' ? 'Draft' : listingStatus === 'pending' ? 'Pending' : 'Archived'}
                    </Badge>
                  )}
                </div>

                {/* Image Navigation */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleLike}
                    disabled={interactions[id]?.loading}
                    className={`h-10 w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 ${
                      interactions[id]?.liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${interactions[id]?.liked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleShare}
                    className="h-10 w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowImageModal(true)}
                    className="h-10 w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Price */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      KSh {listing.price.toLocaleString('en-KE')}/day
                    </span>
                  </div>
                </div>

                {/* Image Counter */}
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {currentImageIndex + 1} / {listing.images.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex gap-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-blue-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.onerror = null
                          t.src = "/placeholder.svg"
                        }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Product Details */}
            <Card className="card-animate">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {listing.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{listing.rating} ({listing.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 1000) + 100} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {listing.fullDescription || listing.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">What's Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {listing.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Meet Your Host</h2>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={listing.owner.avatar} alt={listing.owner.name} />
                        <AvatarFallback className="text-lg">{listing.owner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{listing.owner.name}</h3>
                          {listing.owner.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{listing.owner.rating} Host Rating</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleContactOwner(listing.owner.name)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleCallOwner(listing.owner.phone || '+254112081866')}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Reviews</h2>
                    <div className="space-y-4">
                      {/* Mock Reviews */}
                      {[
                        { name: "Sarah M.", rating: 5, comment: "Excellent service! The item was exactly as described and the owner was very helpful.", date: "2 days ago" },
                        { name: "John K.", rating: 4, comment: "Great experience overall. Would definitely rent again.", date: "1 week ago" },
                        { name: "Mary W.", rating: 5, comment: "Perfect condition and fast response from the owner. Highly recommended!", date: "2 weeks ago" }
                      ].map((review, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{review.name}</div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Listings */}
            {relatedListings.length > 0 && (
              <Card className="card-animate">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">More from this category</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {relatedListings.map((relatedListing) => (
                      <div
                        key={relatedListing.id}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/listings/details/${relatedListing.id}`)}
                      >
                        <div className="aspect-video relative overflow-hidden rounded-lg mb-2">
                          <img
                            src={relatedListing.image}
                            alt={relatedListing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded px-2 py-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              KSh {relatedListing.price.toLocaleString('en-KE')}/day
                            </span>
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {relatedListing.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{relatedListing.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 card-animate">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      KSh {listing.price.toLocaleString('en-KE')}/day
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{listing.rating} ({listing.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white btn-animate shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg"
                      onClick={handleBookNow}
                      disabled={bookingLoading}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      {bookingLoading ? "Booking..." : "Book Now"}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleSave}
                      disabled={interactions[id]?.loading}
                      className={`w-full btn-animate transition-all duration-200 text-base sm:text-lg ${
                        interactions[id]?.saved
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Heart className={`h-5 w-5 mr-2 transition-transform duration-200 ${interactions[id]?.saved ? 'fill-current text-green-600 dark:text-green-400' : ''}`} />
                      {interactions[id]?.saved ? 'Saved' : 'Save for Later'}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Free cancellation up to 24 hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>Verified owner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>Instant confirmation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-orange-500" />
                        <span>Secure payment</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Details
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-sm sm:col-span-2">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Listing
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={listing.images?.[currentImageIndex] || listing.image || "/placeholder.svg"}
              alt={listing.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.onerror = null
                t.src = "/placeholder.svg"
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 h-10 w-10 bg-white/90 hover:bg-white text-gray-900"
            >
              ×
            </Button>
            {listing.images && listing.images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white text-gray-900"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white text-gray-900"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Complete Your Booking
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={listing?.images?.[0] || listing?.image || "/placeholder.svg"} 
                    alt={listing?.title}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.onerror = null
                      t.src = "/placeholder.svg"
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{listing?.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{listing?.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{listing?.owner?.rating || 0}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">KSh {listing?.price}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">per day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Payment Method</h3>
              
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <div className="grid grid-cols-1 gap-4">
                  
                  {/* Paystack */}
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <Label htmlFor="paystack" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium">Paystack (Recommended)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cards, Mobile Money (M-Pesa, Airtel), Bank Transfer</p>
                      </div>
                    </Label>
                  </div>

                  {/* Pay on Delivery */}
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">Pay on Delivery</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay in cash when you pick up or receive the item</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Booking Fee Summary */}
            {listing && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">1 day rental:</span>
                      <span className="font-medium">KSh {listing.price.toLocaleString('en-KE')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Booking Fee (10%):</span>
                      <span className="font-medium">KSh {Math.round(listing.price * 0.1).toLocaleString('en-KE')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">KSh {(listing.price + Math.round(listing.price * 0.1)).toLocaleString('en-KE')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Details Forms */}
            {selectedPaymentMethod === "paystack" && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium">Paystack Payment</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paystackEmail">Email Address</Label>
                    <Input
                      id="paystackEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={paymentDetails.walletAddress}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, walletAddress: e.target.value }))}
                    />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Paystack Features:</strong><br />
                      • Secure payment processing<br />
                      • Multiple payment methods (Cards, M-Pesa, Bank Transfer)<br />
                      • Real-time payment verification<br />
                      • Mobile-optimized interface<br />
                      • Fraud protection included
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedPaymentMethod === "cash" && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium">Cash Payment</h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Payment Instructions:</strong><br />
                    • Pay in cash when you pick up the item<br />
                    • Have exact change ready<br />
                    • Bring a valid ID for verification<br />
                    • Payment must be made before taking the item
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
                className="flex-1 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={bookingLoading || !selectedPaymentMethod}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 order-1 sm:order-2"
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
