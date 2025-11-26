"use client"

import React, { useState, useEffect } from "react"
import { DatabaseService } from '@/lib/database-service'
import { Header } from "@/components/header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Bell,
  Camera,
  Save,
  Edit,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Upload,
  FileText,
  Star,
  Activity,
  TrendingUp,
  Package,
  Heart,
  MessageSquare,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Crown,
  ArrowLeft,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import CloudinaryProfileUpload from "@/components/cloudinary-profile-upload"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+254700000000',
    location: 'Nairobi, Kenya',
    bio: 'I love renting items and sharing my own!',
    dateJoined: '',
    verified: true,
    website: '',
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    accountType: 'renter',
    subscriptionStatus: 'free',
    rating: 4.8,
    totalReviews: 24,
    totalBookings: 15,
    totalListings: 0
  })
  const [profilePicture, setProfilePicture] = useState("")

  // Calculate membership duration
  const getMembershipDuration = (createdAt: number) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffDays < 1) return 'Today'
    if (diffDays === 1) return '1 day'
    if (diffDays < 30) return `${diffDays} days`
    if (diffMonths === 1) return '1 month'
    if (diffMonths < 12) return `${diffMonths} months`
    if (diffYears === 1) return '1 year'
    return `${diffYears} years`
  }

  const getJoinDate = (createdAt: number) => {
    const date = new Date(createdAt)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Update profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        dateJoined: getJoinDate(user.createdAt),
        accountType: (user.unsafeMetadata?.accountType as string) ||
          (user.publicMetadata?.accountType as string) ||
          'not_selected',
        subscriptionStatus: (user.unsafeMetadata?.subscriptionStatus as string) ||
          (user.publicMetadata?.subscriptionStatus as string) ||
          'free',
        verified: (user.unsafeMetadata?.isVerified as boolean) ||
          (user.publicMetadata?.isVerified as boolean) ||
          (user.unsafeMetadata?.verificationStatus as string) === 'approved' ||
          (user.publicMetadata?.verificationStatus as string) === 'approved' ||
          false,
      }))
      setProfilePicture(user.imageUrl || '')
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in")
    }
  }, [isLoaded, user, router])

  // Get user account type and verification status from user metadata or cookies
  // Check both unsafeMetadata and publicMetadata for account type
  const userAccountType = (user?.unsafeMetadata?.accountType as string) ||
    (user?.publicMetadata?.accountType as string) ||
    'renter'

  const subscriptionStatus = (user?.unsafeMetadata?.subscriptionStatus as string) ||
    (user?.publicMetadata?.subscriptionStatus as string) ||
    'free'

  const verificationStatusRaw = (user?.unsafeMetadata?.verificationStatus as string) ||
    (user?.publicMetadata?.verificationStatus as string) ||
    'not_verified'

  const verificationStatus = {
    status: verificationStatusRaw,
    isVerified: verificationStatusRaw === 'approved',
    isPending: verificationStatusRaw === 'pending',
    isNotVerified: verificationStatusRaw === 'not_verified' || !verificationStatusRaw,
    documentsSubmitted: verificationStatusRaw === 'pending' || verificationStatusRaw === 'approved',
    pendingReview: verificationStatusRaw === 'pending',
    rejectionReason: (user?.unsafeMetadata?.verificationRejectionReason as string) ||
      (user?.publicMetadata?.verificationRejectionReason as string)
  }

  const subscriptionEndsAt = (user?.unsafeMetadata?.subscriptionEndsAt as string) ||
    (user?.publicMetadata?.subscriptionEndsAt as string)

  const getDaysRemaining = () => {
    if (!subscriptionEndsAt) return 0
    const now = new Date()
    const endDate = new Date(subscriptionEndsAt)
    const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const trialDaysRemaining = subscriptionStatus === 'trial' ? getDaysRemaining() : 0

  // Load profile data when component mounts
  useEffect(() => {
    if (user && isLoaded) {
      loadProfileFromDatabase()
    }
  }, [user, isLoaded])

  // Show loading state
  if (!isLoaded) {
    return <LoadingSpinner message="Loading profile..." variant="profile" />
  }

  // Show loading while redirecting
  if (!user) {
    return <LoadingSpinner message="Redirecting..." variant="profile" />
  }

  const handleSave = async () => {
    // Save profile to database
    await saveProfileToDatabase()
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleProfilePictureChange = async (imageUrl: string) => {
    setProfilePicture(imageUrl)

    // Auto-save profile picture to database
    if (user) {
      try {
        await DatabaseService.updateUser(user.id, {
          avatar: imageUrl
        })
        console.log('Profile picture saved to database:', imageUrl)
      } catch (error) {
        console.error('Error saving profile picture:', error)
      }
    }
  }

  const handleProfilePictureRemove = () => {
    setProfilePicture("")
    // Here you would typically remove from your backend/database
    console.log('Profile picture removed')
  }

  // Database integration functions
  const saveProfileToDatabase = async () => {
    if (!user) return

    try {
      const userData = {
        id: user.id,
        email: profileData.email,
        name: `${profileData.firstName} ${profileData.lastName}`,
        avatar: profilePicture
      }

      const savedUser = await DatabaseService.createUser(userData)
      console.log('Profile saved to database:', savedUser)

      // Show success message
      alert('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    }
  }

  const loadProfileFromDatabase = async () => {
    if (!user) return

    try {
      const userData = await DatabaseService.getUserById(user.id)
      if (userData) {
        // Update profile data with database values
        setProfileData(prev => ({
          ...prev,
          firstName: userData.name?.split(' ')[0] || prev.firstName,
          lastName: userData.name?.split(' ')[1] || prev.lastName,
          email: userData.email || prev.email
        }))

        if (userData.avatar) {
          setProfilePicture(userData.avatar)
        }

        console.log('Profile loaded from database:', userData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <CloudinaryProfileUpload
                  currentImageUrl={profilePicture}
                  userName={user?.displayName || "User"}
                  onImageChange={handleProfilePictureChange}
                  onImageRemove={handleProfilePictureRemove}
                  className="w-full max-w-xs"
                />
                <Link href="/profile/avatar">
                  <Button variant="outline" size="sm" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Manage Avatar
                  </Button>
                </Link>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  {/* Verification Status Badge */}
                  {verificationStatus.isVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : verificationStatus.isPending ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verification Pending
                    </Badge>
                  ) : userAccountType === 'owner' ? (
                    <Badge className="bg-orange-100 text-orange-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  ) : null}

                  {/* Account Type Badge */}
                  <Badge variant="outline" className="capitalize">
                    {userAccountType === 'not_selected' ? 'Not Selected' : userAccountType}
                  </Badge>

                  {/* Subscription Badge */}
                  {subscriptionStatus === 'trial' ? (
                    <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Free Trial: {trialDaysRemaining} days left
                    </Badge>
                  ) : subscriptionStatus !== 'free' && subscriptionStatus !== 'none' && (
                    <Badge className="bg-purple-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profileData.location}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user && profileData.dateJoined && (
                      <>
                        Member for {getMembershipDuration(user.createdAt)} · Joined {profileData.dateJoined}
                      </>
                    )}
                    {user && !profileData.dateJoined && (
                      <>Loading...</>
                    )}
                    {!user && profileData.dateJoined && `Member since ${profileData.dateJoined}`}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{profileData.rating}</span>
                    <span className="text-gray-600 text-sm">({profileData.totalReviews} reviews)</span>
                  </div>
                  <div className="text-gray-600 text-sm">
                    • {profileData.totalBookings} bookings
                  </div>
                  {userAccountType === 'owner' && (
                    <div className="text-gray-600 text-sm">
                      • {profileData.totalListings} listings
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media & Website
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={profileData.facebook}
                      onChange={(e) => setProfileData(prev => ({ ...prev, facebook: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="facebook.com/yourprofile"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profileData.totalBookings}</div>
                      <div className="text-sm text-gray-600">Total Bookings</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">32</div>
                      <div className="text-sm text-gray-600">Favorites</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profileData.totalReviews}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{profileData.totalListings}</div>
                      <div className="text-sm text-gray-600">Listings</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links to Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => router.push('/profile/settings')}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Account Settings</div>
                      <div className="text-xs text-muted-foreground">Security, Privacy & More</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => router.push('/profile/billing')}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Billing & Plans</div>
                      <div className="text-xs text-muted-foreground">Manage subscription</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => router.push('/profile/settings?tab=notifications')}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Notifications</div>
                      <div className="text-xs text-muted-foreground">Configure alerts</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}


