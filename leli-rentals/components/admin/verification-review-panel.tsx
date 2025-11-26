'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Image as ImageIcon,
  AlertTriangle,
  ArrowLeft,
  Shield
} from 'lucide-react'

interface VerificationRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  documents: {
    idFront: string
    idBack: string
    selfie: string
  }
  rejectionReason?: string
}

export default function VerificationReviewPanel() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Mock data - replace with real API call
    const mockRequests: VerificationRequest[] = [
      {
        id: '1',
        userId: 'user_123',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        documents: {
          idFront: '/placeholder-id-front.jpg',
          idBack: '/placeholder-id-back.jpg',
          selfie: '/placeholder-selfie.jpg',
        },
      },
      // Add more mock requests as needed
    ]
    
    setRequests(mockRequests)
  }, [])

  const handleApprove = async (requestId: string) => {
    setIsProcessing(true)

    try {
      // In production, call API to approve verification
      await fetch('/api/admin/approve-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      toast({
        title: "Verification Approved",
        description: "User has been verified successfully.",
      })

      // Update local state
      setRequests(requests.filter(r => r.id !== requestId))
      setSelectedRequest(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve verification.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // In production, call API to reject verification
      await fetch('/api/admin/reject-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, reason: rejectionReason }),
      })

      toast({
        title: "Verification Rejected",
        description: "User has been notified.",
      })

      // Update local state
      setRequests(requests.filter(r => r.id !== requestId))
      setSelectedRequest(null)
      setRejectionReason('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject verification.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/admin'}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                ID Verification Reviews
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Review and approve user verification documents
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedRequest ? (
          // Detail View
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Verification Request Details</CardTitle>
                    <CardDescription>
                      Review documents and make a decision
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-semibold">{selectedRequest.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold">{selectedRequest.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                      <p className="font-semibold">
                        {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* ID Front */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">ID Front</h4>
                      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <ImageIcon className="h-32 w-full text-gray-400" />
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Document preview placeholder
                        </p>
                      </div>
                    </div>

                    {/* ID Back */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">ID Back</h4>
                      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <ImageIcon className="h-32 w-full text-gray-400" />
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Document preview placeholder
                        </p>
                      </div>
                    </div>

                    {/* Selfie */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selfie</h4>
                      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <ImageIcon className="h-32 w-full text-gray-400" />
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Document preview placeholder
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decision Section */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Make a Decision</h3>
                  
                  {/* Rejection Reason */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rejection Reason (optional if approving)
                    </label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason if rejecting (e.g., blurry photo, expired ID, etc.)"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Verification
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Verification
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // List View
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>
                {requests.length} request{requests.length !== 1 ? 's' : ''} waiting for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No pending verifications to review
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{request.userName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Submitted
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

