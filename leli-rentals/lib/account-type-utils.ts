import { useRouter } from 'next/navigation'

export type AccountType = 'renter' | 'owner' | null

export const ACCOUNT_TYPE_KEY = 'userAccountType'

// Get user's account type from localStorage
export const getUserAccountType = (): AccountType => {
  if (typeof window === 'undefined') return null

  const accountType = localStorage.getItem(ACCOUNT_TYPE_KEY)
  return accountType as AccountType
}

// Set user's account type in localStorage and cookies
export const setUserAccountType = (accountType: AccountType): void => {
  if (typeof window === 'undefined') return

  if (accountType) {
    localStorage.setItem(ACCOUNT_TYPE_KEY, accountType)
    // Also set in cookies for server-side access
    document.cookie = `${ACCOUNT_TYPE_KEY}=${accountType}; path=/; max-age=31536000; SameSite=Lax`
  } else {
    localStorage.removeItem(ACCOUNT_TYPE_KEY)
    // Remove from cookies
    document.cookie = `${ACCOUNT_TYPE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

// Check if user needs to select account type
export const needsAccountTypeSelection = (): boolean => {
  return getUserAccountType() === null
}

// Get redirect URL based on account type
export const getRedirectUrl = (accountType: AccountType): string => {
  switch (accountType) {
    case 'renter':
      return '/listings'
    case 'owner':
      return '/dashboard/owner/verification' // Owners must verify first
    default:
      return '/get-started'
  }
}

// Redirect user based on their account type
export const redirectBasedOnAccountType = (router: any): void => {
  const accountType = getUserAccountType()
  const redirectUrl = getRedirectUrl(accountType)
  router.push(redirectUrl)
}

// Hook to handle account type selection and redirect
export const useAccountTypeRedirect = () => {
  const router = useRouter()

  const selectAccountType = async (accountType: AccountType, userId?: string) => {
    console.log('Setting account type:', accountType)
    setUserAccountType(accountType)

    // Update database if userId is provided
    if (userId && accountType) {
      try {
        const response = await fetch('/api/profile/update-account-type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, accountType })
        })

        if (response.ok) {
          console.log('✅ Account type updated in database')
        } else {
          console.warn('⚠️ Database update failed, but continuing with localStorage')
        }
      } catch (error) {
        console.error('Error updating database:', error)
        // Continue anyway - localStorage is already set
      }
    }

    // Add a small delay to ensure localStorage is updated
    setTimeout(() => {
      console.log('Redirecting to:', getRedirectUrl(accountType))
      router.push(getRedirectUrl(accountType))
    }, 100)
  }

  const checkAndRedirect = () => {
    redirectBasedOnAccountType(router)
  }

  return {
    selectAccountType,
    checkAndRedirect,
    getUserAccountType,
    needsAccountTypeSelection
  }
}
