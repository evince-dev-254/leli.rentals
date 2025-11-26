"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  CheckCircle,
  Star,
  MessageCircle,
  Lock
} from "lucide-react"
import { userProfileService, UserProfile } from "@/lib/user-profile-service"
import { userSettingsService } from "@/lib/user-settings-service"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useUser()
  const userId = params.userId as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public')
  const [canViewProfile, setCanViewProfile] = useState(true)
  const [ownerListings, setOwnerListings] = useState<any[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (userId) {
        try {
        const data = await userProfileService.getPublicProfile(userId)
        setProfile(data)
          
          // Check profile visibility settings
          const settings = await userSettingsService.getUserSettings(userId)
          const visibility = settings?.privacy?.profileVisibility || 'public'
          setProfileVisibility(visibility as 'public' | 'private')
          
          // Determine if current user can view this profile
          // Owners can always view other owners' profiles
          // Renters can only view public profiles
          const viewerAccountType = (currentUser?.unsafeMetadata?.accountType as string) ||
                                   (currentUser?.publicMetadata?.accountType as string)
          const profileAccountType = data?.account_type
          
          if (profileAccountType === 'owner') {
            // If viewing own profile, always allow
            if (currentUser?.id === userId) {
              setCanViewProfile(true)
            } else if (viewerAccountType === 'owner') {
              // Owners can always view other owners' profiles
              setCanViewProfile(true)
            } else {
              // Renters can only view public owner profiles
              setCanViewProfile(visibility === 'public')
            }
            
            // Load owner's listings if profile is viewable
            if (data && (visibility === 'public' || viewerAccountType === 'owner' || currentUser?.id === userId)) {
              await loadOwnerListings(data.user_id || userId)
            }
          } else {
            // For non-owner profiles, respect visibility settings
            setCanViewProfile(visibility === 'public' || currentUser?.id === userId)
          }
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
      setLoading(false)
    }

    async function loadOwnerListings(ownerUserId: string) {
      setListingsLoading(true)
      try {
        // Try querying by user_id (Clerk ID) first
        let { data: listings, error } = await supabase
          .from('listings')
          .select('id, title, price, location, images, status')
          .eq('user_id', ownerUserId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6)

        // If no results and userId is UUID format, try by id
        if ((!listings || listings.length === 0) && ownerUserId.includes('-')) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('id', ownerUserId)
            .single()
          
          if (profileData?.user_id) {
            const { data: listingsById } = await supabase
              .from('listings')
              .select('id, title, price, location, images, status')
              .eq('user_id', profileData.user_id)
              .eq('status', 'published')
              .order('created_at', { ascending: false })
              .limit(6)
            
            listings = listingsById
          }
        }

        if (error) {
          console.error('Error fetching owner listings:', error)
        } else {
          setOwnerListings(listings || [])
        }
      } catch (error) {
        console.error('Error loading owner listings:', error)
      } finally {
        setListingsLoading(false)
      }
    }

    loadProfile()
  }, [userId, currentUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Profile Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This user profile doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!canViewProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Private Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This profile is set to private. Only the owner can view their full profile details.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Note: Owners can always view other owners' profiles. Switch to an owner account to view this profile.
              </p>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-orange-500">
                <AvatarImage src={profile.avatar || ""} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-4xl font-bold">
                  {profile.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.name}
                  </h1>
                  {profile.is_verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Account Type & Subscription */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {profile.account_type && (
                    <Badge variant="outline" className="capitalize">
                      {profile.account_type}
                    </Badge>
                  )}
                  {profile.subscription_status && profile.subscription_status !== 'free' && (
                    <Badge className="bg-purple-500 text-white capitalize">
                      <Star className="h-3 w-3 mr-1" />
                      {profile.subscription_status}
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {profile.bio}
                  </p>
                )}

                {/* Location */}
                {profile.location && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-400 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* Contact Button */}
                <Link href={`/messages?user=${userId}`}>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Type */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {profile.account_type || 'Not Set'}
                  </p>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Star className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subscription</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {profile.subscription_status || 'Free'}
                  </p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CheckCircle className={`h-5 w-5 ${profile.is_verified ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verification</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile.is_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Preview (if owner) */}
        {profile.account_type === 'owner' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Listings</CardTitle>
                {ownerListings.length > 0 && (
                  <Link href={`/profile/${userId}?tab=listings`}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {listingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : ownerListings.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No listings available yet
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownerListings.map((listing: any) => (
                    <Link key={listing.id} href={`/listings/details/${listing.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={Array.isArray(listing.images) && listing.images.length > 0 
                              ? listing.images[0] 
                              : (listing.image || '/placeholder.jpg')}
                            alt={listing.title || 'Listing'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {listing.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-orange-600 font-bold">
                              KSh {(listing.price || 0).toLocaleString('en-KE')}/day
                            </p>
                            {listing.location && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {listing.location}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

