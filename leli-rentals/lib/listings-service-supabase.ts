import { supabase, isSupabaseConfigured } from './supabase'
import { automaticNotifications } from './automatic-notifications'

export interface ListingData {
  id?: string
  user_id: string
  title: string
  description?: string
  category?: string
  subcategory?: string
  price?: number
  priceType?: string
  location?: string
  availability?: any
  features?: string[]
  images?: string[]
  rules?: string[]
  contactInfo?: any
  status?: 'draft' | 'published' | 'archived'
  created_at?: string
  updated_at?: string
}

export const listingsServiceSupabase = {
  /**
   * Save a listing as draft
   */
  async saveDraft(userId: string, listingData: Partial<ListingData>): Promise<{ id: string }> {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        throw new Error(
          'Database not configured. Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file to enable draft saving.'
        )
      }

      const now = new Date().toISOString()
      
      const dataToSave = {
        user_id: userId,
        title: listingData.title || 'Untitled Draft',
        description: listingData.description || null,
        category: listingData.category || null,
        subcategory: listingData.subcategory || null,
        price: listingData.price || null,
        price_type: listingData.priceType || 'per_day',
        location: listingData.location || null,
        availability: listingData.availability || null,
        features: listingData.features || [],
        images: listingData.images || [],
        rules: listingData.rules || [],
        contact_info: listingData.contactInfo || null,
        status: 'draft' as const,
        updated_at: now,
      }

      // If listing already has an ID, update it
      if (listingData.id) {
        const { data, error } = await supabase
          .from('listings')
          .update(dataToSave)
          .eq('id', listingData.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          console.error('Error updating draft:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw new Error(error.message || `Failed to update draft: ${error.code || 'Unknown error'}`)
        }
        
        if (!data) {
          throw new Error('No data returned after update')
        }
        
        return { id: data.id }
      }

      // Otherwise, create new draft
      const { data, error } = await supabase
        .from('listings')
        .insert({ ...dataToSave, created_at: now })
        .select()
        .single()

      if (error) {
        console.error('Error creating draft:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          dataToSave: Object.keys(dataToSave)
        })
        // Provide more specific error messages
        if (error.code === '23505') {
          throw new Error('A listing with this ID already exists')
        } else if (error.code === '23502') {
          throw new Error(`Missing required field: ${error.message}`)
        } else if (error.code === '23514') {
          throw new Error(`Invalid data: ${error.message}`)
        } else if (error.code === '42P01') {
          throw new Error('Listings table does not exist. Please run the database migration scripts.')
        } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          throw new Error('Database table not found. Please ensure your database is properly set up.')
        }
        throw new Error(error.message || `Failed to create draft: ${error.code || 'Unknown error'}`)
      }
      
      if (!data) {
        throw new Error('No data returned after insert')
      }
      
      return { id: data.id }
    } catch (error: any) {
      console.error('Error saving draft:', error)
      // Don't wrap the error if it's already an Error with a message
      if (error instanceof Error) {
        throw error
      }
      throw new Error(error?.message || 'Failed to save draft')
    }
  },

  /**
   * Publish a listing (change status from draft to published)
   */
  async publishListing(listingId: string, userId: string, listingTitle?: string): Promise<void> {
    try {
      // Get listing title if not provided
      let title = listingTitle
      if (!title) {
        const { data } = await supabase
          .from('listings')
          .select('title')
          .eq('id', listingId)
          .single()
        title = data?.title || 'Your listing'
      }

      const { error } = await supabase
        .from('listings')
        .update({
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error
      
      // Send automatic notification
      automaticNotifications.sendListingCreatedNotification(
        userId,
        title,
        false  // isDraft = false (published)
      ).catch(err => console.error('Notification error:', err))
    } catch (error) {
      console.error('Error publishing listing:', error)
      throw new Error('Failed to publish listing')
    }
  },

  /**
   * Get a listing preview by ID
   */
  async getListingPreview(listingId: string, userId: string): Promise<ListingData | null> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price,
        priceType: data.price_type,
        location: data.location,
        availability: data.availability,
        features: data.features,
        images: data.images,
        rules: data.rules,
        contactInfo: data.contact_info,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    } catch (error) {
      console.error('Error fetching listing preview:', error)
      return null
    }
  },

  /**
   * Get user's listings filtered by status
   */
  async getUserListings(
    userId: string,
    status?: 'draft' | 'published' | 'archived'
  ): Promise<ListingData[]> {
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        price: item.price,
        priceType: item.price_type,
        location: item.location,
        availability: item.availability,
        features: item.features,
        images: item.images,
        rules: item.rules,
        contactInfo: item.contact_info,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))
    } catch (error) {
      console.error('Error fetching user listings:', error)
      return []
    }
  },

  /**
   * Delete a listing (or move to archived)
   */
  async deleteListing(listingId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting listing:', error)
      throw new Error('Failed to delete listing')
    }
  },

  /**
   * Archive a listing
   */
  async archiveListing(listingId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error archiving listing:', error)
      throw new Error('Failed to archive listing')
    }
  },

  /**
   * Get draft count for a user
   */
  async getDraftCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'draft')

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching draft count:', error)
      return 0
    }
  },
}
