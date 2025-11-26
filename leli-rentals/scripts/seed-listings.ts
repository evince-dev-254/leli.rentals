/**
 * Database Seeding Script - Mock Listings
 * 
 * This script populates the Supabase database with mock listings for testing.
 * Run with: npm run seed
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { mockListings } from '../lib/mock-listings-data'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Mock user ID for listings (you can change this to your actual Clerk user ID)
const MOCK_OWNER_USER_ID = 'seed_user_owner_001'

async function seedListings() {
  console.log('🌱 Starting database seeding...\n')
  console.log(`📊 Total listings to insert: ${mockListings.length}\n`)

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ listing: string; error: any }> = []

  for (const listing of mockListings) {
    try {
      // Transform mock listing to Supabase schema
      const listingData = {
        id: listing.id, // Use the UUID from mock data
        user_id: listing.owner?.id || MOCK_OWNER_USER_ID,
        title: listing.title,
        description: listing.fullDescription || listing.description,
        category: listing.category,
        subcategory: null,
        price: listing.price,
        price_type: 'per_day',
        location: listing.location,
        availability: 'available',
        features: listing.amenities || [],
        images: listing.images || [listing.image],
        rules: [
          'Be respectful of the item',
          'Return on time',
          'Report any damages immediately'
        ],
        contact_info: {
          name: listing.owner?.name || 'Owner',
          phone: listing.owner?.phone || '+254700000000',
          email: 'owner@example.com'
        },
        status: 'published',
        created_at: listing.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: listing.updatedAt?.toISOString() || new Date().toISOString()
      }

      const { error } = await supabase
        .from('listings')
        .insert(listingData)

      if (error) {
        // Check if it's a duplicate key error (listing already exists)
        if (error.code === '23505') {
          console.log(`⏭️  Skipping duplicate: ${listing.title}`)
        } else {
          throw error
        }
      } else {
        successCount++
        console.log(`✅ Inserted: ${listing.title} (${listing.category})`)
      }
    } catch (error: any) {
      errorCount++
      errors.push({ listing: listing.title, error })
      console.error(`❌ Failed: ${listing.title}`)
      console.error(`   Error: ${error.message || JSON.stringify(error)}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seeding Complete!\n')
  console.log(`✅ Successfully inserted: ${successCount} listings`)
  console.log(`❌ Failed: ${errorCount} listings`)
  console.log(`📊 Total processed: ${mockListings.length} listings`)
  console.log('='.repeat(60) + '\n')

  if (errors.length > 0 && errors.length < 10) {
    console.log('⚠️  Errors encountered:')
    errors.forEach(({ listing, error }) => {
      console.log(`   - ${listing}: ${error.message || JSON.stringify(error)}`)
    })
  }

  // Return exit code based on results
  process.exit(errorCount > 0 ? 1 : 0)
}

// Run the seeding
seedListings().catch(error => {
  console.error('💥 Fatal error during seeding:', error)
  process.exit(1)
})

