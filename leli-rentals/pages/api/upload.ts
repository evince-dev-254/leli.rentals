import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File as FormidableFile } from 'formidable'
import { promises as fs } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { uploadToSupabaseStorage } from '@/lib/supabase-storage'
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary'
import { getAuth } from '@clerk/nextjs/server'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const form = new IncomingForm({
            maxFileSize: 50 * 1024 * 1024, // 50MB
            keepExtensions: true,
            multiples: true,
        })

        const [fields, files] = await form.parse(req)

        // Helper to get single value from fields
        const getValue = (key: string) => {
            const val = fields[key]
            if (Array.isArray(val)) return val[0]
            return val
        }

        const folder = getValue('folder') || 'users/upload'
        const tagsStr = getValue('tags') || 'user-upload'
        const useSupabase = getValue('useSupabase') === 'true'

        // Get files
        const uploadedFiles = files.files || files.file
        if (!uploadedFiles) {
            return res.status(400).json({ error: 'No files provided' })
        }

        const fileList = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]

        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
        for (const file of fileList) {
            if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    error: `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`
                })
            }
        }

        // Use Supabase Storage
        if (useSupabase) {
            const { userId } = getAuth(req)
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            // Create admin client to bypass RLS
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const uploadResults = await Promise.all(
                fileList.map(async (file, index) => {
                    const fileBuffer = await fs.readFile(file.filepath)
                    const bucket = tagsStr.includes('verification') ? 'verification-documents' :
                        tagsStr.includes('profile') ? 'profile-images' : 'listing-images'
                    const timestamp = Date.now()
                    const fileName = `${userId}/${timestamp}-${index}-${file.originalFilename || 'upload'}`

                    // Pass admin client to bypass RLS
                    const result = await uploadToSupabaseStorage(fileBuffer, bucket, fileName, supabaseAdmin)
                    return {
                        url: result.url,
                        path: result.path,
                        name: file.originalFilename
                    }
                })
            )

            if (req.method === 'PUT' && uploadResults.length === 1) {
                return res.status(200).json({
                    success: true,
                    message: 'File successfully uploaded to Supabase',
                    upload: uploadResults[0]
                })
            }

            return res.status(200).json({
                success: true,
                message: `Successfully uploaded ${uploadResults.length} file(s) to Supabase`,
                uploads: uploadResults,
                count: uploadResults.length
            })
        }

        // Fallback to Cloudinary
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({
                error: 'Upload service not configured',
                details: 'Cloudinary environment variables are missing'
            })
        }

        const fileBuffers = await Promise.all(
            fileList.map(async (file) => {
                return await fs.readFile(file.filepath)
            })
        )

        if (req.method === 'PUT' && fileBuffers.length === 1) {
            const uploadResult = await uploadToCloudinary(fileBuffers[0], {
                folder,
                tags: [tagsStr],
                quality: 'auto',
                format: 'auto'
            })

            return res.status(200).json({
                success: true,
                message: 'Image successfully uploaded to Cloudinary',
                upload: uploadResult
            })
        }

        const uploadResults = await uploadMultipleToCloudinary(
            fileBuffers,
            folder,
            {
                tags: [tagsStr, 'owner-upload'],
                quality: 'auto',
                format: 'auto'
            }
        )

        return res.status(200).json({
            success: true,
            message: `Successfully uploaded ${uploadResults.length} file(s)`,
            uploads: uploadResults,
            count: uploadResults.length
        })

    } catch (error: any) {
        console.error('Upload API error:', error)
        return res.status(500).json({
            error: 'Upload failed',
            details: error.message
        })
    }
}
