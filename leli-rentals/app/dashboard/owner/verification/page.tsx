'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  X,
  Image as ImageIcon,
  FileText,
  Clock
} from 'lucide-react'

export default function OwnerVerificationPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documents, setDocuments] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  })
  const [previews, setPreviews] = useState({
    idFront: '',
    idBack: '',
    selfie: '',
  })

  const handleFileChange = (type: 'idFront' | 'idBack' | 'selfie', file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setDocuments(prev => ({ ...prev, [type]: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = (type: 'idFront' | 'idBack' | 'selfie') => {
    setDocuments(prev => ({ ...prev, [type]: null }))
    setPreviews(prev => ({ ...prev, [type]: '' }))
  }

  const handleSubmit = async () => {
    // Validate all documents uploaded
    if (!documents.idFront || !documents.idBack || !documents.selfie) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents to continue.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // For now, send base64 previews to API which records a pending verification
      const response = await fetch('/api/verify-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentFront: previews.idFront,
          documentBack: previews.idBack,
          selfieWithDocument: previews.selfie,
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Verification submission failed')
      }
      
      toast({
        title: "Documents submitted!",
        description: "Your verification is pending admin review. We'll notify you once it's approved.",
      })
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard/owner')
      }, 2000)
      
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate days remaining
  const verificationDeadline = user?.publicMetadata?.verificationDeadline as string | undefined
  const daysRemaining = verificationDeadline 
    ? Math.ceil((new Date(verificationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Verify Your Identity
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us keep our platform safe by verifying your identity
          </p>
        </div>

        {/* Deadline Warning */}
        <Alert className={`mb-8 ${
          daysRemaining <= 2 
            ? 'border-red-200 bg-red-50 dark:bg-red-900/20' 
            : 'border-amber-200 bg-amber-50 dark:bg-amber-900/20'
        }`}>
          <Clock className={`h-5 w-5 ${daysRemaining <= 2 ? 'text-red-600' : 'text-amber-600'}`} />
          <AlertTitle className={daysRemaining <= 2 ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'}>
            {daysRemaining} Day{daysRemaining !== 1 ? 's' : ''} Remaining
          </AlertTitle>
          <AlertDescription className={daysRemaining <= 2 ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}>
            {daysRemaining <= 2 
              ? 'Your account will be suspended if not verified soon. Please upload your documents now.'
              : `You must complete verification within ${daysRemaining} days to avoid account suspension.`
            }
          </AlertDescription>
        </Alert>

        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What You'll Need</CardTitle>
            <CardDescription>
              Prepare these documents before you begin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Government ID (Front)</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Passport, National ID, or Driver's License
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Government ID (Back)</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Back side of your ID document
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ImageIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Selfie</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    A clear photo of yourself
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Forms */}
        <div className="space-y-6">
          {/* ID Front */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Government ID (Front)</CardTitle>
              <CardDescription>
                Upload a clear photo of the front of your government-issued ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previews.idFront ? (
                <div className="relative">
                  <img 
                    src={previews.idFront} 
                    alt="ID Front" 
                    className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFile('idFront')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Label
                  htmlFor="idFront"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    id="idFront"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload government ID front"
                    onChange={(e) => handleFileChange('idFront', e.target.files?.[0] || null)}
                  />
                </Label>
              )}
            </CardContent>
          </Card>

          {/* ID Back */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Government ID (Back)</CardTitle>
              <CardDescription>
                Upload a clear photo of the back of your government-issued ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previews.idBack ? (
                <div className="relative">
                  <img 
                    src={previews.idBack} 
                    alt="ID Back" 
                    className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFile('idBack')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Label
                  htmlFor="idBack"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    id="idBack"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload government ID back"
                    onChange={(e) => handleFileChange('idBack', e.target.files?.[0] || null)}
                  />
                </Label>
              )}
            </CardContent>
          </Card>

          {/* Selfie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Selfie Verification</CardTitle>
              <CardDescription>
                Take a clear selfie showing your face
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previews.selfie ? (
                <div className="relative">
                  <img 
                    src={previews.selfie} 
                    alt="Selfie" 
                    className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFile('selfie')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Label
                  htmlFor="selfie"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    id="selfie"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload selfie photo"
                    onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                  />
                </Label>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !documents.idFront || !documents.idBack || !documents.selfie}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading Documents...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your Data is Secure
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All documents are encrypted and stored securely. We use bank-level security to protect your personal information.
                  Your documents will only be used for verification purposes and will not be shared with third parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

