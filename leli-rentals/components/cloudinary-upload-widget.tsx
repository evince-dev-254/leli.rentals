"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

declare global {
  interface Window {
    cloudinary: any
  }
}

interface CloudinaryUploadWidgetProps {
  onUploadComplete: (result: any) => void
  onUploadError?: (error: any) => void
  maxFiles?: number
  folder?: string
  tags?: string[]
  className?: string
  children?: React.ReactNode
}

interface UploadedImage {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
}

export default function CloudinaryUploadWidget({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  folder = 'leli-rentals/renter-profiles',
  tags = ['renter-profile'],
  className = '',
  children
}: CloudinaryUploadWidgetProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [widget, setWidget] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load Cloudinary widget script
    const loadCloudinaryScript = () => {
      if (window.cloudinary) {
        initializeWidget()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
      script.async = true
      script.onload = initializeWidget
      script.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load Cloudinary widget. Please refresh the page.",
          variant: "destructive"
        })
      }
      document.head.appendChild(script)
    }

    const initializeWidget = () => {
      if (!window.cloudinary) return

      const myWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'drtjczrsl',
          uploadPreset: 'leli_rentals_unsigned', // You'll need to create this preset
          folder: folder,
          tags: tags,
          maxFiles: maxFiles,
          multiple: maxFiles > 1,
          cropping: true,
          croppingAspectRatio: 1,
          croppingShowDimensions: true,
          showAdvancedOptions: true,
          singleUploadAutoClose: false,
          styles: {
            palette: {
              window: "#FFFFFF",
              sourceBg: "#F4F4F5",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              inactiveTabIcon: "#69778A",
              menuIcons: "#0078FF",
              link: "#0078FF",
              action: "#0078FF",
              inProgress: "#0078FF",
              complete: "#20B832",
              error: "#EA2727",
              textDark: "#000000",
              textLight: "#FFFFFF"
            },
            fonts: {
              default: null,
              "'Fira Sans', sans-serif": {
                url: "https://fonts.googleapis.com/css?family=Fira+Sans",
                active: true
              }
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            console.log('Upload successful:', result.info)
            
            const uploadedImage: UploadedImage = {
              public_id: result.info.public_id,
              secure_url: result.info.secure_url,
              width: result.info.width,
              height: result.info.height,
              format: result.info.format
            }

            setUploadedImages(prev => [...prev, uploadedImage])
            onUploadComplete(result.info)
            
            toast({
              title: "Upload successful!",
              description: "Your image has been uploaded successfully."
            })
          } else if (error) {
            console.error('Upload error:', error)
            onUploadError?.(error)
            toast({
              title: "Upload failed",
              description: "Failed to upload image. Please try again.",
              variant: "destructive"
            })
          }
        }
      )

      setWidget(myWidget)
    }

    loadCloudinaryScript()

    return () => {
      // Cleanup
      if (widget) {
        widget.destroy()
      }
    }
  }, [folder, tags, maxFiles, onUploadComplete, onUploadError, toast])

  const openWidget = () => {
    if (widget) {
      setIsLoading(true)
      widget.open()
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleWidgetClose = () => {
    setIsLoading(false)
  }

  useEffect(() => {
    if (widget) {
      widget.on('close', handleWidgetClose)
    }
  }, [widget])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex flex-col items-center space-y-4">
        {children || (
          <Button
            onClick={openWidget}
            disabled={isLoading}
            className="w-full max-w-md"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
              </>
            )}
          </Button>
        )}

        <p className="text-sm text-gray-500 text-center">
          Upload up to {maxFiles} image{maxFiles > 1 ? 's' : ''} (JPG, PNG, WebP)
        </p>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-2">
                  <div className="relative">
                    <img
                      src={image.secure_url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {image.width} × {image.height}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Use high-quality images (minimum 800x600px)</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
          <li>• Images will be automatically optimized</li>
          <li>• Content will be moderated for appropriateness</li>
        </ul>
      </div>
    </div>
  )
}
