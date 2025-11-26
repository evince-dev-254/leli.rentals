"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { PendingVerificationView } from "@/components/pending-verification-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  Upload,
  Camera,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Save,
  Eye,
  X
} from "lucide-react"
import Link from "next/link"

export default function VerificationPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // All state declarations MUST come before any conditional returns
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    phoneNumber: "",
    emergencyContact: "",
    emergencyPhone: "",

    // Document uploads
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfieWithDocument: null as File | null,

    // Additional info
    additionalInfo: "",
    agreeToTerms: false
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in")
    }
  }, [isLoaded, user, router])

  // Redirect to dashboard or intended destination if already verified or verification pending
  useEffect(() => {
    if (isLoaded && user) {
      const verificationStatus = (user.publicMetadata?.verificationStatus || user.unsafeMetadata?.verificationStatus) as string
      const accountType = (user.publicMetadata?.accountType as string) ||
        (user.unsafeMetadata?.accountType as string)

      if (verificationStatus === 'approved') {
        // After verification approval, owners must choose subscription plan
        if (accountType === 'owner') {
          const hasSubscription = user.unsafeMetadata?.subscriptionStatus as string
          if (!hasSubscription || hasSubscription === 'none') {
            router.push('/profile/billing')
            return
          }
        }
        // Check if there's a redirect parameter in the URL
        const searchParams = new URLSearchParams(window.location.search)
        const redirectTo = searchParams.get('redirect')
        router.push(redirectTo || '/dashboard/owner')
      } else if (verificationStatus === 'pending') {
        // If pending, allow access but show pending status
        // Don't redirect - let them see the pending message
        return
      }
    }
  }, [isLoaded, user, router])

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const documentTypes = [
    "National ID",
    "Passport",
    "Driver's License"
  ]

  const nationalities = [
    "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguans", "Argentinean", "Armenian", "Australian",
    "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Barbudans", "Batswana", "Belarusian", "Belgian",
    "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe",
    "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese",
    "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djibouti",
    "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian",
    "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek",
    "Grenadian", "Guatemalan", "Guinea-Bissauan", "Guinean", "Guyanese", "Haitian", "Herzegovinian", "Honduran", "Hungarian", "Icelander",
    "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese",
    "Jordanian", "Kazakhstani", "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian",
    "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivan", "Malian",
    "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan",
    "Mosotho", "Motswana", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien",
    "North Korean", "Northern Irish", "Norwegian", "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian",
    "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "San Marinese",
    "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian",
    "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish",
    "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian or Tobagonian", "Tunisian",
    "Turkish", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh", "Yemenite",
    "Zambian", "Zimbabwean"
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  // Get image preview URL
  const getImagePreview = (file: File | null) => {
    if (!file) return null
    return URL.createObjectURL(file)
  }

  // Open camera for selfie
  const openCamera = async () => {
    // Check if browser supports camera access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera access is not supported in your browser. Please use "Upload Photo" instead.')
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      setStream(mediaStream)
      setShowCamera(true)

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please check permissions or use "Upload Photo" instead.')
    }
  }

  // Close camera
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
            handleFileUpload('selfieWithDocument', file)
            closeCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      if (!user) return

      // 1. Upload files to Supabase Storage
      const uploadFile = async (file: File, folder: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('tags', 'verification')
        formData.append('useSupabase', 'true') // Use Supabase Storage

        const response = await fetch('/api/upload', {
          method: 'PUT',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || errorData.error || 'Upload failed')
        }
        const data = await response.json()
        // Handle both Cloudinary (secure_url) and Supabase (url) response formats
        return data.upload.url || data.upload.secure_url
      }

      let documentFrontUrl = ''
      let documentBackUrl = ''
      let selfieUrl = ''

      // Upload Front
      if (formData.documentFront) {
        documentFrontUrl = await uploadFile(formData.documentFront, 'verification/front')
      }

      // Upload Back
      if (formData.documentBack) {
        documentBackUrl = await uploadFile(formData.documentBack, 'verification/back')
      }

      // Upload Selfie
      if (formData.selfieWithDocument) {
        selfieUrl = await uploadFile(formData.selfieWithDocument, 'verification/selfie')
      }

      // 2. Submit data to API
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          documentFrontUrl,
          documentBackUrl,
          selfieUrl
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Submission API Error:', errorData)
        throw new Error(errorData.details || 'Submission failed')
      }

      // 3. Update Clerk metadata - Handled by API now
      // await user.update({ ... })

      // 4. Send email (optional, keep existing logic)
      fetch('/api/emails/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.emailAddresses[0]?.emailAddress,
          userName: user.firstName || 'there',
          status: 'submitted'
        })
      }).catch(err => console.error('Email error:', err))

      toast({
        title: "✅ Documents Submitted Successfully!",
        description: "You have 5 days of free access to list and manage items while we verify your account.",
        duration: 5000,
      })

      // 5. Redirect
      const accountType = (user.unsafeMetadata?.accountType as string) ||
        (user.publicMetadata?.accountType as string) ||
        'owner' // Default to owner if not set, as they are the ones verifying

      if (accountType === 'owner') {
        setTimeout(() => {
          router.push('/profile/billing')
        }, 1000)
      } else {
        setTimeout(() => {
          router.push('/listings')
        }, 1000)
      }

    } catch (error) {
      console.error('Error submitting verification:', error)
      toast({
        title: "Error",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation for each step
  const isStep1Valid = formData.documentType && formData.documentNumber && formData.fullName &&
    formData.dateOfBirth && formData.nationality && formData.address && formData.phoneNumber

  const isStep2Valid = formData.documentFront && formData.documentBack && formData.selfieWithDocument

  const isStep3Valid = formData.agreeToTerms

  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid

  const steps = [
    { id: 1, title: "Personal Info", description: "Basic information" },
    { id: 2, title: "Document Upload", description: "ID verification" },
    { id: 3, title: "Review", description: "Confirm details" }
  ]

  // Check if verification is pending
  const verificationStatus = user?.unsafeMetadata?.verificationStatus as string
  const isVerificationPending = verificationStatus === 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Identity Verification</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Verify your identity to access owner features and list items for rent
            </p>
          </div>
        </div>

        {/* Show pending view if verification is pending, otherwise show the form */}
        {isVerificationPending ? (
          <PendingVerificationView submittedAt={user?.unsafeMetadata?.verificationSubmittedAt as string} />
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.id ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {step.id}
                    </div>
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-900">{step.title}</span>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-200 mx-4" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Provide your basic details for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type *</Label>
                      <Select value={formData.documentType} onValueChange={(value) => handleInputChange("documentType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Document Number *</Label>
                      <Input
                        id="documentNumber"
                        placeholder="Enter document number"
                        value={formData.documentNumber}
                        onChange={(e) => handleInputChange("documentNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (as on document) *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {nationalities.map((nationality) => (
                            <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Current Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your current address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+254700000000"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="Emergency contact name"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      placeholder="+254700000000"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Document Upload */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>Upload clear photos of your identity document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Front */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {formData.documentFront ? (
                          <div className="space-y-4">
                            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={getImagePreview(formData.documentFront) || ''}
                                alt="Document Front"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {formData.documentFront.name}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileUpload("documentFront", null)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Front</h3>
                            <p className="text-gray-600 mb-4">Upload the front side of your document</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload("documentFront", e.target.files?.[0] || null)}
                              className="hidden"
                              id="document-front"
                            />
                            <Button asChild>
                              <label htmlFor="document-front" className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Front
                              </label>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Document Back */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {formData.documentBack ? (
                          <div className="space-y-4">
                            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={getImagePreview(formData.documentBack) || ''}
                                alt="Document Back"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {formData.documentBack.name}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileUpload("documentBack", null)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Back</h3>
                            <p className="text-gray-600 mb-4">Upload the back side of your document</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload("documentBack", e.target.files?.[0] || null)}
                              className="hidden"
                              id="document-back"
                            />
                            <Button asChild>
                              <label htmlFor="document-back" className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Back
                              </label>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selfie with Document */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.selfieWithDocument ? (
                        <div className="space-y-4">
                          <div className="relative w-full max-w-md mx-auto h-64 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={getImagePreview(formData.selfieWithDocument) || ''}
                              alt="Selfie with Document"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            {formData.selfieWithDocument.name}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileUpload("selfieWithDocument", null)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selfie with Document</h3>
                          <p className="text-gray-600 mb-4">Take a selfie holding your document next to your face</p>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button onClick={openCamera}>
                              <Camera className="h-4 w-4 mr-2" />
                              Take Selfie
                            </Button>
                            <Button variant="outline" asChild>
                              <label htmlFor="selfie-document-upload" className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </label>
                            </Button>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("selfieWithDocument", e.target.files?.[0] || null)}
                            className="hidden"
                            id="selfie-document-upload"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Upload Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Ensure all text is clearly readable</li>
                          <li>• Avoid glare, shadows, or blur</li>
                          <li>• Include all corners of the document</li>
                          <li>• Use good lighting for photos</li>
                          <li>• File size should be under 10MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Information</CardTitle>
                  <CardDescription>Please review all details before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Document Type:</strong> {formData.documentType || "Not provided"}</p>
                        <p><strong>Document Number:</strong> {formData.documentNumber || "Not provided"}</p>
                        <p><strong>Full Name:</strong> {formData.fullName || "Not provided"}</p>
                        <p><strong>Date of Birth:</strong> {formData.dateOfBirth || "Not provided"}</p>
                        <p><strong>Nationality:</strong> {formData.nationality || "Not provided"}</p>
                        <p><strong>Address:</strong> {formData.address || "Not provided"}</p>
                        <p><strong>Phone:</strong> {formData.phoneNumber || "Not provided"}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Uploaded Documents</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Document Front:</strong> {formData.documentFront?.name || "Not uploaded"}</p>
                        <p><strong>Document Back:</strong> {formData.documentBack?.name || "Not uploaded"}</p>
                        <p><strong>Selfie with Document:</strong> {formData.selfieWithDocument?.name || "Not uploaded"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                          I agree to the verification process and confirm that all information provided is accurate.
                          I understand that providing false information may result in account suspension.
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Verification Process</h4>
                        <p className="text-sm text-yellow-800">
                          Your documents will be reviewed within 1-3 business days. You'll receive an email notification
                          once the verification is complete. <strong>Good news!</strong> You have 5 days of free trial access
                          to list and manage items while we review your verification. Make the most of it!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1)
                  } else {
                    // Get redirect parameter if it exists
                    const searchParams = new URLSearchParams(window.location.search)
                    const redirectTo = searchParams.get('redirect')
                    router.push(redirectTo || "/dashboard")
                  }
                }}
              >
                {currentStep === 1 ? "Cancel" : "Previous"}
              </Button>

              <div className="flex gap-4">
                {currentStep < 3 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 1 && !isStep1Valid) ||
                      (currentStep === 2 && !isStep2Valid)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Submit Verification
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Take Selfie</h3>
              <Button variant="ghost" size="sm" onClick={closeCamera}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📸 Hold your ID document next to your face and make sure both are clearly visible
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={closeCamera}>
                Cancel
              </Button>
            </div>

            {/* Hidden canvas for capturing photo */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  )
}



