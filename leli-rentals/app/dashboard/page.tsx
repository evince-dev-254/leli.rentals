"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { VerificationBanner } from "@/components/verification-banner"
import { getUserAccountType } from "@/lib/account-type-utils"
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Car,
  Home,
  Laptop,
  Camera,
  Plus,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Settings,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push("/sign-in")
      return
    }
  }, [user, isLoaded, router])

  // Show loading while checking authentication
  if (!isLoaded) {
    return <LoadingSpinner message="Loading your dashboard..." variant="default" />
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for dashboard
  const stats = {
    totalBookings: 12,
    activeRentals: 3,
    totalEarnings: 2450,
    rating: 4.8,
    totalListings: 5,
    pendingRequests: 8,
    monthlyEarnings: 1200,
    responseRate: 95
  }

  const recentBookings = [
    {
      id: 1,
      item: "Tesla Model 3",
      category: "Vehicles",
      date: "2024-01-15",
      status: "active",
      amount: 150,
      owner: "John Doe",
      image: "/tesla-model-3.jpg",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      location: "Nairobi, Kenya"
    },
    {
      id: 2,
      item: "MacBook Pro M3",
      category: "Electronics",
      date: "2024-01-14",
      status: "completed",
      amount: 75,
      owner: "Jane Smith",
      image: "/macbook-pro.jpg",
      startDate: "2024-01-10",
      endDate: "2024-01-12",
      location: "Mombasa, Kenya"
    },
    {
      id: 3,
      item: "Canon EOS R5",
      category: "Photography",
      date: "2024-01-13",
      status: "upcoming",
      amount: 120,
      owner: "Mike Johnson",
      image: "/canon-eos-r5.jpg",
      startDate: "2024-01-20",
      endDate: "2024-01-22",
      location: "Kisumu, Kenya"
    }
  ]

  const myListings = [
    {
      id: 1,
      title: "Luxury Apartment in Westlands",
      category: "Homes",
      status: "active",
      price: 5000,
      views: 245,
      bookings: 12,
      rating: 4.9,
      image: "/luxury-apartment.jpg",
      lastBooked: "2024-01-10"
    },
    {
      id: 2,
      title: "Professional Camera Equipment",
      category: "Photography",
      status: "active",
      price: 2000,
      views: 189,
      bookings: 8,
      rating: 4.7,
      image: "/camera-equipment.jpg",
      lastBooked: "2024-01-08"
    },
    {
      id: 3,
      title: "Gaming Laptop Setup",
      category: "Electronics",
      status: "pending",
      price: 1500,
      views: 67,
      bookings: 0,
      rating: 0,
      image: "/gaming-laptop.jpg",
      lastBooked: null
    }
  ]

  const recentMessages = [
    {
      id: 1,
      from: "Sarah Wilson",
      message: "Hi! I'm interested in your apartment. Is it available this weekend?",
      time: "2 hours ago",
      unread: true,
      avatar: "/avatar1.jpg"
    },
    {
      id: 2,
      from: "David Brown",
      message: "Thanks for the camera rental! Everything was perfect.",
      time: "1 day ago",
      unread: false,
      avatar: "/avatar2.jpg"
    },
    {
      id: 3,
      from: "Lisa Chen",
      message: "Can I extend the laptop rental for another week?",
      time: "2 days ago",
      unread: true,
      avatar: "/avatar3.jpg"
    }
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: "Prepare Tesla for pickup",
      type: "pickup",
      time: "Today, 2:00 PM",
      priority: "high"
    },
    {
      id: 2,
      title: "Review apartment booking request",
      type: "booking",
      time: "Tomorrow, 10:00 AM",
      priority: "medium"
    },
    {
      id: 3,
      title: "Update camera equipment photos",
      type: "maintenance",
      time: "This week",
      priority: "low"
    }
  ]

  const quickActions = [
    { title: "Browse Rentals", description: "Find items to rent", icon: Search, href: "/listings", color: "bg-blue-500" },
    { title: "List Your Item", description: "Earn money renting", icon: Plus, href: "/list-item", color: "bg-green-500" },
    { title: "My Bookings", description: "Manage rentals", icon: Calendar, href: "/bookings", color: "bg-purple-500" },
    { title: "Account Settings", description: "Update profile", icon: Settings, href: "/profile", color: "bg-orange-500" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "upcoming": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "vehicles": return Car
      case "electronics": return Laptop
      case "photography": return Camera
      case "homes": return Home
      default: return Car
    }
  }

  // Get user account type for verification
  const userAccountType = getUserAccountType()

  // Get verification status from user metadata (check publicMetadata first as that's where API writes)
  const verificationStatusFromMetadata = (user?.publicMetadata?.verificationStatus || user?.unsafeMetadata?.verificationStatus) as string | undefined
  const verificationStatus = {
    isVerified: verificationStatusFromMetadata === 'approved',
    documentsSubmitted: verificationStatusFromMetadata === 'pending' || verificationStatusFromMetadata === 'approved',
    pendingReview: verificationStatusFromMetadata === 'pending',
    rejectionReason: (user?.publicMetadata?.verificationRejectionReason || user?.unsafeMetadata?.verificationRejectionReason) as string | undefined,
    submittedAt: (user?.publicMetadata?.verificationSubmittedAt || user?.unsafeMetadata?.verificationSubmittedAt) as string | undefined
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Verification Banner for Owner Accounts */}
        <VerificationBanner
          accountType={userAccountType || 'renter'}
          verificationStatus={verificationStatus}
        />
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.imageUrl || ""} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                {user.fullName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.fullName?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600">Here's what's happening with your rentals</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  <p className="text-xs text-green-600">+2 this week</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRentals}</p>
                  <p className="text-xs text-blue-600">3 ongoing</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
                  <p className="text-xs text-green-600">+${stats.monthlyEarnings} this month</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
                  <p className="text-xs text-yellow-600">Based on 24 reviews</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">My Bookings</TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">My Listings</TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest rental activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => {
                    const CategoryIcon = getCategoryIcon(booking.category)
                    return (
                      <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{booking.item}</h4>
                          <p className="text-sm text-gray-600">{booking.category} • {booking.owner}</p>
                          <p className="text-sm text-gray-500">{booking.date}</p>
                        </div>
                        <div className="text-right sm:ml-auto flex-shrink-0">
                          <p className="font-semibold text-gray-900">${booking.amount}/day</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/bookings">View All Bookings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Manage your rental bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => {
                    const CategoryIcon = getCategoryIcon(booking.category)
                    return (
                      <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{booking.item}</h4>
                          <p className="text-sm text-gray-600">{booking.category} • {booking.owner}</p>
                          <p className="text-sm text-gray-500 mt-1">{booking.date}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-semibold text-gray-900">${booking.amount}/day</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <Heart className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Listings</CardTitle>
                    <CardDescription>Manage your rental listings and track performance</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/list-item">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Listing
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                            <p className="text-sm text-gray-600">{listing.category}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={listing.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {listing.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span>KES {listing.price}/day</span>
                          <span>•</span>
                          <span>{listing.views} views</span>
                          <span>•</span>
                          <span>{listing.bookings} bookings</span>
                          {listing.rating > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{listing.rating}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {listing.lastBooked && (
                          <p className="text-xs text-gray-500 mt-1">Last booked: {listing.lastBooked}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Listings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.imageUrl || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                        {user.fullName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.fullName || "User"}</h3>
                      <p className="text-sm text-gray-600">{user.emailAddresses[0]?.emailAddress}</p>
                      <Badge variant="secondary" className="mt-1">Verified</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy & Security
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Methods
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support & Help</CardTitle>
                  <CardDescription>Get help when you need it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
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
