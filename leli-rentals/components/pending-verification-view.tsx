'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

interface PendingVerificationViewProps {
    submittedAt?: string
}

export function PendingVerificationView({ submittedAt }: PendingVerificationViewProps) {
    return (
        <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="h-16 w-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-2xl font-bold text-gray-900">Verification Under Review</h2>
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>

                        <p className="text-gray-700 text-lg mb-6">
                            Thank you for submitting your verification documents! Our team is currently reviewing your submission. This usually takes 1-2 business days.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
                            <div className="flex items-start gap-3">
                                <Clock className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-yellow-900 mb-2">What happens next?</h4>
                                    <ul className="text-sm text-yellow-800 space-y-2">
                                        <li>✓ Your documents are being securely reviewed by our verification team</li>
                                        <li>✓ You'll receive an email notification once the review is complete</li>
                                        <li>✓ If approved, you can immediately start listing items for rent</li>
                                        <li>✓ If additional information is needed, we'll contact you via email</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-2">While you wait...</h4>
                                    <p className="text-sm text-blue-800 mb-3">
                                        You can still use most features of the platform:
                                    </p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Browse available items for rent</li>
                                        <li>• Save items to your favorites</li>
                                        <li>• Book items from other owners</li>
                                        <li>• Update your profile information</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-6">
                            <p className="mb-2">
                                <strong>Submitted:</strong> {submittedAt ? new Date(submittedAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'Recently'}
                            </p>
                            <p>
                                <strong>Expected review time:</strong> 1-2 business days
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild>
                                <Link href="/dashboard">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/help#verification">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Verification FAQ
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
