import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

// Admin dashboard middleware - uses Clerk authentication only
// Since this is a separate admin Clerk project, any user who can authenticate
// is considered an admin. For additional role-based access control within the admin
// dashboard, use Clerk organizations or metadata.
export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    // This will redirect to sign-in if not authenticated
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

