"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { AlertCircle, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function VerificationNotification() {
    const { user } = useUser()
    const { toast } = useToast()
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        if (!user) return

        const verificationStatus = (user.unsafeMetadata?.verificationStatus ||
            user.publicMetadata?.verificationStatus) as string
        const rejectionReason = (user.unsafeMetadata?.verificationRejectionReason ||
            user.publicMetadata?.verificationRejectionReason) as string

        // Check if this notification was already dismissed
        const dismissedKey = `verification-notification-${verificationStatus}-dismissed`
        if (typeof window !== 'undefined' && localStorage.getItem(dismissedKey) === 'true') {
            setDismissed(true)
            return
        }

        // Auto-show toast notifications based on status
        if (verificationStatus === 'approved' && !dismissed) {
            toast({
                title: "✅ Verification Approved!",
                description: "Your identity has been verified. You now have full access to all owner features.",
                duration: 5000,
            })
            // Auto-dismiss approved notifications after showing
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(dismissedKey, 'true')
                }
                setDismissed(true)
            }, 5000)
        }
    }, [user, toast, dismissed])

    if (!user || dismissed) return null

    const verificationStatus = (user.unsafeMetadata?.verificationStatus ||
        user.publicMetadata?.verificationStatus) as string
    const rejectionReason = (user.unsafeMetadata?.verificationRejectionReason ||
        user.publicMetadata?.verificationRejectionReason) as string
    const submittedAt = (user.unsafeMetadata?.verificationSubmittedAt ||
        user.publicMetadata?.verificationSubmittedAt) as string

    const handleDismiss = () => {
        const dismissedKey = `verification-notification-${verificationStatus}-dismissed`
        if (typeof window !== 'undefined') {
            localStorage.setItem(dismissedKey, 'true')
        }
        setDismissed(true)
    }

    // Don't show notification if approved (already shown as toast)
    if (verificationStatus === 'approved') {
        return null
    }

    // Show persistent notification for pending status
    if (verificationStatus === 'pending') {
        const daysSinceSubmission = submittedAt
            ? Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0

        return (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 relative">
                <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">
                            Verification Pending
                        </h4>
                        <p className="text-sm text-blue-800">
                            Your identity documents are being reviewed. This usually takes 1-3 business days.
                            {submittedAt && ` Submitted ${daysSinceSubmission} day${daysSinceSubmission !== 1 ? 's' : ''} ago.`}
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                            💡 You have 5 days of free trial access to list and manage items while we verify your account.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-100 flex-shrink-0"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    // Show persistent notification for rejected status with reason
    if (verificationStatus === 'rejected') {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 relative">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-1">
                            Verification Denied
                        </h4>
                        <p className="text-sm text-red-800 mb-2">
                            Unfortunately, your verification was not approved.
                        </p>
                        {rejectionReason && (
                            <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-3">
                                <p className="text-xs font-semibold text-red-900 mb-1">Reason:</p>
                                <p className="text-sm text-red-800">{rejectionReason}</p>
                            </div>
                        )}
                        <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white mt-2"
                            onClick={() => window.location.href = '/verification'}
                        >
                            Resubmit Verification
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-100 flex-shrink-0"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
