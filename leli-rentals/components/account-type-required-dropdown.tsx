"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, User, Building2, ArrowRight, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface AccountTypeRequiredDropdownProps {
  blocking?: boolean // If true, prevents dismissing
}

export function AccountTypeRequiredDropdown({ blocking = true }: AccountTypeRequiredDropdownProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!user || !isLoaded) return

    // Check if user has account type in Clerk metadata
    const clerkAccountType = (user.publicMetadata?.accountType as string) || 
                             (user.unsafeMetadata?.accountType as string)

    // Show reminder if no account type is set
    if (!clerkAccountType || clerkAccountType === 'not_selected') {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [user, isLoaded])

  const handleSelectAccountType = async (accountType: 'renter' | 'owner') => {
    if (!user) return

    setIsUpdating(true)
    try {
      // Update Clerk user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          accountType: accountType,
          createdAt: new Date().toISOString(),
        }
      })

      toast({
        title: "🎉 Account type selected!",
        description: `Welcome as a ${accountType}! You can now access all features.`,
        duration: 3000,
      })

      setIsVisible(false)

      // Redirect based on account type
      if (accountType === 'renter') {
        router.push('/listings')
      } else {
        router.push('/dashboard/owner')
      }
    } catch (error) {
      console.error('Error updating account type:', error)
      toast({
        title: "Error",
        description: "Failed to save account type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleGoToSelection = () => {
    router.push('/get-started')
  }

  if (!isVisible || !user) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg animate-slide-down">
      <Alert className="border-0 bg-transparent text-white m-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-lg font-bold mb-1 text-white">
                Account Type Required
              </AlertTitle>
              <AlertDescription className="text-white/90 mb-4">
                You must choose an account type to access listings, settings, and other features. 
                This takes less than a minute!
              </AlertDescription>
              
              {/* Account Type Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-w-2xl">
                <Card 
                  className="cursor-pointer border-2 border-white/30 hover:border-white/60 transition-all bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  onClick={() => handleSelectAccountType('renter')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">I'm a Renter</h3>
                        <p className="text-xs text-white/80">Find items to rent</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/80" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer border-2 border-white/30 hover:border-white/60 transition-all bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  onClick={() => handleSelectAccountType('owner')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">I'm an Owner</h3>
                        <p className="text-xs text-white/80">List items for rent</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGoToSelection}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  disabled={isUpdating}
                >
                  View Full Selection Page
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {!blocking && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Alert>
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

