"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useUser } from '@clerk/nextjs'
import { ownerDashboardClientService, OwnerStats, OwnerListing, OwnerBooking, OwnerActivity } from "@/lib/owner-dashboard-client-service"
import { getUserAccountType } from "@/lib/account-type-utils"
import { listingsServiceSupabase, ListingData } from "@/lib/listings-service-supabase"
import { VerificationBanner } from "@/components/verification-banner"
import { TrialBanner } from "@/components/trial-banner"
import { VerificationNotification } from "@/components/verification-notification"
import {
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  MessageCircle,
  Star,
  Eye,
  Heart,
  Share2,
  Settings,
  BarChart3,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  Play
} from "lucide-react"

export default function OwnerDashboard() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [listingsTab, setListingsTab] = useState("published")
  const [listings, setListings] = useState<OwnerListing[]>([])
  const [draftListings, setDraftListings] = useState<ListingData[]>([])
  const [draftCount, setDraftCount] = useState(0)
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [activities, setActivities] = useState<OwnerActivity[]>([])
  const [stats, setStats] = useState<OwnerStats>({
    totalEarnings: 0,
    totalBookings: 0,
    activeListings: 0,
    rating: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Check account type and redirect if not owner
  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    // ONLY check Clerk metadata - ignore localStorage to avoid stale values
    const clerkAccountType = (user.publicMetadata?.accountType as string) ||
      (user.unsafeMetadata?.accountType as string)

    // Only owners should access this page
    if (clerkAccountType !== 'owner') {
      // If no account type or not owner, redirect to get-started
      toast({
        title: "Access Denied",
        description: "This page is for owner accounts only. Please select an owner account type.",
        variant: "destructive",
      })
      router.push('/get-started')
      return
    }

    // Check verification status - new owners must verify first
    const verificationStatus = user.unsafeMetadata?.verificationStatus as string

    // Only redirect if they haven't submitted verification at all (not pending, not approved, not rejected)
    // Allow access if status is 'pending', 'approved', or 'rejected' - they'll see appropriate notifications
    if (!verificationStatus) {
      toast({
        title: "Verification Required",
        description: "Please complete identity verification to access your dashboard.",
        variant: "default",
      })
      router.push('/verification')
      return
    }
  }, [user, isLoaded, router, toast])

  // Load owner dashboard data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return

      // Double check account type before loading - ONLY trust Clerk metadata
      const clerkAccountType = (user.publicMetadata?.accountType as string) ||
        (user.unsafeMetadata?.accountType as string)

      if (clerkAccountType !== 'owner') {
        return
      }

      setIsLoading(true)
      try {
        // Load all dashboard data in parallel
        const [statsData, listingsData, bookingsData, activitiesData, drafts, count] = await Promise.all([
          ownerDashboardClientService.getOwnerStats(user.id),
          ownerDashboardClientService.getOwnerListings(user.id),
          ownerDashboardClientService.getOwnerBookings(user.id),
          ownerDashboardClientService.getOwnerActivity(user.id, 10),
          listingsServiceSupabase.getUserListings(user.id, 'draft'),
          listingsServiceSupabase.getDraftCount(user.id)
        ])

        setStats(statsData)
        setListings(listingsData)
        setBookings(bookingsData)
        setActivities(activitiesData)
        setDraftListings(drafts)
        setDraftCount(count)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast({
          title: "Error loading dashboard",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id, toast])

  const handleCreateListing = () => {
    const userAccountType = getUserAccountType()
    if (userAccountType !== 'owner') {
      toast({
        title: "Owner Access Required",
        description: "Only users with owner accounts can create listings. Please change your account type to continue.",
        variant: "destructive",
      })
      router.push('/get-started')
      return
    }
    router.push('/list-item')
  }

  const handleResumeDraft = (draftId: string) => {
    router.push(`/list-item?draft=${draftId}`)
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (!user?.id) return

    try {
      await listingsServiceSupabase.deleteListing(draftId, user.id)
      setDraftListings(prev => prev.filter(draft => draft.id !== draftId))
      setDraftCount(prev => prev - 1)
      toast({
        title: "Draft deleted",
        description: "The draft has been removed"
      })
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive"
      })
    }
  }

  const handleViewListing = (listingId: string) => {
    router.push(`/listings/details/${listingId}`)
  }

  const handleEditListing = (listingId: string) => {
    router.push(`/listings/edit/${listingId}`)
  }

  const handleViewBooking = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE')}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Show loading state
  if (isLoading || !isLoaded) {
    return (
      <>
        <Header />
        <LoadingSpinner message="Fetching your stats..." variant="owner" />
      </>
    )
  }

  // Redirect check - if user is not owner, this will be handled by the useEffect above
  // ONLY check Clerk metadata, ignore localStorage
  const clerkAccountType = (user?.publicMetadata?.accountType as string) ||
    (user?.unsafeMetadata?.accountType as string)

  if (!user || clerkAccountType !== 'owner') {
    return null // useEffect will handle redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8">
        {/* Verification Notification - Shows pending/denied status */}
        <VerificationNotification />

        {/* Verification Banner with Deadline Warning */}
        <VerificationBanner
          accountType="owner"
          verificationStatus={{
            isVerified: (user?.unsafeMetadata?.verificationStatus as string) === 'approved' ||
              (user?.publicMetadata?.verificationStatus as string) === 'approved' ||
              (user?.unsafeMetadata?.isVerified as boolean) ||
              (user?.publicMetadata?.isVerified as boolean) ||
              false,
            documentsSubmitted: (user?.unsafeMetadata?.verificationStatus as string) === 'submitted' ||
              (user?.publicMetadata?.verificationStatus as string) === 'submitted',
            pendingReview: (user?.unsafeMetadata?.verificationStatus as string) === 'pending' ||
              (user?.publicMetadata?.verificationStatus as string) === 'pending',
            rejectionReason: (user?.unsafeMetadata?.verificationRejectionReason as string) ||
              (user?.publicMetadata?.verificationRejectionReason as string),
            submittedAt: (user?.unsafeMetadata?.verificationSubmittedAt as string) ||
              (user?.publicMetadata?.verificationSubmittedAt as string)
          }}
          verificationDeadline={(user?.unsafeMetadata?.verificationDeadline as string) ||
            (user?.publicMetadata?.verificationDeadline as string)}
        />

        {/* Trial Banner */}
        <TrialBanner className="mb-6 rounded-lg shadow-sm" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Owner Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your listings, bookings, and earnings
            </p>
          </div>
          <Button
            onClick={handleCreateListing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white btn-animate"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-animate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalBookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.activeListings}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.rating}★
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {!isLoaded ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No bookings yet</p>
                          <p className="text-sm">Create listings to start receiving bookings</p>
                        </div>
                      ) : (
                        bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <img
                              src={booking.customerAvatar || "/placeholder-user.jpg"}
                              alt={booking.customerName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {booking.customerName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.listingTitle}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(booking.totalPrice)}
                              </p>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {bookings.length > 0 && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setActiveTab("bookings")}
                      >
                        View All Bookings
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No recent activity</p>
                          <p className="text-sm">Activity will appear here as you use the platform</p>
                        </div>
                      ) : (
                        activities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Listings
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Nested Tabs for Published and Drafts */}
            <Tabs value={listingsTab} onValueChange={setListingsTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="published" className="gap-2">
                  Published ({listings.length})
                </TabsTrigger>
                <TabsTrigger value="drafts" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Drafts ({draftCount})
                </TabsTrigger>
              </TabsList>

              {/* Published Listings */}
              <TabsContent value="published" className="space-y-6">
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No published listings yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create and publish your first listing to start earning money
                    </p>
                    <Button onClick={handleCreateListing} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <Card key={listing.id} className="card-animate">
                        <div className="aspect-video relative">
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                          <Badge className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}>
                            {listing.status}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{listing.bookings} bookings</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{listing.views} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{listing.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(listing.price)}/day
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewListing(listing.id)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditListing(listing.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Draft Listings */}
              <TabsContent value="drafts" className="space-y-6">
                {draftListings.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No draft listings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Draft listings will be saved here automatically as you create them
                    </p>
                    <Button onClick={handleCreateListing} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftListings.map((draft) => (
                      <Card key={draft.id} className="card-animate border-yellow-200 bg-yellow-50/50">
                        <div className="aspect-video relative bg-gray-200">
                          {draft.images && draft.images.length > 0 ? (
                            <img
                              src={draft.images[0]}
                              alt={draft.title}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                            <FileText className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {draft.title || 'Untitled Draft'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {draft.description || 'No description yet'}
                          </p>
                          {draft.price && (
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                              ${draft.price.toFixed(2)} {draft.priceType && `/ ${draft.priceType.replace('_', ' ')}`}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mb-3">
                            Last updated: {draft.updated_at ? new Date(draft.updated_at).toLocaleDateString() : 'Unknown'}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleResumeDraft(draft.id!)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Resume Editing
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteDraft(draft.id!)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Bookings ({bookings.length})
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Bookings will appear here when customers rent your items
                </p>
                <Button onClick={handleCreateListing} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="card-animate">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.customerAvatar}
                          alt={booking.customerName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {booking.customerName}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">
                            {booking.listingTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                          <Badge className={getStatusColor(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBooking(booking.id)}
                          >
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Messages from Renters
                </h2>
                <p className="text-muted-foreground mt-1">
                  Communicate with renters interested in your listings
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard/owner/messages')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                View All Messages
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Manage Your Conversations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    View and respond to messages from renters who are interested in your listings.
                  </p>
                  <Button onClick={() => router.push('/dashboard/owner/messages')}>
                    Open Messages
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Analytics & Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Analytics coming soon! Track your earnings, bookings, and performance metrics.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Detailed performance insights will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}




