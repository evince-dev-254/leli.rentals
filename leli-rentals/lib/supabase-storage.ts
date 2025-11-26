import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload (File or Buffer)
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabaseStorage(
    file: File | Buffer,
    bucket: string,
    path: string,
    client?: any // SupabaseClient
): Promise<{ url: string; path: string }> {
    try {
        let fileData: ArrayBuffer | Buffer

        if (file instanceof File) {
            fileData = await file.arrayBuffer()
        } else {
            fileData = file
        }

        const supabaseClient = client || supabase

        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(path, fileData, {
                upsert: true,
                contentType: file instanceof File ? file.type : 'application/octet-stream',
            })

        if (error) {
            console.error('Supabase upload error:', error)
            throw new Error(`Failed to upload to Supabase: ${error.message}`)
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(data.path)

        return {
            url: urlData.publicUrl,
            path: data.path,
        }
    } catch (error) {
        console.error('Upload to Supabase Storage failed:', error)
        throw error
    }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function deleteFromSupabaseStorage(
    bucket: string,
    path: string
): Promise<void> {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path])

        if (error) {
            console.error('Supabase delete error:', error)
            throw new Error(`Failed to delete from Supabase: ${error.message}`)
        }
    } catch (error) {
        console.error('Delete from Supabase Storage failed:', error)
        throw error
    }
}

/**
 * Get a signed URL for a private file
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn)

        if (error) {
            console.error('Supabase signed URL error:', error)
            throw new Error(`Failed to get signed URL: ${error.message}`)
        }

        return data.signedUrl
    } catch (error) {
        console.error('Get signed URL failed:', error)
        throw error
    }
}
