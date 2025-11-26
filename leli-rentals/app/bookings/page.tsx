"use client"

import React, { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  MessageCircle, 
  Phone, 
  Car, 
  Home, 
  Laptop, 
  Camera,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Heart
} from "lucide-react"

export default function BookingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect if not authenticated
  if (!!isLoaded && !user) {
    router.push("/login")
    return null
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  // Mock booking data
  const bookings = {
    upcoming: [
      {
        id: 1,
        item: "Tesla Model 3",
        category: "Vehicles",
        owner: "John Doe",
        ownerAvatar: "/avatar1.jpg",
        startDate: "2024-01-20",
        endDate: "2024-01-22",
        totalDays: 3,
        pricePerDay: 150,
        totalAmount: 450,
        status: "confirmed",
        image: "/tesla-model-3.jpg",
        location: "Nairobi, Kenya",
        rating: 4.8
      },
      {
        id: 2,
        item: "MacBook Pro M3",
        category: "Electronics",
        owner: "Jane Smith",
        ownerAvatar: "/avatar2.jpg",
        startDate: "2024-01-25",
        endDate: "2024-01-27",
        totalDays: 3,
        pricePerDay: 75,
        totalAmount: 225,
        status: "pending",
        image: "/macbook-pro.jpg",
        location: "Mombasa, Kenya",
        rating: 4.9
      }
    ],
    active: [
      {
        id: 3,
        item: "Canon EOS R5",
        category: "Photography",
        owner: "Mike Johnson",
        ownerAvatar: "/avatar3.jpg",
        startDate: "2024-01-15",
        endDate: "2024-01-18",
        totalDays: 4,
        pricePerDay: 120,
        totalAmount: 480,
        status: "active",
        image: "/canon-eos-r5.jpg",
        location: "Kisumu, Kenya",
        rating: 4.7
      }
    ],
    completed: [
      {
        id: 4,
        item: "Luxury Apartment",
        category: "Homes",
        owner: "Sarah Wilson",
        ownerAvatar: "/avatar4.jpg",
        startDate: "2024-01-10",
        endDate: "2024-01-12",
        totalDays: 3,
        pricePerDay: 200,
        totalAmount: 600,
        status: "completed",
        image: "/luxury-apartment.jpg",
        location: "Nairobi, Kenya",
        rating: 4.9
      },
      {
        id: 5,
        item: "Gaming Laptop",
        category: "Electronics",
        owner: "David Brown",
        ownerAvatar: "/avatar5.jpg",
        startDate: "2024-01-05",
        endDate: "2024-01-08",
        totalDays: 4,
        pricePerDay: 60,
        totalAmount: 240,
        status: "completed",
        image: "/gaming-laptop.jpg",
        location: "Eldoret, Kenya",
        rating: 4.6
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "active": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
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

  const filteredBookings = (bookingsList: any[]) => {
    if (!searchQuery) return bookingsList
    return bookingsList.filter(booking => 
      booking.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.owner.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const totalBookings = Object.values(bookings).flat().length
  const totalSpent = Object.values(bookings).flat().reduce((sum, booking) => sum + booking.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your rental bookings and reservations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${totalSpent}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.active.length}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming ({bookings.upcoming.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({bookings.active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({bookings.completed.length})</TabsTrigger>
            <TabsTrigger value="all">All ({totalBookings})</TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming" className="space-y-4">
            {filteredBookings(bookings.upcoming).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">You don't have any upcoming rentals scheduled.</p>
                  <Button>Browse Rentals</Button>
                </CardContent>
              </Card>
            ) : (
              filteredBookings(bookings.upcoming).map((booking) => {
                const CategoryIcon = getCategoryIcon(booking.category)
                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="h-8 w-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{booking.item}</h3>
                                <p className="text-sm text-gray-600">{booking.category}</p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {booking.startDate} - {booking.endDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {booking.rating}
                              </div>
                              <span className="text-gray-600">•</span>
                              <span className="font-semibold text-gray-900">${booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.ownerAvatar} />
                              <AvatarFallback>{booking.owner.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{booking.owner}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Active Bookings */}
          <TabsContent value="active" className="space-y-4">
            {filteredBookings(bookings.active).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active rentals</h3>
                  <p className="text-gray-600 mb-4">You don't have any active rentals at the moment.</p>
                  <Button>Browse Rentals</Button>
                </CardContent>
              </Card>
            ) : (
              filteredBookings(bookings.active).map((booking) => {
                const CategoryIcon = getCategoryIcon(booking.category)
                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="h-8 w-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{booking.item}</h3>
                                <p className="text-sm text-gray-600">{booking.category}</p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {booking.startDate} - {booking.endDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {booking.rating}
                              </div>
                              <span className="text-gray-600">•</span>
                              <span className="font-semibold text-gray-900">${booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.ownerAvatar} />
                              <AvatarFallback>{booking.owner.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{booking.owner}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Completed Bookings */}
          <TabsContent value="completed" className="space-y-4">
            {filteredBookings(bookings.completed).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed bookings</h3>
                  <p className="text-gray-600 mb-4">Your completed rentals will appear here.</p>
                  <Button>Browse Rentals</Button>
                </CardContent>
              </Card>
            ) : (
              filteredBookings(bookings.completed).map((booking) => {
                const CategoryIcon = getCategoryIcon(booking.category)
                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="h-8 w-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{booking.item}</h3>
                                <p className="text-sm text-gray-600">{booking.category}</p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {booking.startDate} - {booking.endDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {booking.rating}
                              </div>
                              <span className="text-gray-600">•</span>
                              <span className="font-semibold text-gray-900">${booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.ownerAvatar} />
                              <AvatarFallback>{booking.owner.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{booking.owner}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Star className="h-4 w-4 mr-1" />
                              Rate
                            </Button>
                            <Button size="sm" variant="outline">
                              <Heart className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* All Bookings */}
          <TabsContent value="all" className="space-y-4">
            {filteredBookings(Object.values(bookings).flat()).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-4">Start exploring our rental marketplace!</p>
                  <Button>Browse Rentals</Button>
                </CardContent>
              </Card>
            ) : (
              filteredBookings(Object.values(bookings).flat()).map((booking) => {
                const CategoryIcon = getCategoryIcon(booking.category)
                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="h-8 w-8 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{booking.item}</h3>
                                <p className="text-sm text-gray-600">{booking.category}</p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {booking.startDate} - {booking.endDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {booking.rating}
                              </div>
                              <span className="text-gray-600">•</span>
                              <span className="font-semibold text-gray-900">${booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.ownerAvatar} />
                              <AvatarFallback>{booking.owner.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{booking.owner}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



