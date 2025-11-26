"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  currentImageUrl?: string
  userName?: string
  onImageChange: (file: File) => Promise<boolean>
  onImageRemove?: () => Promise<boolean>
  maxSize?: number // in MB
  allowedTypes?: string[]
  className?: string
}

export function ImageUpload({
  currentImageUrl,
  userName = "User",
  onImageChange,
  onImageRemove,
  maxSize = 2,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid image file (${allowedTypes.map(type => type.split('/')[1]).join(', ')}).`,
        variant: "destructive",
      })
      return
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Please select an image smaller than ${maxSize}MB.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const success = await onImageChange(file)
      if (success) {
        toast({
          title: "Image updated",
          description: "Your profile image has been updated successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update your profile image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!onImageRemove) return

    setIsRemoving(true)
    try {
      const success = await onImageRemove()
      if (success) {
        toast({
          title: "Image removed",
          description: "Your profile image has been removed successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Failed to remove your profile image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="relative">
        <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
          <AvatarImage 
            src={currentImageUrl || "/placeholder.svg"} 
            alt={userName} 
          />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Loading overlay */}
        {(isUploading || isRemoving) && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading || isRemoving}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </>
            )}
          </Button>

          {currentImageUrl && onImageRemove && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemoveImage}
              disabled={isUploading || isRemoving}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF, or WebP. Max size {maxSize}MB.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile image"
        title="Upload profile image"
      />
    </div>
  )
}

export default ImageUpload
