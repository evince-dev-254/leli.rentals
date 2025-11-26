import { v2 as cloudinary } from 'cloudinary'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.error('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set')
}
if (!process.env.CLOUDINARY_API_KEY) {
  console.error('❌ CLOUDINARY_API_KEY is not set')
}
if (!process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ CLOUDINARY_API_SECRET is not set')
}

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

console.log('✅ Cloudinary configured:', {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key_length: process.env.CLOUDINARY_API_KEY?.length,
  has_secret: !!process.env.CLOUDINARY_API_SECRET
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
}

export interface CloudinaryUploadOptions {
  folder?: string
  transformation?: any
  tags?: string[]
  moderation?: string
  quality?: string | number
  format?: string
}

// Server-side upload function for owners
export const uploadToCloudinary = async (
  file: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const uploadOptions: any = {
      folder: options.folder || 'leli-rentals',
      tags: options.tags,
      resource_type: 'auto' as const
    }

    // Add transformation if provided
    if (options.transformation) {
      uploadOptions.transformation = options.transformation
    }

    // Convert Buffer to data URI string if needed
    let fileToUpload: string
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to base64 data URI
      const base64 = file.toString('base64')
      fileToUpload = `data:image/png;base64,${base64}`
    } else {
      fileToUpload = file
    }

    const result = await cloudinary.uploader.upload(fileToUpload, uploadOptions)

    console.log('✅ Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      bytes: result.bytes
    })

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes
    }
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', {
      message: error.message,
      statusCode: error.http_code,
      errorDetails: error.error,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })

    // Provide more specific error messages
    if (error.message?.includes('Invalid cloud_name')) {
      throw new Error('Cloudinary configuration error: Invalid cloud name. Please check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
    }
    if (error.message?.includes('Invalid API key')) {
      throw new Error('Cloudinary configuration error: Invalid API key. Please check CLOUDINARY_API_KEY')
    }
    if (error.http_code === 401) {
      throw new Error('Cloudinary authentication failed: Please verify your API credentials')
    }

    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Upload multiple files for property listings
export const uploadMultipleToCloudinary = async (
  files: (Buffer | string)[],
  folder: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult[]> => {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadToCloudinary(file, {
        ...options,
        folder: `${folder}/image_${index + 1}`,
        tags: [...(options.tags || []), 'property-listing']
      })
    )

    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Multiple Cloudinary upload error:', error)
    throw new Error(`Multiple upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (
  publicId: string,
  transformations: any = {}
): string => {
  const defaultTransformations = {
    quality: 'auto',
    format: 'auto',
    width: 800,
    height: 600,
    crop: 'fill',
    gravity: 'auto'
  }

  const finalTransformations = { ...defaultTransformations, ...transformations }

  return cloudinary.url(publicId, {
    transformation: finalTransformations,
    secure: true
  })
}

// Generate thumbnail URL
export const getThumbnailUrl = (publicId: string, size: number = 300): string => {
  return cloudinary.url(publicId, {
    transformation: {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto'
    },
    secure: true
  })
}

// Generate responsive image URLs for different screen sizes
export const getResponsiveImageUrls = (publicId: string) => {
  return {
    thumbnail: getThumbnailUrl(publicId, 150),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900 }),
    original: cloudinary.url(publicId, { secure: true })
  }
}

export default cloudinary
