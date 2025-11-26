"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Building2, ArrowRight, Star, CheckCircle, Clock } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getUserAccountType, setUserAccountType } from "@/lib/account-type-utils"
import { useToast } from "@/hooks/use-toast"

interface AccountTypeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'page-visit' | 'manual' | 'periodic'
}

export function AccountTypeModal({ isOpen, onClose, trigger = 'manual' }: AccountTypeModalProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<string>("")

  const handleSelectAccountType = async (type: 'renter' | 'owner') => {
    if (!user) return

    try {
      await setUserAccountType(user.id, type)
      toast({
        title: "Success!",
        description: `Your account has been set up as a ${type}.`,
      })
      onClose()

      // Redirect based on account type
      if (type === 'owner') {
        router.push('/list-item')
      } else {
        router.push('/search')
      }
    } catch (error) {
      console.error('Error setting account type:', error)
      toast({
        title: "Error",
        description: "Failed to set account type. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSkip = () => {
    if (user) {
      const skipKey = `accountTypeReminder_skipped_${user.id}`
      localStorage.setItem(skipKey, Date.now().toString())
    }
    onClose()
  }

  const accountTypes = [
    {
      id: 'renter',
      title: 'I want to rent items',
      subtitle: 'Find amazing rentals for your needs',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      features: [
        'Browse thousands of listings',
        'Book instantly with secure payments',
        'Chat directly with owners',
        'Get 24/7 customer support'
      ],
      popular: true
    },
    {
      id: 'owner',
      title: 'I want to list items',
      subtitle: 'Earn money by renting your belongings',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      features: [
        'List your items for free',
        'Set your own prices and availability',
        'Manage bookings easily',
        'Track earnings and analytics'
      ]
    }
  ]

  const getModalTitle = () => {
    switch (trigger) {
      case 'page-visit':
        return 'Complete Your Profile'
      case 'periodic':
        return 'Ready to Get Started?'
      default:
        return 'Choose Your Account Type'
    }
  }

  const getModalDescription = () => {
    switch (trigger) {
      case 'page-visit':
        return 'Choose how you\'d like to use Leli Rentals to personalize your experience'
      case 'periodic':
        return 'You\'re almost ready! Just one more step to unlock all features'
      default:
        return 'Tell us how you\'d like to use Leli Rentals so we can show you the most relevant features'
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Clock className="h-3 w-3 mr-1" />
              Takes less than 1 minute
            </Badge>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">15K+</div>
                <div className="text-sm text-gray-600">Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">4.9★</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Account Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accountTypes.map((type) => {
              const IconComponent = type.icon
              const isSelected = selectedType === type.id

              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${isSelected
                    ? `${type.borderColor} border-2 shadow-lg`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${type.bgColor}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {type.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {type.subtitle}
                      </p>
                    </div>

                    <div className="space-y-2 mb-6">
                      {type.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-white ring-opacity-50' : ''
                        }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectAccountType(type.id as 'renter' | 'owner')
                      }}
                    >
                      Get Started as {type.id === 'renter' ? 'Renter' : 'Owner'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="px-6"
            >
              Skip for now
            </Button>
            <Button
              onClick={() => router.push('/get-started')}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Learn More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            You can always change your account type later in settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AccountTypeModal
