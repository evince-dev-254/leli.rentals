import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

/**
 * DELETE /api/account/delete
 * Deletes user account from Clerk and all associated data from Supabase
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`🗑️ Starting account deletion for user: ${userId}`)

    // Delete from Supabase tables (if configured)
    if (supabase && supabase.from) {
      try {
        // Delete user-related data from all tables
        const tables = [
          'user_profiles',
          'listings',
          'bookings',
          'favorites',
          'messages',
          'reviews',
          'notifications',
          'user_verifications',
          'page_views',
          'listing_views'
        ]

        for (const table of tables) {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('user_id', userId)
          
          if (error) {
            console.warn(`⚠️ Error deleting from ${table}:`, error)
          } else {
            console.log(`✅ Deleted user data from ${table}`)
          }
        }

        // Also delete listings where user is the owner
        const { error: listingsError } = await supabase
          .from('listings')
          .delete()
          .eq('owner_id', userId)
        
        if (listingsError) {
          console.warn('⚠️ Error deleting user listings:', listingsError)
        } else {
          console.log('✅ Deleted user listings')
        }

      } catch (supabaseError) {
        console.error('⚠️ Error during Supabase deletion:', supabaseError)
        // Continue with Clerk deletion even if Supabase fails
      }
    }

    // Delete from Clerk (this is the final step)
    try {
      const clerk = await clerkClient()
      await clerk.users.deleteUser(userId)
      console.log(`✅ Successfully deleted user from Clerk: ${userId}`)

      return NextResponse.json({
        success: true,
        message: 'Account successfully deleted'
      }, { status: 200 })

    } catch (clerkError) {
      console.error('❌ Error deleting user from Clerk:', clerkError)
      return NextResponse.json(
        { error: 'Failed to delete account from authentication service' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

