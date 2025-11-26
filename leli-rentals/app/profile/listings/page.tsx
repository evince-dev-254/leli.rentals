"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Plus, Edit, Trash2, Eye, Calendar, DollarSign, Star, MapPin,
  Camera, Upload, Search, Filter, MoreHorizontal, TrendingUp,
  Users, Clock, CheckCircle, XCircle, AlertCircle, X, Loader2
} from "lucide-react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { listingsService, Listing } from "@/lib/listings-service"
import { getUserAccountType } from "@/lib/account-type-utils"

const categories = [
  { value: "vehicles", label: "Vehicles" },
  { value: "homes", label: "Homes & Apartments" },
  { value: "equipment", label: "Equipment" },
  { value: "sports", label: "Sports & Recreation" },
  { value: "tech", label: "Electronics" },
  { value: "fashion", label: "Fashion & Accessories" },
]

export default function ListingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("all")
  const [isCreatingListing, setIsCreatingListing] = useState(false)
  const [isEditingListing, setIsEditingListing] = useState(false)
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
    images: [] as string[],
  })
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !user) return

    const validFiles: File[] = []
    const previewUrls: string[] = []

    // Validate files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        })
        continue
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        })
        continue
      }

      validFiles.push(file)

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      previewUrls.push(previewUrl)
    }

    if (validFiles.length === 0) return

    setUploadedImages(prev => [...prev, ...validFiles])
    setImagePreviewUrls(prev => [...prev, ...previewUrls])

    // Upload images to Firebase Storage
    setIsUploadingImages(true)
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop() || 'jpg'
        const fileName = `listing-${user.id}-${timestamp}-${index}.${fileExtension}`

        // Firebase removed - simulating image upload
        await new Promise(resolve => setTimeout(resolve, 200))
        return `https://placeholder.com/images/${fileName}`
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setNewListing(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      toast({
        title: "Images uploaded successfully!",
        description: `${validFiles.length} image(s) uploaded`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setNewListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Load user listings
  useEffect(() => {
    const loadUserListings = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const userListings = await listingsService.getUserListings(user.id)
        setListings(userListings)
      } catch (error) {
        console.error("Error loading user listings:", error)
        toast({
          title: "Error",
          description: "Failed to load your listings",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadUserListings()
  }, [user, toast])

  // Helper functions to convert between available boolean and status string
  const getListingStatus = (listing: Listing) => listing.available ? "active" : "inactive"
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? listing.available : !listing.available)
    return matchesSearch && matchesStatus
  })

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      })
      return
    }

    // Check if user is an owner
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

    if (!newListing.title || !newListing.description || !newListing.price || !newListing.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const listingData = {
        title: newListing.title,
        description: newListing.description,
        fullDescription: newListing.description,
        price: parseFloat(newListing.price),
        category: newListing.category,
        location: newListing.location || "Not specified",
        rating: 0,
        reviews: 0,
        image: newListing.images[0] || "/placeholder.svg",
        images: newListing.images.length > 0 ? newListing.images : ["/placeholder.svg"],
        amenities: [],
        available: true,
        owner: {
          id: user.id,
          name: user.fullName || "Unknown User",
          avatar: user.imageUrl || "/placeholder.svg",
          rating: 0,
          verified: true
        },
        ownerId: user.id
      }

      await listingsService.createListing(listingData)

      toast({
        title: "Listing created successfully!",
        description: "Your new listing is now live and visible to renters.",
      })

      setIsCreatingListing(false)
      setNewListing({
        title: "",
        description: "",
        price: "",
        category: "",
        location: "",
        images: [],
      })

      // Reload listings
      const userListings = await listingsService.getUserListings(user.id)
      setListings(userListings)
    } catch (error) {
      console.error("Error creating listing:", error)

      let errorMessage = "Please try again or contact support."

      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          errorMessage = "You don't have permission to create listings. Please log out and log back in."
        } else if (error.message.includes('Network error')) {
          errorMessage = "Network connection issue. Please check your internet connection."
        } else if (error.message.includes('Missing required fields')) {
          errorMessage = "Please fill in all required fields."
        } else if (error.message.includes('Firebase is not properly configured')) {
          errorMessage = "System configuration error. Please contact support."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error creating listing",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleEditListing = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "Listing updated successfully!",
        description: "Your listing changes have been saved.",
      })

      setIsEditingListing(false)
      setEditingListingId(null)
    } catch (error) {
      toast({
        title: "Error updating listing",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Listing deleted",
        description: "The listing has been permanently removed.",
      })
    } catch (error) {
      toast({
        title: "Error deleting listing",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: `Listing ${newStatus}`,
        description: `Your listing is now ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }


  // Redirect if not authenticated
  useEffect(() => {
    if (!!isLoaded && !user) {
      router.push('/signin')
    }
  }, [user, !isLoaded, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Listings
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Manage your rental listings and track their performance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
              >
                Back to Profile
              </Button>
              <Dialog open={isCreatingListing} onOpenChange={setIsCreatingListing}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Create Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold">Create New Listing</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">Add a new item to your rental listings</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateListing} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Listing Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Vintage Camera Collection"
                          value={newListing.title}
                          onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your item in detail..."
                          value={newListing.description}
                          onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="price">Daily Rate ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="35"
                          value={newListing.price}
                          onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={newListing.category} onValueChange={(value) => setNewListing(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="San Francisco, CA"
                          value={newListing.location}
                          onChange={(e) => setNewListing(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Photos</Label>

                        {/* Image Previews */}
                        {imagePreviewUrls.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                            {imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Upload photos of your item</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={isUploadingImages}
                          />
                          <label htmlFor="image-upload">
                            <Button
                              variant="outline"
                              type="button"
                              asChild
                              disabled={isUploadingImages}
                            >
                              <span>
                                {isUploadingImages ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose Files
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 10MB each.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreatingListing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Create Listing
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Listings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {listings.filter(l => l.available).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Eye className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {listings.reduce((sum, l) => sum + l.reviews, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                <img
                  src={listing.image || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-1">{listing.title}</CardTitle>
                  <Badge className={getStatusColor(getListingStatus(listing))}>
                    {getStatusIcon(getListingStatus(listing))}
                    <span className="ml-1">{getListingStatus(listing)}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="mb-3 line-clamp-2">{listing.description}</CardDescription>

                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />${listing.price}/day
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    0 bookings
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.reviews} reviews
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{listing.rating}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingListing(true)
                      setEditingListingId(listing.id || null)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/profile/listings/${listing.id}/availability`)}
                    title="Manage Availability"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(listing.id!, getListingStatus(listing))}
                    className={getListingStatus(listing) === "active" ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                  >
                    {getListingStatus(listing) === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{listing.title}"? This action cannot be undone and will remove all associated bookings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteListing(listing.id!)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first listing to start earning from your items."
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  onClick={() => setIsCreatingListing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}




