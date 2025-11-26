import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

// TEMPORARY ENDPOINT - DELETE AFTER SETTING ADMIN ROLE
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const client = await clerkClient()
    
    // Update user to admin
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'admin'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin role set successfully! Please sign out and sign back in.',
      userId
    })

  } catch (error: any) {
    console.error('Error setting admin role:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

