"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload'

interface CloudinaryProfileUploadProps {
  currentImageUrl?: string
  userName?: string
  onImageChange: (imageUrl: string) => void
  onImageRemove?: () => void
  className?: string
}

export default function CloudinaryProfileUpload({
  currentImageUrl,
  userName = "User",
  onImageChange,
  onImageRemove,
  className = ""
}: CloudinaryProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { uploadSingleFile } = useCloudinaryUpload({
    folder: 'user-profiles',
    tags: ['profile-picture']
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, PNG, WebP, or GIF images only.",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 5MB.",
        variant: "destructive"
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await uploadSingleFile(file, {
        folder: `user-profiles/${Date.now()}`,
        tags: ['profile-picture', 'user-upload']
      })

      onImageChange(result.secure_url)
      setPreviewUrl(null)
      
      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been uploaded successfully."
      })
    } catch (error) {
      console.error('Upload error:', error)
      setPreviewUrl(null)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove()
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed."
      })
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const displayImage = previewUrl || currentImageUrl

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar Display */}
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={displayImage || ""} 
                  alt={userName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleClick}
                disabled={isUploading}
                variant="outline"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    {displayImage ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </Button>

              {displayImage && (
                <Button
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Guidelines */}
            <div className="text-center text-sm text-gray-500 max-w-sm">
              <p>Upload a clear photo of yourself</p>
              <p>JPG, PNG, WebP, or GIF • Max 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
