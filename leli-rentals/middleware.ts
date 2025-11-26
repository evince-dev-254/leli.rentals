import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/get-started',
  '/about',
  '/videos(.*)',
  '/contact',
  '/help',
  '/listings(.*)',
  '/categories(.*)',
  '/items(.*)',
  '/privacy',
  '/terms',
  '/cookies',
  '/chat-privacy',
  '/api/verification/update-status',
  '/debug-user',
  // Webhook routes - external services need unauthenticated access
  '/api/webhooks(.*)',
  // Admin API routes - handle their own authentication via x-admin-token
  '/api/users/list',
  '/api/verification/list',
  '/api/listings/list',
  '/api/bookings/list',
  '/api/payments/list',
])

// Define protected routes that require authentication (dashboard/profile areas)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/verification(.*)',
  '/listings/create(.*)',
  '/messages(.*)',
  '/bookings(.*)',
  '/favorites(.*)',
  '/notifications(.*)',
])

// Define owner-only routes
const isOwnerRoute = createRouteMatcher([
  '/dashboard/owner(.*)',
  '/list-item(.*)',
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin-panel(.*)',
  '/admin/verify-users(.*)',
  '/admin/dashboard(.*)',
  '/admin/analytics(.*)',
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth()
  const pathname = request.nextUrl.pathname

  // Create response
  const response = NextResponse.next()

  // Set SameSite=None for Clerk cookies in development to help with email verification
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Allow public routes
  if (isPublicRoute(request)) {
    return response
  }

  // Redirect to sign-in if not authenticated
  if (!userId && isProtectedRoute(request)) {
    return redirectToSignIn({ returnBackUrl: request.url })
  }

  if (!userId) {
    return redirectToSignIn()
  }

  let metadata =
    (sessionClaims?.publicMetadata as Record<string, any> | undefined) ??
    (sessionClaims?.metadata as Record<string, any> | undefined) ??
    (sessionClaims?.unsafeMetadata as Record<string, any> | undefined) ??
    {}

  // Fallback: Fetch user from Clerk API if metadata is missing
  if (!metadata.verificationStatus || !metadata.accountType) {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      metadata = {
        ...metadata,
        ...user.publicMetadata,
        ...user.unsafeMetadata
      }
      console.log('Fetched fresh metadata from Clerk API:', metadata)
    } catch (error) {
      console.error('Error fetching user in middleware:', error)
    }
  }

  const cookieAccountType = request.cookies.get('userAccountType')?.value
  const accountType = metadata.accountType || cookieAccountType
  const verificationStatus = metadata.verificationStatus
  const subscriptionStatus = metadata.subscriptionStatus

  console.log('Middleware Debug:', {
    userId,
    pathname,
    accountType,
    verificationStatus,
    subscriptionStatus
  })

  // Enforce onboarding/account requirements
  if (
    !accountType &&
    pathname !== '/get-started' &&
    !pathname.startsWith('/api')
  ) {
    const onboardingUrl = new URL('/get-started', request.url)
    return NextResponse.redirect(onboardingUrl)
  }

  if (
    accountType === 'owner' &&
    verificationStatus !== 'approved' &&
    verificationStatus !== 'pending' &&
    pathname !== '/verification' &&
    pathname !== '/get-started' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/profile')
  ) {
    const verificationUrl = new URL('/verification', request.url)
    verificationUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(verificationUrl)
  }

  const isVerifiedOwner = accountType === 'owner' && verificationStatus === 'approved'

  if (
    isVerifiedOwner &&
    (!subscriptionStatus || subscriptionStatus === 'none') &&
    pathname !== '/profile/billing' &&
    pathname !== '/verification' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/profile')
  ) {
    if (pathname.startsWith('/dashboard')) {
      const billingUrl = new URL('/profile/billing', request.url)
      return NextResponse.redirect(billingUrl)
    }
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|mp4|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
