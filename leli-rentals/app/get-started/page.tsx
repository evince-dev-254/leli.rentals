"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useUser } from '@clerk/nextjs'
import { useAccountTypeRedirect, getUserAccountType, setUserAccountType } from "@/lib/account-type-utils"
import { automaticNotifications } from "@/lib/automatic-notifications"
import {
  User,
  Building2,
  Car,
  Home,
  Wrench,
  Music,
  Shirt,
  Laptop,
  Dumbbell,
  Camera,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Heart,
  MessageCircle,
  Calendar,
  DollarSign
} from "lucide-react"

export default function GetStartedPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const { selectAccountType } = useAccountTypeRedirect()
  const [selectedAccountType, setSelectedAccountType] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAccountType, setIsCheckingAccountType] = useState(true)
  const [showTrialModal, setShowTrialModal] = useState(false)

  // Send welcome email and notification on first visit
  useEffect(() => {
    if (user) {
      const welcomeSent = localStorage.getItem(`welcome_sent_${user.id}`)

      if (!welcomeSent) {
        const userName = user.fullName || user.firstName || 'there'

        // Send welcome email
        fetch('/api/emails/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.emailAddresses[0]?.emailAddress,
            userName: user.firstName || 'there'
          })
        }).then(() => {
          console.log('✅ Welcome email sent')
        }).catch(err => console.error('Email error:', err))

        // Send welcome notification
        automaticNotifications.sendWelcomeNotification(user.id, userName)
          .then(() => console.log('✅ Welcome notification sent'))
          .catch(err => console.error('Notification error:', err))

        localStorage.setItem(`welcome_sent_${user.id}`, 'true')
      }
    }
  }, [user])

  // Check if user already has an account type and redirect them
  useEffect(() => {
    if (user && isLoaded) {
      // ONLY check Clerk metadata - ignore localStorage for new users
      // localStorage can have stale values from previous sessions
      const clerkAccountType = (user.publicMetadata?.accountType as string) ||
        (user.unsafeMetadata?.accountType as string)

      console.log('Checking account type for user:', user.id, 'Clerk account type:', clerkAccountType)

      // ONLY redirect if Clerk metadata explicitly has account type set
      // This ensures new users always see the selection page
      if (clerkAccountType === 'renter' || clerkAccountType === 'owner') {
        // User already has an account type in Clerk, redirect them to their dashboard
        console.log('User has account type in Clerk, redirecting to:', clerkAccountType)
        if (clerkAccountType === 'owner') {
          router.push('/dashboard/owner')
        } else {
          router.push('/listings')
        }
      } else {
        console.log('User needs to select account type - clearing any stale localStorage values')
        // Clear any localStorage account type values for new users
        // This ensures fresh start for new sign-ups
        localStorage.removeItem('userAccountType')
        localStorage.removeItem('accountTypeSkipped')
        setIsCheckingAccountType(false)
      }
    } else if (isLoaded && !user) {
      // Redirect to sign-in if not authenticated
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const accountTypes = [
    {
      id: "renter",
      title: "I'm Looking to Rent",
      subtitle: "Find amazing rentals for your needs",
      icon: User,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-700",
      features: [
        "Browse thousands of listings",
        "14-day free trial included",
        "20% off first booking",
        "No booking fees during trial",
        "Priority customer support",
        "Extended cancellation window"
      ],
      stats: "Join 50,000+ happy renters",
      popular: false
    },
    {
      id: "owner",
      title: "I Want to Rent Out My Items",
      subtitle: "Earn money by renting your belongings",
      icon: Building2,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-700",
      features: [
        "List your items for free",
        "Set your own prices and availability",
        "Manage bookings easily",
        "Get paid securely",
        "Access owner dashboard"
      ],
      stats: "Owners earn up to KSh 50,000/month",
      popular: true
    }
  ]

  const categories = [
    { name: "Vehicles", icon: Car, count: "2,500+" },
    { name: "Homes", icon: Home, count: "1,200+" },
    { name: "Equipment", icon: Wrench, count: "3,800+" },
    { name: "Events", icon: Music, count: "900+" },
    { name: "Fashion", icon: Shirt, count: "1,500+" },
    { name: "Tech", icon: Laptop, count: "2,200+" },
    { name: "Sports", icon: Dumbbell, count: "1,800+" },
    { name: "Photography", icon: Camera, count: "600+" }
  ]

  const handleAccountTypeSelection = async (accountType: string) => {
    console.log('Account type selection started:', accountType)

    if (!user) {
      toast({
        title: "Please sign in first",
        description: "You need to be signed in to select an account type.",
        variant: "destructive",
      })
      return
    }

    // Show trial modal for renters
    if (accountType === 'renter') {
      setSelectedAccountType(accountType)
      setShowTrialModal(true)
      return
    }

    console.log('Calling selectAccountType with:', accountType)
    setIsSubmitting(true)

    try {

      // Redirect based on account type
      if (accountType === 'owner') {
        // New owners must verify first - redirect to verification
        router.push('/verification')
      } else {
        selectAccountType(accountType as 'renter' | 'owner', user.id)
      }

    } catch (error) {
      console.error('Error in account type selection:', error)
      // Even if metadata update fails, still set localStorage and redirect
      setUserAccountType(accountType as 'renter' | 'owner')

      toast({
        title: "⚠️ Account type set locally",
        description: "Your selection was saved. You can continue using the app.",
        duration: 3000,
      })

      // Still redirect even if metadata update failed
      if (accountType === 'owner') {
        // New owners must verify first - redirect to verification
        router.push('/verification')
      } else {
        selectAccountType(accountType as 'renter' | 'owner', user?.id)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmRenterWithTrial = async (includeTrial: boolean) => {
    setShowTrialModal(false)
    setIsSubmitting(true)

    try {
      // Update Clerk user metadata with trial info using unsafeMetadata
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          accountType: 'renter',
          hasFreeTrial: includeTrial,
          trialStartDate: includeTrial ? new Date().toISOString() : null,
          trialEndDate: includeTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
        }
      })

      // Set account type in localStorage
      setUserAccountType('renter')

      toast({
        title: includeTrial ? "🎉 Free Trial Activated!" : "✅ Account Created!",
        description: includeTrial
          ? "Enjoy 14 days of premium benefits!"
          : "Your renter account is ready to use.",
        duration: 3000,
      })

      selectAccountType('renter', user?.id)

    } catch (error) {
      console.error('Error in account type selection:', error)
      // Even if metadata update fails, still set localStorage and redirect
      setUserAccountType('renter')

      toast({
        title: "⚠️ Account type set locally",
        description: "Your selection was saved. You can continue using the app.",
        duration: 3000,
      })

      selectAccountType('renter')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipForNow = async () => {
    // Set a flag that user skipped account type selection
    if (user) {
      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            accountType: 'not_selected',
            skippedAccountType: true,
            skippedAt: new Date().toISOString()
          }
        })
      } catch (error) {
        console.log('Could not update user metadata, using localStorage only')
      }
    }

    // Store in localStorage as well
    localStorage.setItem('userAccountType', 'not_selected')
    localStorage.setItem('accountTypeSkipped', 'true')

    router.push('/')
  }

  // Show loading state while checking account type
  if (isCheckingAccountType) {
    return (
      <>
        <Header />
        <LoadingSpinner
          message="Setting up your account..."
          variant="default"
          fullScreen={true}
          showHeader={false}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12 fade-in-up">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            Welcome, {user?.name || 'User'}! 👋
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-balance">
            Choose Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Journey</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 text-pretty max-w-3xl mx-auto leading-relaxed">
            Tell us how you'd like to use Leli Rentals so we can personalize your experience and show you the most relevant features.
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {accountTypes.map((type, index) => (
            <Card
              key={type.id}
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${selectedAccountType === type.id
                ? `${type.borderColor} border-2 shadow-lg`
                : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${type.bgColor} card-animate`}
              onClick={() => setSelectedAccountType(type.id)}
            >
              {type.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <type.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {type.subtitle}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>{type.stats}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${selectedAccountType === type.id ? 'ring-2 ring-white ring-opacity-50' : ''
                    }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAccountTypeSelection(type.id)
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting && selectedAccountType === type.id ? (
                    <>
                      <div className="relative w-4 h-4 mr-2">
                        <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <div className="absolute inset-1 rounded-full bg-white/20"></div>
                      </div>
                      Setting up...
                    </>
                  ) : (
                    <>
                      Get Started as {type.id === 'renter' ? 'Renter' : 'Owner'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Join Our Growing Community
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">15K+</div>
              <div className="text-gray-600 dark:text-gray-400">Listings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100K+</div>
              <div className="text-gray-600 dark:text-gray-400">Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className="text-gray-600 dark:text-gray-400">Rating</div>
            </div>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            Explore Our Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Card
                key={category.name}
                className="text-center p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer card-animate"
                onClick={() => router.push(`/listings/${category.name.toLowerCase()}`)}
              >
                <category.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.count} items
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            Why Choose Leli Rentals?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 card-animate">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Secure & Trusted
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All transactions are secure with verified users and comprehensive insurance coverage.
              </p>
            </Card>
            <Card className="text-center p-6 card-animate">
              <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Instant Booking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Book your rentals instantly with our streamlined process and instant confirmation.
              </p>
            </Card>
            <Card className="text-center p-6 card-animate">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Direct Communication
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chat directly with owners and get instant support for all your rental needs.
              </p>
            </Card>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleSkipForNow}
            className="px-8 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Skip for now - I'll decide later
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            You can always change your account type later in settings
          </p>
        </div>
      </div>

      {/* Free Trial Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Start Your Free Trial!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get 14 days of premium benefits at no cost
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">20% off first booking</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Save on your first rental</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">No booking fees</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Normally $5-15 per booking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Priority support</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get help faster</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Extended cancellation</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">48 hours instead of 24</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  onClick={() => confirmRenterWithTrial(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="relative w-4 h-4 mr-2">
                        <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <div className="absolute inset-1 rounded-full bg-white/20"></div>
                      </div>
                      Activating Trial...
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => confirmRenterWithTrial(false)}
                  disabled={isSubmitting}
                >
                  Continue without trial
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

