'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe, isStripeConfigured } from '@/lib/stripe-client'
import { 
  Check, 
  Star, 
  Zap, 
  TrendingUp,
  Shield,
  Headphones,
  BarChart3,
  Calendar,
  Crown,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface BillingPackage {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  limits: {
    listings: string
    commission: string
    support: string
  }
  recommended?: boolean
  popular?: boolean
}

const packages: BillingPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    description: 'Perfect for getting started',
    limits: {
      listings: '10 active listings',
      commission: '3% per booking',
      support: 'Standard support'
    },
    features: [
      '10 active listings',
      'Basic analytics dashboard',
      'Standard email support',
      'Photo uploads (up to 10 per listing)',
      'Calendar management',
      'Secure payments',
      '3% commission per booking',
      'Mobile app access'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    description: 'For serious rental businesses',
    limits: {
      listings: '50 active listings',
      commission: '2% per booking',
      support: 'Priority support'
    },
    features: [
      '50 active listings',
      'Advanced analytics & insights',
      'Priority email & chat support',
      'Unlimited photo uploads',
      'Calendar sync with external calendars',
      'Featured listing placement',
      '2% commission per booking',
      'Custom pricing rules',
      'Bulk listing management',
      'Performance reports'
    ],
    recommended: true,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Maximum features & support',
    limits: {
      listings: 'Unlimited listings',
      commission: '1.5% per booking',
      support: '24/7 dedicated support'
    },
    features: [
      'Unlimited active listings',
      'Custom analytics dashboard',
      '24/7 dedicated phone support',
      'Unlimited everything',
      'API access for integrations',
      'Premium listing placement',
      '1.5% commission per booking',
      'Multi-property management',
      'White-label options',
      'Custom reporting',
      'Dedicated account manager',
      'Early access to new features'
    ]
  }
]

export default function OwnerBillingPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [showPayment, setShowPayment] = useState(false)
  const [stripeConfigured, setStripeConfigured] = useState(false)

  useEffect(() => {
    setStripeConfigured(isStripeConfigured())
  }, [])

  const handleSelectPackage = async (packageId: string) => {
    setSelectedPackage(packageId)

    // If Stripe is not configured, just save the package selection
    if (!stripeConfigured) {
      await handleFallbackSelection(packageId)
      return
    }

    setIsProcessing(true)
    
    try {
      // Create subscription via API
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName || user?.firstName || 'User',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      // Show payment modal
      setClientSecret(data.clientSecret)
      setShowPayment(true)
      
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleFallbackSelection = async (packageId: string) => {
    setIsProcessing(true)
    
    try {
      // Update user metadata with selected package
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          billingPackage: packageId,
          subscriptionStartDate: new Date().toISOString(),
        }
      })
      
      toast({
        title: "Package Selected!",
        description: `You've selected the ${packages.find(p => p.id === packageId)?.name} plan.`,
      })
      
      // Redirect to verification page
      setTimeout(() => {
        router.push('/dashboard/owner/verification')
      }, 1500)
      
    } catch (error) {
      console.error('Error selecting package:', error)
      toast({
        title: "Error",
        description: "Failed to save package selection.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = async () => {
    // Update user metadata
    await user?.update({
      publicMetadata: {
        ...user.publicMetadata,
        billingPackage: selectedPackage,
        subscriptionStartDate: new Date().toISOString(),
      }
    })

    toast({
      title: "Payment Successful!",
      description: "Your subscription is now active.",
    })

    // Redirect to verification
    router.push('/dashboard/owner/verification')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            Choose Your Plan
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Select Your Billing Package
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start earning from your rentals with a package that fits your needs. 
            All plans include secure payments and fraud protection.
          </p>
        </div>

        {/* Stripe Configuration Alert */}
        {!stripeConfigured && (
          <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">Stripe Not Configured</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Payment processing is not set up yet. Package selections will be saved, but payment will not be processed.
              See <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">STRIPE_SETUP_GUIDE.md</code> for setup instructions.
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative transition-all duration-300 hover:shadow-2xl ${
                pkg.recommended 
                  ? 'border-2 border-purple-500 shadow-xl scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {pkg.recommended && (
                <div className="absolute top-4 right-4">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  {pkg.id === 'basic' && <Shield className="h-6 w-6 text-blue-500" />}
                  {pkg.id === 'professional' && <TrendingUp className="h-6 w-6 text-purple-500" />}
                  {pkg.id === 'enterprise' && <Crown className="h-6 w-6 text-yellow-500" />}
                </div>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    ${pkg.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">{pkg.limits.listings}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">{pkg.limits.commission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Headphones className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{pkg.limits.support}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    pkg.recommended
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800'
                  } text-white font-semibold py-3`}
                  onClick={() => handleSelectPackage(pkg.id)}
                  disabled={isProcessing && selectedPackage !== pkg.id}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Select Plan'
                  )}
                </Button>

                {pkg.recommended && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Recommended for most owners
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Can I upgrade or downgrade later?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! You can change your plan anytime from your dashboard. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We accept all major credit cards, debit cards, and PayPal for your convenience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Owner accounts don't have free trials, but we offer a 30-day money-back guarantee.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  When do I get paid?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payouts are processed 24 hours after booking confirmation, directly to your bank account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help choosing? <button className="text-blue-600 hover:underline font-semibold">Contact our sales team</button>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && clientSecret && (
        <Elements stripe={getStripe()} options={{ clientSecret }}>
          <PaymentModal
            onSuccess={handlePaymentSuccess}
            onClose={() => {
              setShowPayment(false)
              setIsProcessing(false)
            }}
            packageName={packages.find(p => p.id === selectedPackage)?.name || ''}
            price={packages.find(p => p.id === selectedPackage)?.price || 0}
          />
        </Elements>
      )}
    </div>
  )
}

// Payment Modal Component
function PaymentModal({
  onSuccess,
  onClose,
  packageName,
  price,
}: {
  onSuccess: () => void
  onClose: () => void
  packageName: string
  price: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/owner/verification`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>
            Subscribe to {packageName} - ${price}/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Pay $${price}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

