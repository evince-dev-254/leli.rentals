'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Building2, 
  CreditCard, 
  MapPin, 
  Shield, 
  Check,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Upload
} from 'lucide-react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function OwnerSetupPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Business Information
    businessName: '',
    businessType: 'individual',
    taxId: '',
    phoneNumber: '',
    
    // Step 2: Payout Details
    bankAccountNumber: '',
    bankName: '',
    accountHolderName: '',
    routingCode: '',
    currency: 'USD',
    
    // Step 3: Location & Preferences
    primaryLocation: '',
    serviceAreas: [] as string[],
    propertyTypes: [] as string[],
    languages: [] as string[],
  })

  useEffect(() => {
    if (isLoaded && user) {
      // Pre-fill with user data
      setFormData(prev => ({
        ...prev,
        businessName: user.fullName || '',
        accountHolderName: user.fullName || '',
        phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || '',
      }))
    }
  }, [user, isLoaded])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Update Clerk user metadata with setup info
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          setupCompleted: true,
          businessInfo: {
            name: formData.businessName,
            type: formData.businessType,
            taxId: formData.taxId,
            phone: formData.phoneNumber,
          },
          payoutInfo: {
            bankAccount: formData.bankAccountNumber,
            bankName: formData.bankName,
            accountHolder: formData.accountHolderName,
            routing: formData.routingCode,
            currency: formData.currency,
          },
          locationInfo: {
            primary: formData.primaryLocation,
            serviceAreas: formData.serviceAreas,
            propertyTypes: formData.propertyTypes,
            languages: formData.languages,
          },
          needsVerification: true,
        }
      })
      
      toast({
        title: "Setup Complete!",
        description: "Your owner account has been configured successfully.",
      })
      
      // Redirect to billing packages selection
      router.push('/dashboard/owner/billing')
      
    } catch (error) {
      console.error('Error saving setup:', error)
      toast({
        title: "Error",
        description: "Failed to save setup information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Business Info', icon: Building2 },
    { number: 2, title: 'Payout Details', icon: CreditCard },
    { number: 3, title: 'Location & Preferences', icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Complete Your Owner Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Just a few more steps to start earning from your rentals
          </p>
        </div>

        {/* Verification Warning */}
        <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">Verification Required</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You must verify your account with ID or passport within <strong>5 days</strong> to avoid suspension.
            We'll guide you through the verification process after setup.
          </AlertDescription>
        </Alert>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${
                    currentStep >= step.number 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 ${
                    currentStep > step.number 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep} of 3</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your business"}
              {currentStep === 2 && "Set up your payment information"}
              {currentStep === 3 && "Configure your service preferences"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business/Individual Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter your business or full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID or National ID Number *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="Enter your tax or national ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={formData.phoneNumber}
                    onChange={(value) => handleInputChange('phoneNumber', value || '')}
                    className="phone-input"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Payout Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    placeholder="Full name on bank account"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Name of your bank"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    placeholder="Your bank account number"
                    type="text"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="routingCode">Routing/SWIFT Code *</Label>
                  <Input
                    id="routingCode"
                    value={formData.routingCode}
                    onChange={(e) => handleInputChange('routingCode', e.target.value)}
                    placeholder="Bank routing or SWIFT code"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Preferred Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                    Your payment information is encrypted and secure. We use industry-standard security measures.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Location & Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryLocation">Primary Property Location *</Label>
                  <Input
                    id="primaryLocation"
                    value={formData.primaryLocation}
                    onChange={(e) => handleInputChange('primaryLocation', e.target.value)}
                    placeholder="City, State/Region, Country"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">We'll add Google Maps integration for precise location selection</p>
                </div>

                <div>
                  <Label htmlFor="propertyTypes">Property Types You Offer</Label>
                  <Textarea
                    id="propertyTypes"
                    value={formData.propertyTypes.join(', ')}
                    onChange={(e) => handleInputChange('propertyTypes', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="e.g., Apartment, House, Villa, Studio"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="serviceAreas">Service Areas (Optional)</Label>
                  <Textarea
                    id="serviceAreas"
                    value={formData.serviceAreas.join(', ')}
                    onChange={(e) => handleInputChange('serviceAreas', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Additional cities or regions you serve"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="languages">Languages Spoken</Label>
                  <Textarea
                    id="languages"
                    value={formData.languages.join(', ')}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="e.g., English, Spanish, French"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Preview */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              What's Next?
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>✓ Complete this setup form</p>
              <p>✓ Choose your billing package</p>
              <p>✓ Verify your identity (ID/Passport)</p>
              <p>✓ Create your first listing</p>
              <p>✓ Start earning!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

