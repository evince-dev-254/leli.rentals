'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Image as ImageIcon, Calendar, Download, Eye, Grid } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface StorageFile {
    name: string
    id: string
    updated_at: string
    created_at: string
    metadata: {
        size: number
        mimetype: string
    }
    url?: string
}

export default function ListingImagesPage() {
    const [files, setFiles] = useState<StorageFile[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    useEffect(() => {
        fetchImages()
    }, [])

    async function fetchImages() {
        try {
            setLoading(true)

            const response = await fetch('/api/storage/list?bucket=listing-images&limit=200')
            if (response.ok) {
                const data = await response.json()
                setFiles(data || [])
            } else {
                console.error('Error fetching images:', await response.text())
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }



    function formatFileSize(bytes: number) {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Listing Images</h1>
                            <p className="text-white/70">View all property listing images</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={fetchImages}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Total Images</p>
                        <p className="text-2xl font-bold text-white">{files.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Total Size</p>
                        <p className="text-2xl font-bold text-white">
                            {formatFileSize(files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0))}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Storage Bucket</p>
                        <p className="text-2xl font-bold text-white">listing-images</p>
                    </div>
                </div>

                {/* Images Grid/List */}
                {loading ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center text-white">
                        Loading images...
                    </div>
                ) : files.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center text-white/70">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No listing images found</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all group"
                            >
                                <div className="relative aspect-video bg-white/5">
                                    <img
                                        src={file.url || ''}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setSelectedImage(file.url || null)}
                                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                                        >
                                            <Eye className="w-5 h-5 text-white" />
                                        </button>
                                        <a
                                            href={file.url || '#'}
                                            download
                                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                                        >
                                            <Download className="w-5 h-5 text-white" />
                                        </a>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="text-xs text-white/70 truncate">{file.name.split('/').pop()}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-white/50">
                                            {formatFileSize(file.metadata?.size || 0)}
                                        </span>
                                        <span className="text-xs text-white/50">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Preview</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Uploaded</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {files.map((file) => (
                                        <tr key={file.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={file.url || ''}
                                                    alt={file.name}
                                                    className="w-16 h-10 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white truncate max-w-xs">
                                                {file.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/70">
                                                {formatFileSize(file.metadata?.size || 0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/70">
                                                {new Date(file.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedImage(file.url || null)}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-all"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <a
                                                        href={file.url || '#'}
                                                        download
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-all"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-6xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
