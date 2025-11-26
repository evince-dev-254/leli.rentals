'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react'

interface Verification {
  id: string
  user_id: string
  user_email?: string
  user_phone?: string
  user_location?: string
  id_type: string
  id_number: string | null
  front_image_url: string | null
  back_image_url: string | null
  selfie_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  verified_at: string | null
  rejection_reason?: string
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [allVerifications, setAllVerifications] = useState<Verification[]>([]) // For stats
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedVerificationId, setSelectedVerificationId] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState<string>('')

  useEffect(() => {
    fetchVerifications()
    fetchAllVerificationsForStats() // Fetch all for stats on mount and filter change
  }, [filterStatus])

  async function fetchVerifications() {
    try {
      setLoading(true)

      // Use the proxy API to fetch verifications (bypasses RLS via main app)
      const response = await fetch(`/api/verification/list?status=${filterStatus}`)

      if (!response.ok) {
        throw new Error('Failed to fetch verifications')
      }

      const data = await response.json()
      setVerifications(data || [])
    } catch (error) {
      console.error('Error fetching verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAllVerificationsForStats() {
    try {
      // Always fetch ALL verifications for accurate stats regardless of filter
      const response = await fetch('/api/verification/list?status=all')

      if (!response.ok) {
        return
      }

      const data = await response.json()
      setAllVerifications(data || [])
    } catch (error) {
      console.error('Error fetching all verifications for stats:', error)
    }
  }

  async function handleVerification(verificationId: string, userId: string, action: 'approve' | 'reject', reason?: string) {
    try {
      // Call the main app API to handle verification update
      // This will update Supabase, Clerk metadata, send notifications, and emails
      // Using proxy to avoid CORS: /api/main/* -> http://localhost:3000/api/*
      const response = await fetch('/api/main/verification/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          verificationId,
          action,
          rejectionReason: reason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update verification')
      }

      const result = await response.json()

      alert(`✅ Verification ${action}d successfully!${result.notificationsSent ? ' Notification and email sent to user.' : ''}${action === 'reject' && reason ? '\\nReason: ' + reason : ''}`)

      fetchVerifications() // Refresh filtered list
      fetchAllVerificationsForStats() // Refresh stats
      setShowRejectDialog(false)
      setRejectionReason('')
    } catch (error) {
      console.error('Error updating verification:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`❌ Error: ${errorMessage}`)
    }
  }

  function openRejectDialog(verificationId: string, userId: string) {
    setSelectedVerificationId(verificationId)
    setSelectedUserId(userId)
    setShowRejectDialog(true)
  }

  function handleRejectSubmit() {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    handleVerification(selectedVerificationId, selectedUserId, 'reject', rejectionReason)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">ID Verification Management</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <select
              title="Filter verifications by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="bg-gray-900">All Status</option>
              <option value="pending" className="bg-gray-900">Pending</option>
              <option value="approved" className="bg-gray-900">Approved</option>
              <option value="rejected" className="bg-gray-900">Rejected</option>
            </select>

            <button
              onClick={() => { fetchVerifications(); fetchAllVerificationsForStats(); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats - Using allVerifications for accurate counts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Total Submissions</p>
            <p className="text-2xl font-bold text-white">{allVerifications.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Pending Review</p>
            <p className="text-2xl font-bold text-white">
              {allVerifications.filter(v => v.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Approved</p>
            <p className="text-2xl font-bold text-white">
              {allVerifications.filter(v => v.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <p className="text-white/70 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-white">
              {allVerifications.filter(v => v.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Verifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 p-8 text-center text-white">Loading verifications...</div>
          ) : verifications.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-white/70">No verifications found</div>
          ) : (
            verifications.map((verification) => (
              <div
                key={verification.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {verification.id_type.toUpperCase()}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Mail className="w-3 h-3" />
                        {verification.user_email || 'No email'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/50 font-mono">
                        <span className="text-xs">ID:</span> {verification.user_id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(verification.status)}`}>
                    {verification.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 bg-black/20 p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-white/50 mb-1">ID Number</p>
                    <p className="text-sm text-white font-medium">{verification.id_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Phone</p>
                    <p className="text-sm text-white font-medium">{verification.user_phone || 'N/A'}</p>
                  </div>
                  {verification.user_location && (
                    <div className="col-span-2">
                      <p className="text-xs text-white/50 mb-1">Location</p>
                      <p className="text-sm text-white font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {verification.user_location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-white/70 mb-2">Documents</p>
                  <div className="grid grid-cols-3 gap-2">
                    {verification.front_image_url && (
                      <a href={verification.front_image_url} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="relative aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-all">
                          <img src={verification.front_image_url} alt="Front" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            Front
                          </div>
                        </div>
                      </a>
                    )}
                    {verification.back_image_url && (
                      <a href={verification.back_image_url} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="relative aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-all">
                          <img src={verification.back_image_url} alt="Back" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            Back
                          </div>
                        </div>
                      </a>
                    )}
                    {verification.selfie_url && (
                      <a href={verification.selfie_url} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="relative aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-all">
                          <img src={verification.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            Selfie
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                  <Clock className="w-4 h-4" />
                  Submitted {new Date(verification.submitted_at).toLocaleString()}
                </div>

                {verification.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerification(verification.id, verification.user_id, 'approve')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectDialog(verification.id, verification.user_id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {verification.status !== 'pending' && (
                  <div className="bg-white/5 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/70">
                        {verification.status === 'approved' ? 'Approved' : 'Rejected'} on
                      </span>
                      <span className="text-white">
                        {verification.verified_at ? new Date(verification.verified_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {verification.rejection_reason && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-red-300 text-xs font-semibold mb-1">Rejection Reason:</p>
                        <p className="text-white/80 italic">{verification.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Reject Verification</h3>
            <p className="text-white/70 mb-4">Please provide a reason for rejecting this verification:</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Document image is unclear, ID has expired, etc."
              className="w-full h-32 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
