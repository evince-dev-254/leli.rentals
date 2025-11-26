/**
 * Database Clear Script - Remove All Listings
 * 
 * WARNING: This will delete ALL listings from the database!
 * Run with: npm run seed:clear
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearListings() {
  console.log('🗑️  Clearing all listings from database...\n')
  console.log('⚠️  WARNING: This will delete ALL listings!\n')

  const { data: existingListings, error: fetchError } = await supabase
    .from('listings')
    .select('id, title')

  if (fetchError) {
    console.error('❌ Error fetching listings:', fetchError)
    process.exit(1)
  }

  if (!existingListings || existingListings.length === 0) {
    console.log('✅ No listings to clear. Database is already empty.')
    process.exit(0)
  }

  console.log(`📊 Found ${existingListings.length} listings to delete\n`)

  const { error } = await supabase
    .from('listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (using a condition that's always true)

  if (error) {
    console.error('❌ Error clearing listings:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully deleted ${existingListings.length} listings\n`)
  console.log('🎉 Database cleared!\n')
}

clearListings().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})

