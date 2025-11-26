"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import InternationalPhoneInput from "@/components/international-phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User, Car, Home, Wrench, Camera, Laptop, Shirt, Music,
  MapPin, Phone, Mail, Calendar, DollarSign, Shield, CheckCircle,
  ArrowRight, ArrowLeft, Star, Users, TrendingUp, Award,
  Building2, CreditCard, FileText, Camera as CameraIcon
} from "lucide-react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/lib/notification-context"
import { onboardingService } from "@/lib/onboarding-service"

// User types
const userTypes = [
  {
    id: "renter",
    title: "I want to rent items",
    description: "Find and rent items from other users",
    icon: User,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    features: [
      "Browse thousands of items",
      "Secure payment processing",
      "24/7 customer support",
      "Insurance protection"
    ],
    popular: true
  },
  {
    id: "owner",
    title: "I want to list items",
    description: "Earn money by renting out your items",
    icon: Building2,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    features: [
      "Earn passive income",
      "Flexible listing management",
      "Secure payment collection",
      "Marketing support"
    ],
    popular: true
  },
  {
    id: "both",
    title: "I want to do both",
    description: "Rent items and list your own",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    features: [
      "Full platform access",
      "Maximum earning potential",
      "Complete flexibility",
      "Premium features"
    ],
    popular: false
  }
]

// Interest categories
const interestCategories = [
  { id: "vehicles", name: "Vehicles", icon: Car },
  { id: "homes", name: "Homes & Apartments", icon: Home },
  { id: "equipment", name: "Equipment & Tools", icon: Wrench },
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "fashion", name: "Fashion", icon: Shirt },
  { id: "entertainment", name: "Entertainment", icon: Music },
  { id: "photography", name: "Photography", icon: Camera },
]

// Location options
const locations = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale",
  "Garissa", "Kakamega", "Kisii", "Meru", "Nyeri", "Machakos", "Kericho", "Other"
]

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [userType, setUserType] = useState<string>("")
  const [interests, setInterests] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [verificationMethod, setVerificationMethod] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      loadExistingData()
    }
  }, [user, router])

  const loadExistingData = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/onboarding?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        
        // Restore form data
        if (data.userType) setUserType(data.userType)
        if (data.interests) setInterests(data.interests)
        if (data.location) setLocation(data.location)
        if (data.phone) setPhone(data.phone)
        if (data.bio) setBio(data.bio)
        if (data.verificationMethod) setVerificationMethod(data.verificationMethod)
        if (data.agreedToTerms) setAgreedToTerms(data.agreedToTerms)

        // If onboarding is already completed, redirect to profile
        if (data.onboardingCompleted) {
          router.push('/profile')
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error)
      // Don't show error to user, just continue with empty form
    }
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // Save current step data to database
      await saveStepData()
      setCurrentStep(currentStep + 1)
    }
  }

  const saveStepData = async () => {
    if (!user) return

    try {
      const stepData: any = {
        userId: user.id,
        step: currentStep
      }

      switch (currentStep) {
        case 1:
          stepData.userType = userType
          break
        case 2:
          stepData.interests = interests
          break
        case 3:
          stepData.location = location
          stepData.phone = phone
          stepData.bio = bio
          break
        case 4:
          stepData.verificationMethod = verificationMethod
          break
        case 5:
          stepData.agreedToTerms = agreedToTerms
          break
      }

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData),
      })

      if (!response.ok) {
        throw new Error('Failed to save step data')
      }
    } catch (error) {
      console.error('Error saving step data:', error)
      // Don't show error to user for auto-save, just log it
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInterestToggle = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
  }

  const handleComplete = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete onboarding.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Save final onboarding data
      const finalData = {
        userId: user.id,
        userType,
        interests,
        location,
        phone,
        bio,
        verificationMethod,
        agreedToTerms,
        onboardingCompleted: true
      }

      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete onboarding')
      }

      // Save user preferences
      const preferencesData = {
        userId: user.id,
        preferredCategories: interests,
        notificationSettings: {
          email: true,
          sms: true,
          push: true,
          marketing: false
        },
        privacySettings: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false
        }
      }

      await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesData),
      })

      // Add a welcome notification
      addNotification({
        userId: user.id,
        type: 'system',
        title: '🎉 Welcome to Leli Rentals!',
        message: 'Your profile is all set up. Start exploring listings or create your own!',
        link: '/profile'
      })

      toast({
        title: "Welcome to Leli Rentals!",
        description: "Your profile has been set up successfully.",
      })
      
      router.push('/profile')
    } catch (error: any) {
      console.error('Error completing onboarding:', error)
      toast({
        title: "Setup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return userType !== ""
      case 2:
        return interests.length > 0
      case 3:
        return location !== "" && phone !== ""
      case 4:
        return verificationMethod !== ""
      case 5:
        return agreedToTerms
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                How do you want to use Leli Rentals?
              </h2>
              <p className="text-lg text-gray-600">
                Choose your primary use case to personalize your experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {userTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                      userType === type.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setUserType(type.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${type.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className={`h-8 w-8 ${type.textColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                      <div className="space-y-2">
                        {type.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      {type.popular && (
                        <Badge className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          Most Popular
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                What are you interested in?
              </h2>
              <p className="text-lg text-gray-600">
                Select categories that interest you (you can change this later)
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {interestCategories.map((category) => {
                const IconComponent = category.icon
                const isSelected = interests.includes(category.id)
                return (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInterestToggle(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <IconComponent className={`h-8 w-8 mx-auto mb-2 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isSelected ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {category.name}
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Tell us about yourself
              </h2>
              <p className="text-lg text-gray-600">
                Help us personalize your experience
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <InternationalPhoneInput
                  value={phone}
                  onChange={setPhone}
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Verify your identity
              </h2>
              <p className="text-lg text-gray-600">
                Choose your preferred verification method
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <Card 
                className={`cursor-pointer border-2 transition-all duration-300 ${
                  verificationMethod === "phone" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setVerificationMethod("phone")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">Phone Verification</h3>
                      <p className="text-sm text-gray-600">We'll send you a verification code via SMS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer border-2 transition-all duration-300 ${
                  verificationMethod === "email" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setVerificationMethod("email")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Mail className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">Email Verification</h3>
                      <p className="text-sm text-gray-600">We'll send you a verification link via email</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer border-2 transition-all duration-300 ${
                  verificationMethod === "id" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setVerificationMethod("id")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">ID Verification</h3>
                      <p className="text-sm text-gray-600">Upload a photo of your government-issued ID</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Almost done!
              </h2>
              <p className="text-lg text-gray-600">
                Review your information and agree to our terms
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Your Profile Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Type:</span>
                      <span className="font-medium">{userTypes.find(t => t.id === userType)?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interests:</span>
                      <span className="font-medium">{interests.length} categories</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification:</span>
                      <span className="font-medium capitalize">{verificationMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!canProceed() || !isLoaded}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {!isLoaded ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <Award className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}




