"use client"

import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'

interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

interface UseCloudinaryUploadOptions {
  folder?: string
  tags?: string[]
  maxFiles?: number
  maxSize?: number // in bytes
  useSupabase?: boolean // New option to use Supabase Storage
}

export function useCloudinaryUpload(options: UseCloudinaryUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { user } = useUser()
  const { toast } = useToast()

  const uploadFiles = useCallback(async (
    files: File[],
    customOptions: Partial<UseCloudinaryUploadOptions> = {}
  ): Promise<UploadResult[]> => {
    const finalOptions = { ...options, ...customOptions }
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Prepare form data
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('folder', finalOptions.folder || `users/upload`)
      formData.append('tags', (finalOptions.tags || ['user-upload']).join(','))

      // Add useSupabase flag if enabled
      if (finalOptions.useSupabase) {
        formData.append('useSupabase', 'true')
      }

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || 'Upload failed'
          if (errorData.details) errorMessage += `: ${JSON.stringify(errorData.details)}`
        } catch (e) {
          errorMessage = await response.text() || 'Upload failed'
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setUploadProgress(100)

      toast({
        title: "✅ Upload Successful!",
        description: result.message || `${result.count} file(s) uploaded.`
      })

      return result.uploads
    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive"
      })
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [user, options, toast])

  const uploadSingleFile = useCallback(async (
    file: File,
    customOptions: Partial<UseCloudinaryUploadOptions> = {}
  ): Promise<UploadResult> => {
    const finalOptions = { ...options, ...customOptions }
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', finalOptions.folder || `users/upload`)
      formData.append('tags', (finalOptions.tags || ['user-upload']).join(','))

      // Add useSupabase flag if enabled
      if (finalOptions.useSupabase) {
        formData.append('useSupabase', 'true')
      }

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || 'Upload failed'
          if (errorData.details) errorMessage += `: ${JSON.stringify(errorData.details)}`
        } catch (e) {
          errorMessage = await response.text() || 'Upload failed'
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setUploadProgress(100)

      toast({
        title: "✅ Upload Successful!",
        description: result.message || "File uploaded successfully."
      })

      return result.upload || result.uploads?.[0]
    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive"
      })
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [user, options, toast])

  const deleteFile = useCallback(async (publicId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to delete files')
    }

    try {
      // Clerk authentication - no need for manual token
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      toast({
        title: "File deleted",
        description: "File has been deleted successfully."
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
      throw error
    }
  }, [user, toast])

  return {
    uploadFiles,
    uploadSingleFile,
    deleteFile,
    isUploading,
    uploadProgress
  }
}
