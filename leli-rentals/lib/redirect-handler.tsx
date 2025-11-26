"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { getRedirectUrl, getUserAccountType } from '@/lib/account-type-utils'

export function RedirectHandler({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const isLoading = !isLoaded
  const router = useRouter()
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Handle redirect after authentication - only if router is available
  useEffect(() => {
    if (!isLoading && user && !hasRedirected) {
      console.log('Auth Provider: User authenticated, checking redirect needs')

      // Small delay to ensure localStorage is accessible
      setTimeout(() => {
        setHasRedirected(true)

        try {
          // Check Clerk metadata first (most reliable for returning users)
          const clerkAccountType = (user.publicMetadata?.accountType as string) || 
                                  (user.unsafeMetadata?.accountType as string)
          
          // Check if user is new (no account type set)
          const isNewUser = !clerkAccountType || clerkAccountType === 'not_selected'
          
          // Only redirect if user already has account type (returning user)
          // New users should go to /get-started which is handled by Clerk's afterSignInUrl
          if (clerkAccountType === 'renter' || clerkAccountType === 'owner') {
            let redirectUrl = '/get-started'
            
            if (clerkAccountType === 'renter') {
              redirectUrl = '/listings'
            } else if (clerkAccountType === 'owner') {
              // Check verification status for owners
              const verificationStatus = user.unsafeMetadata?.verificationStatus as string
              if (!verificationStatus || verificationStatus === 'not_verified') {
                redirectUrl = '/verification'
              } else {
                redirectUrl = '/dashboard/owner'
              }
            }
            
            console.log('Auth Provider: Redirecting returning user to:', redirectUrl, 'for account type:', clerkAccountType)

            // Only redirect if we're not already on the target page or get-started
            if (pathname !== redirectUrl && pathname !== '/get-started') {
              router.push(redirectUrl)
            }
          } else if (!isNewUser) {
            // Fallback to localStorage if Clerk doesn't have it but user isn't new
            const accountType = getUserAccountType()
            if (accountType) {
              const redirectUrl = getRedirectUrl(accountType)
              console.log('Auth Provider: Using localStorage redirect to:', redirectUrl)
              if (pathname !== redirectUrl && pathname !== '/get-started') {
                router.push(redirectUrl)
              }
            }
          }
        } catch (error) {
          console.warn('Auth Provider: Could not redirect:', error)
        }
      }, 200)
    } else if (!isLoading && !user) {
      setHasRedirected(false)
    }
  }, [isLoading, user, hasRedirected, router, pathname])

  return <>{children}</>
}
