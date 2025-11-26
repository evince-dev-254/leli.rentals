"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, Upload, Camera, FileText, Clock } from "lucide-react"
import Link from "next/link"

interface VerificationBannerProps {
  accountType: string
  verificationStatus: {
    isVerified: boolean
    documentsSubmitted: boolean
    pendingReview: boolean
    rejectionReason?: string
    submittedAt?: string
  }
  verificationDeadline?: string
}

export function VerificationBanner({ accountType, verificationStatus, verificationDeadline }: VerificationBannerProps) {
  // Only show for owner account types
  if (accountType !== "owner") {
    return null
  }

  // Don't show banner if user is already verified
  if (verificationStatus.isVerified) {
    return null
  }

  // Calculate days remaining until deadline
  let daysRemaining: number | null = null
  if (verificationDeadline) {
    const deadline = new Date(verificationDeadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    daysRemaining = diffDays > 0 ? diffDays : 0
  }

  const getStatusColor = () => {
    if (verificationStatus.isVerified) return "bg-green-100 text-green-800"
    if (verificationStatus.pendingReview) return "bg-yellow-100 text-yellow-800"
    if (verificationStatus.rejectionReason) return "bg-red-100 text-red-800"
    return "bg-orange-100 text-orange-800"
  }

  const getStatusText = () => {
    if (verificationStatus.isVerified) return "Verified"
    if (verificationStatus.pendingReview) return "Under Review"
    if (verificationStatus.rejectionReason) return "Rejected"
    return "Required"
  }

  const getStatusIcon = () => {
    if (verificationStatus.isVerified) return CheckCircle
    if (verificationStatus.pendingReview) return Clock
    if (verificationStatus.rejectionReason) return AlertTriangle
    return Shield
  }

  const StatusIcon = getStatusIcon()

  return (
    <Card className="mb-6 border-l-4 border-l-orange-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <StatusIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {verificationStatus.pendingReview ? "Verification Under Review" : "Identity Verification Required"}
              </h3>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-4">
              {verificationStatus.pendingReview 
                ? "Your verification documents have been submitted and are currently being reviewed. This usually takes 1-2 business days."
                : "As an owner account, you must verify your identity with a valid ID or passport to list items for rent. This helps ensure the safety and trust of our rental community."
              }
            </p>

            {/* 5-Day Deadline Warning */}
            {!verificationStatus.isVerified && !verificationStatus.pendingReview && daysRemaining !== null && daysRemaining <= 5 && (
              <div className={`mb-4 p-4 rounded-lg border-2 ${
                daysRemaining <= 1 
                  ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' 
                  : daysRemaining <= 2
                  ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700'
                  : 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                    daysRemaining <= 1 
                      ? 'text-red-600' 
                      : daysRemaining <= 2
                      ? 'text-orange-600'
                      : 'text-amber-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg mb-1 ${
                      daysRemaining <= 1 
                        ? 'text-red-900 dark:text-red-100' 
                        : daysRemaining <= 2
                        ? 'text-orange-900 dark:text-orange-100'
                        : 'text-amber-900 dark:text-amber-100'
                    }`}>
                      {daysRemaining === 0 
                        ? '⚠️ Account Suspension Imminent!' 
                        : daysRemaining === 1
                        ? '⚠️ Final Day to Verify!'
                        : `${daysRemaining} Days Remaining to Verify`
                      }
                    </h4>
                    <p className={`text-sm mb-2 ${
                      daysRemaining <= 1 
                        ? 'text-red-800 dark:text-red-200' 
                        : daysRemaining <= 2
                        ? 'text-orange-800 dark:text-orange-200'
                        : 'text-amber-800 dark:text-amber-200'
                    }`}>
                      {daysRemaining === 0 
                        ? 'Your verification deadline has passed. Your account will be suspended if verification is not completed immediately.'
                        : daysRemaining === 1
                        ? 'You must verify your account today or your account will be suspended tomorrow.'
                        : `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} to verify your account. Your account will be suspended if verification is not completed within this time.`
                      }
                    </p>
                    <p className={`text-xs font-medium ${
                      daysRemaining <= 1 
                        ? 'text-red-700 dark:text-red-300' 
                        : daysRemaining <= 2
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      Deadline: {verificationDeadline ? new Date(verificationDeadline).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '5 days from account creation'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Verification Rejected</h4>
                    <p className="text-sm text-red-800">{verificationStatus.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus.pendingReview && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Documents Under Review</h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      We're currently reviewing your verification documents. You'll receive an email notification once the review is complete.
                    </p>
                    <p className="text-xs text-yellow-700">
                      Submitted: {new Date(verificationStatus.submittedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!verificationStatus.isVerified && !verificationStatus.pendingReview && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Required Documents:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Valid National ID or Passport</li>
                      <li>• Clear photo of document (front and back)</li>
                      <li>• Selfie holding the document</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Document Guidelines:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Document must be clearly readable</li>
                      <li>• All corners visible in photo</li>
                      <li>• No blur or glare on document</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-orange-600 hover:bg-orange-700">
                    <Link href="/verification">
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Documents
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/help#verification">
                      <FileText className="h-4 w-4 mr-2" />
                      Verification Help
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus.isVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Verification Complete</h4>
                    <p className="text-sm text-green-800">
                      Your identity has been verified. You can now list items for rent and access all owner features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
