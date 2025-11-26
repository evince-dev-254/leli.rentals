'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { FileText, User, Calendar, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface VerificationDoc {
    name: string
    id: string
    updated_at: string
    created_at: string
    metadata: {
        size: number
        mimetype: string
    }
    userId?: string
    status?: string
}

export default function VerificationDocumentsPage() {
    const [documents, setDocuments] = useState<VerificationDoc[]>([])
    const [verifications, setVerifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

    useEffect(() => {
        fetchDocuments()
        fetchVerifications()
    }, [])

    async function fetchDocuments() {
        try {
            setLoading(true)

            const response = await fetch('/api/storage/list?bucket=verification-documents')
            if (response.ok) {
                const data = await response.json()
                setDocuments(data || [])
            } else {
                console.error('Error fetching documents:', await response.text())
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchVerifications() {
        try {
            const response = await fetch('/api/verification/list?status=all')
            if (response.ok) {
                const data = await response.json()
                setVerifications(data || [])
            }
        } catch (error) {
            console.error('Error fetching verifications:', error)
        }
    }



    function formatFileSize(bytes: number) {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    function getUserVerificationStatus(userId: string) {
        const verification = verifications.find(v => v.user_id === userId)
        return verification?.status || 'unknown'
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-300" />
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-300" />
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-300" />
            default:
                return <FileText className="w-4 h-4 text-gray-300" />
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'approved':
                return 'bg-green-500/20 text-green-300 border-green-500/30'
            case 'rejected':
                return 'bg-red-500/20 text-red-300 border-red-500/30'
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    function viewDocument(doc: any) {
        if (doc.url) {
            setSelectedDoc(doc.url)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Verification Documents</h1>
                            <p className="text-white/70">Review user ID verification submissions</p>
                        </div>
                        <button
                            onClick={() => {
                                fetchDocuments()
                                fetchVerifications()
                            }}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Total Documents</p>
                        <p className="text-2xl font-bold text-white">{documents.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Approved</p>
                        <p className="text-2xl font-bold text-green-300">
                            {verifications.filter(v => v.status === 'approved').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-yellow-300">
                            {verifications.filter(v => v.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm">Rejected</p>
                        <p className="text-2xl font-bold text-red-300">
                            {verifications.filter(v => v.status === 'rejected').length}
                        </p>
                    </div>
                </div>

                {/* Documents List */}
                {loading ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center text-white">
                        Loading documents...
                    </div>
                ) : documents.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center text-white/70">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No verification documents found</p>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">User ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Document</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Uploaded</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {documents.map((doc) => {
                                        const userId = doc.name.split('/')[0]
                                        const status = getUserVerificationStatus(userId)
                                        return (
                                            <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm font-mono text-white/70">
                                                    {userId.substring(0, 12)}...
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-white/50" />
                                                        {doc.name.split('/').pop()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white/70">
                                                    {formatFileSize(doc.metadata?.size || 0)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                                                        {getStatusIcon(status)}
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white/70">
                                                    {new Date(doc.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => viewDocument(doc)}
                                                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-xs transition-all"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Document Modal */}
            {selectedDoc && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedDoc(null)}
                >
                    <div className="relative max-w-4xl max-h-full bg-white rounded-lg">
                        <iframe
                            src={selectedDoc}
                            className="w-full h-[80vh] rounded-lg"
                            title="Document Preview"
                        />
                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
