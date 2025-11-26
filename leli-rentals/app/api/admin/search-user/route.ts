import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { addCorsHeaders, createOptionsResponse } from '@/lib/admin-cors'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function OPTIONS(req: NextRequest) {
  return createOptionsResponse(req)
}

export async function POST(req: NextRequest) {
  try {
    const { email, emailAddress } = await req.json()

    // Support both 'email' and 'emailAddress' for backward compatibility
    const emailToSearch = email || emailAddress

    if (!emailToSearch) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailToSearch)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    const authResult = await verifyAdminRequest(req)
    if (!authResult.ok) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: authResult.status || 403 }
      )
      return addCorsHeaders(errorResponse, req)
    }

    const client = await clerkClient()
    
    // Search for user by email address
    const { data: users } = await client.users.getUserList({ 
      emailAddress: [emailToSearch.toLowerCase().trim()],
      limit: 10 
    })

    // Find exact match
    const foundUser = users.find(user => {
      // Check primary email addresses
      if (user.emailAddresses && user.emailAddresses.length > 0) {
        return user.emailAddresses.some(email => 
          email.emailAddress.toLowerCase() === emailToSearch.toLowerCase().trim()
        )
      }
      return false
    })

    if (!foundUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        message: 'No user found with this email address' 
      }, { status: 404 })
    }

    // Return user data
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        emailAddresses: foundUser.emailAddresses,
        phoneNumbers: foundUser.phoneNumbers,
        createdAt: foundUser.createdAt,
        unsafeMetadata: foundUser.unsafeMetadata,
        publicMetadata: foundUser.publicMetadata,
      }
    })
    
    return addCorsHeaders(response, req)

  } catch (error: any) {
    console.error('User search error:', error)
    const errorResponse = NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
    return addCorsHeaders(errorResponse, req)
  }
}

