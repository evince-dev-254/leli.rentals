"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { useUser } from '@clerk/nextjs'
import { getUserAccountType, setUserAccountType } from '@/lib/account-type-utils'
import { useToast } from '@/hooks/use-toast'
import { User, Building2, TestTube } from 'lucide-react'

export function OwnerRestrictionTest() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [currentAccountType, setCurrentAccountType] = useState<string | null>(null)

  // Get current account type
  const getCurrentAccountType = () => {
    const accountType = getUserAccountType()
    setCurrentAccountType(accountType)
    return accountType
  }

  // Test account type switching
  const switchToRenter = () => {
    setUserAccountType('renter')
    setCurrentAccountType('renter')
    toast({
      title: "Account Type Changed",
      description: "You are now a renter. Create listing should be restricted.",
    })
  }

  const switchToOwner = () => {
    setUserAccountType('owner')
    setCurrentAccountType('owner')
    toast({
      title: "Account Type Changed",
      description: "You are now an owner. Create listing should be available.",
    })
  }

  const testCreateListingAccess = () => {
    const accountType = getUserAccountType()
    if (accountType === 'owner') {
      toast({
        title: "✅ Access Granted",
        description: "Owner account detected. Create listing functionality is available.",
      })
    } else {
      toast({
        title: "❌ Access Denied",
        description: "Only owner accounts can create listings. Please change your account type.",
        variant: "destructive",
      })
    }
  }

  const testCreateListingPage = () => {
    const accountType = getUserAccountType()
    if (accountType === 'owner') {
      window.location.href = '/profile/create-listing'
    } else {
      toast({
        title: "❌ Access Denied",
        description: "Only owner accounts can access the create listing page.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Owner Restriction Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Current Status:</h3>
          <div className="flex items-center gap-2">
            <Badge variant={currentAccountType === 'owner' ? 'default' : 'secondary'}>
              {currentAccountType || 'Not Set'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentAccountType}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Account Type Switcher */}
        <div className="space-y-2">
          <h3 className="font-semibold">Switch Account Type:</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={switchToRenter}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Switch to Renter
            </Button>
            <Button 
              variant="outline"
              onClick={switchToOwner}
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Switch to Owner
            </Button>
          </div>
        </div>

        {/* Test Functions */}
        <div className="space-y-2">
          <h3 className="font-semibold">Test Functions:</h3>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={testCreateListingAccess}
              className="w-full justify-start"
            >
              Test Create Listing Access
            </Button>
            <Button 
              onClick={testCreateListingPage}
              className="w-full justify-start"
              variant="outline"
            >
              Test Create Listing Page Access
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Switch to "Renter" account type</li>
            <li>Try accessing create listing - should be denied</li>
            <li>Switch to "Owner" account type</li>
            <li>Try accessing create listing - should be allowed</li>
            <li>Check that navigation buttons are hidden/shown appropriately</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

export default OwnerRestrictionTest
