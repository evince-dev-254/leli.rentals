import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const bucket = searchParams.get('bucket')
        const path = searchParams.get('path') || ''
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        if (!bucket) {
            return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 })
        }

        // List files
        let { data: files, error: listError } = await supabaseAdmin
            .storage
            .from(bucket)
            .list(path, {
                limit,
                offset,
                sortBy: { column: 'created_at', order: 'desc' }
            })

        // Auto-create bucket if it doesn't exist
        if (listError && listError.message.includes('Bucket not found')) {
            console.log(`Bucket ${bucket} not found, attempting to create...`)
            const { error: createError } = await supabaseAdmin
                .storage
                .createBucket(bucket, {
                    public: bucket === 'listing-images', // Only listing-images is public
                    fileSizeLimit: 52428800, // 50MB
                })

            if (createError) {
                console.error(`Error creating bucket ${bucket}:`, createError)
                return NextResponse.json({ error: `Bucket not found and creation failed: ${createError.message}` }, { status: 500 })
            }

            // Retry listing
            const retry = await supabaseAdmin
                .storage
                .from(bucket)
                .list(path, {
                    limit,
                    offset,
                    sortBy: { column: 'created_at', order: 'desc' }
                })

            files = retry.data
            listError = retry.error
        }

        if (listError) {
            console.error('Error listing files:', listError)
            return NextResponse.json({ error: listError.message }, { status: 500 })
        }

        if (!files) {
            return NextResponse.json([])
        }

        // Generate signed URLs for each file
        const filesWithUrls = await Promise.all(files.map(async (file) => {
            const filePath = path ? `${path}/${file.name}` : file.name

            // Create signed URL valid for 1 hour
            const { data: urlData, error: urlError } = await supabaseAdmin
                .storage
                .from(bucket)
                .createSignedUrl(filePath, 3600)

            if (urlError) {
                console.error(`Error generating URL for ${filePath}:`, urlError)
                return { ...file, url: null }
            }

            return {
                ...file,
                url: urlData.signedUrl,
                fullPath: filePath
            }
        }))

        return NextResponse.json(filesWithUrls)
    } catch (error: any) {
        console.error('Storage API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
