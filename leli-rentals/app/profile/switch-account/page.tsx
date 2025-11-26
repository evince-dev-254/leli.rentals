'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Home, 
  Building, 
  CheckCircle, 
  ArrowRight, 
  Settings,
  CreditCard,
  Calendar,
  MessageSquare,
  BarChart3,
  Shield,
  Bell
} from 'lucide-react'

interface AccountType {
  type: 'renter' | 'owner'
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  isActive: boolean
  isVerified: boolean
  stats: {
    bookings?: number
    listings?: number
    revenue?: number
    messages?: number
  }
}

export default function SwitchAccountPage() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [currentAccountType, setCurrentAccountType] = useState<'renter' | 'owner'>('renter')
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [targetType, setTargetType] = useState<'renter' | 'owner'>('renter')

  const accountTypes: AccountType[] = [
    {
      type: 'renter',
      name: 'Renter Account',
      description: 'Find and book amazing places to stay',
      icon: <User className="h-8 w-8" />,
      features: [
        'Search and book accommodations',
        'Manage your bookings',
        'Message hosts',
        'Leave reviews',
        'Save favorite places',
        'Get booking confirmations'
      ],
      isActive: currentAccountType === 'renter',
      isVerified: true,
      stats: {
        bookings: 12,
        messages: 8
      }
    },
    {
      type: 'owner',
      name: 'Owner Account',
      description: 'List your property and earn money',
      icon: <Home className="h-8 w-8" />,
      features: [
        'List your property',
        'Manage bookings',
        'Set pricing and availability',
        'Communicate with guests',
        'Track earnings',
        'Access analytics dashboard'
      ],
      isActive: currentAccountType === 'owner',
      isVerified: false,
      stats: {
        listings: 3,
        revenue: 2450,
        messages: 15
      }
    }
  ]

  useEffect(() => {
    if (!user) return

    const fetchAccountType = async () => {
      try {
        // Get account type from Clerk metadata
        const accountType = (user.publicMetadata?.accountType as string) || 
                           (user.unsafeMetadata?.accountType as string) || 
                           'not_selected'
        setCurrentAccountType(accountType as 'renter' | 'owner')
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching account type:', error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to load account information",
          variant: "destructive"
        })
      }
    }

    fetchAccountType()
  }, [user, toast])

  const handleSwitchAccount = async (newAccountType: 'renter' | 'owner') => {
    if (!user) return

    if (newAccountType === currentAccountType) {
      toast({
        title: "Info",
        description: "You are already using this account type"
      })
      return
    }

    // Show warning modal before switching
    setTargetType(newAccountType)
    setShowWarning(true)
  }

  const confirmSwitch = async () => {
    setShowWarning(false)
    setIsSwitching(true)
    
    try {
      // Archive listings if switching from owner to renter
      if (currentAccountType === 'owner' && targetType === 'renter') {
        // Archive all listings (mock)
        console.log('Archiving owner listings...')
      }

      // Update Clerk metadata
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          accountType: targetType,
          previousAccountType: currentAccountType,
          switchedAt: new Date().toISOString(),
          // Add verification requirements for owner switch
          ...(targetType === 'owner' && {
            needsVerification: true,
            verificationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        }
      })
      
      setCurrentAccountType(targetType)
      
      toast({
        title: "Account Switched!",
        description: targetType === 'owner' 
          ? "You'll be redirected to ID verification. This is required to use owner features." 
          : "Your listings have been archived",
      })

      // Redirect based on account type
      setTimeout(() => {
        if (targetType === 'owner') {
          // Redirect to verification page for ID verification
          router.push('/verification?redirect=/dashboard/owner&accountSwitch=true')
        } else {
          router.push('/listings')
        }
      }, 1500)
    } catch (error) {
      console.error('Error switching account:', error)
      toast({
        title: "Error",
        description: "Failed to switch account type",
        variant: "destructive"
      })
    } finally {
      setIsSwitching(false)
    }
  }

  const handleVerifyOwnerAccount = () => {
    router.push('/verification')
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Switch Account Type</h1>
        <p className="text-gray-600 mt-2">Choose how you want to use Leli Rentals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {accountTypes.map((account) => (
          <Card key={account.type} className={`relative ${account.isActive ? 'ring-2 ring-blue-500' : ''}`}>
            {account.isActive && (
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Active</span>
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${account.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  {account.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{account.name}</CardTitle>
                  <CardDescription className="text-base">{account.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {account.stats.bookings && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{account.stats.bookings}</div>
                    <div className="text-sm text-gray-600">Bookings</div>
                  </div>
                )}
                {account.stats.listings && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{account.stats.listings}</div>
                    <div className="text-sm text-gray-600">Listings</div>
                  </div>
                )}
                {account.stats.revenue && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${account.stats.revenue}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                )}
                {account.stats.messages && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{account.stats.messages}</div>
                    <div className="text-sm text-gray-600">Messages</div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h4 className="font-semibold mb-3">What you can do:</h4>
                <ul className="space-y-2">
                  {account.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Verification Status */}
              {account.type === 'owner' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Verification Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    To use the owner account, you need to verify your identity and property ownership.
                  </p>
                  {!account.isVerified ? (
                    <Button onClick={handleVerifyOwnerAccount} className="w-full">
                      Start Verification
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                {account.isActive ? (
                  <Button disabled className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Currently Active
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSwitchAccount(account.type)}
                    disabled={isSwitching || (account.type === 'owner' && !account.isVerified)}
                    className="w-full"
                  >
                    {isSwitching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Switching...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Switch to {account.name}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard')}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Dashboard</h3>
              <p className="text-sm text-gray-600">View your activity and stats</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/profile')}>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Profile</h3>
              <p className="text-sm text-gray-600">Manage your account settings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/bookings')}>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Bookings</h3>
              <p className="text-sm text-gray-600">Manage your reservations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/messages')}>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <h3 className="font-semibold mb-2">Messages</h3>
              <p className="text-sm text-gray-600">View your conversations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Renter Account</h4>
            <p className="text-sm text-gray-600 mb-2">
              Perfect for finding and booking accommodations. You can search, book, and manage your stays.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push('/help/renter')}>
              Learn More
            </Button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Owner Account</h4>
            <p className="text-sm text-gray-600 mb-2">
              Ideal for property owners who want to list their spaces and earn money from rentals.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push('/help/owner')}>
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-amber-600" />
                Confirm Account Switch
              </CardTitle>
              <CardDescription>
                {targetType === 'owner' 
                  ? "Switching to an owner account requires ID verification"
                  : "Your active listings will be archived"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetType === 'owner' ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Before you continue:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>You'll need to verify your ID within 5 days</li>
                    <li>Complete owner setup (business info, payout details)</li>
                    <li>Choose a billing package</li>
                    <li>Upload ID or passport documents</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">What happens:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>All your listings will be archived</li>
                    <li>You can browse and book rentals</li>
                    <li>Your owner data will be preserved</li>
                    <li>You can switch back anytime</li>
                  </ul>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowWarning(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={confirmSwitch}
                  disabled={isSwitching}
                >
                  {isSwitching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Switching...
                    </>
                  ) : (
                    'Confirm Switch'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


