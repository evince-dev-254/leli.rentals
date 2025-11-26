"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ImageUpload from "@/components/image-upload"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Camera, ArrowLeft, Upload, Trash2, Save, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { DatabaseService } from '@/lib/database-service'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function AvatarManagementPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profilePicture, setProfilePicture] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Handle redirect if user is not logged in
  useEffect(() => {
    if (!user && isLoaded) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  // Load current avatar
  useEffect(() => {
    if (user) {
      const currentAvatar = user.imageUrl || ""
      setProfilePicture(currentAvatar)
    }
  }, [user])

  // Show loading state
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

  // Redirect if not logged in
  if (!user) {
    return null
  }

  const handleImageChange = async (imageUrl: string) => {
    setProfilePicture(imageUrl)
    setHasChanges(true)
    
    // Auto-save to database
    try {
      setIsLoading(true)
      await DatabaseService.updateUser(user.id, {
        avatar: imageUrl
      })
      
      // Also update Clerk profile
      await user.setProfileImage({ file: imageUrl })
      
      toast({
        title: "Success!",
        description: "Your profile picture has been updated.",
      })
      
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving profile picture:', error)
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageRemove = async () => {
    try {
      setIsLoading(true)
      setProfilePicture("")
      
      await DatabaseService.updateUser(user.id, {
        avatar: ""
      })
      
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      })
      
      setHasChanges(false)
    } catch (error) {
      console.error('Error removing profile picture:', error)
      toast({
        title: "Error",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Profile Picture</h1>
          </div>
          <p className="text-gray-600 ml-12">
            Manage your profile avatar and display picture
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Profile Picture Guidelines</AlertTitle>
          <AlertDescription className="text-blue-800">
            Use a clear photo where your face is visible. Recommended size: 400x400 pixels. 
            Maximum file size: 2MB. Accepted formats: JPG, PNG, GIF, WebP.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload New Picture
              </CardTitle>
              <CardDescription>
                Choose a new profile picture from your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                currentImageUrl={profilePicture}
                userName={user.fullName || user.username || "User"}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                maxSize={2}
              />
              
              {hasChanges && (
                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Changes saved automatically</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Current Profile Picture
              </CardTitle>
              <CardDescription>
                How your picture appears to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large Preview */}
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <Avatar className="h-40 w-40 border-4 border-white shadow-xl">
                    <AvatarImage src={profilePicture} alt={user.fullName || "User"} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.fullName || user.username || "U")}
                    </AvatarFallback>
                  </Avatar>
                  {profilePicture && (
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500">
                      Active
                    </Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {user.fullName || user.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              {/* Small Previews */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700">Preview Sizes:</p>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profilePicture} alt={user.fullName || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.fullName || user.username || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Large (48px)</p>
                    <p className="text-xs text-gray-500">Profile header</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profilePicture} alt={user.fullName || "User"} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.fullName || user.username || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Medium (32px)</p>
                    <p className="text-xs text-gray-500">Comments, listings</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profilePicture} alt={user.fullName || "User"} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.fullName || user.username || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Small (24px)</p>
                    <p className="text-xs text-gray-500">Notifications, chat</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleImageRemove}
                  disabled={!profilePicture || isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
                <Link href="/profile/settings" className="flex-1">
                  <Button variant="default" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Go to Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              </Link>
              <Link href="/profile/settings">
                <Button variant="ghost" size="sm">
                  Account Settings
                </Button>
              </Link>
              <Link href="/profile/security">
                <Button variant="ghost" size="sm">
                  Security
                </Button>
              </Link>
              <Link href="/profile/notifications">
                <Button variant="ghost" size="sm">
                  Notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

