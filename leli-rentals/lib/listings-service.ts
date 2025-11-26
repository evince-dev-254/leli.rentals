import { supabase } from './supabase'

export interface Listing {
  id?: string
  user_id?: string
  title: string
  description: string
  price: number
  price_type?: string
  location: string
  rating: number
  reviews: number
  image: string
  amenities: string[]
  available: boolean
  category: string
  subcategory?: string
  owner: {
    id: string
    name: string
    avatar: string
    rating: number
    verified: boolean
    phone?: string
  }
  ownerId?: string
  images: string[]
  fullDescription: string
  features?: string[]
  rules?: string[]
  status?: 'draft' | 'published' | 'archived'
  views?: number
  contact_info?: any
  availability?: any
  created_at?: string
  updated_at?: string
}

export interface ListingFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  available?: boolean
  search?: string
  status?: string
}

export const listingsService = {
  // Get all listings with optional filters
  async getListings(filters: ListingFilters = {}, pageSize: number = 24, offset: number = 0): Promise<{ listings: Listing[], hasMore: boolean, total: number }> {
    try {
      let query = supabase
        .from('listings')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.available !== undefined) {
        // Note: 'available' field might not exist in DB, check schema
        query = query.eq('status', 'published')
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching listings:', error)
        throw new Error('Failed to fetch listings')
      }

      // Transform data to match expected format
      const listings: Listing[] = (data || []).map((listing: any) => ({
        id: listing.id,
        user_id: listing.user_id,
        title: listing.title,
        description: listing.description || '',
        fullDescription: listing.description || '',
        price: listing.price || 0,
        price_type: listing.price_type || 'per day',
        location: listing.location || '',
        rating: 0, // Will be calculated from reviews
        reviews: 0,
        image: listing.images?.[0] || '/placeholder.svg',
        images: listing.images || [],
        amenities: listing.features || [],
        features: listing.features || [],
        rules: listing.rules || [],
        available: listing.status === 'published',
        status: listing.status || 'draft',
        category: listing.category || '',
        subcategory: listing.subcategory || '',
        views: listing.views || 0,
        owner: {
          id: listing.user_id,
          name: 'Owner',
          avatar: '/placeholder.svg',
          rating: 4.5,
          verified: true,
        },
        ownerId: listing.user_id,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
      }))

      return {
        listings,
        hasMore: (count || 0) > offset + pageSize,
        total: count || 0
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      throw new Error('Failed to fetch listings')
    }
  },

  // Get listing by ID
  async getListingById(id: string): Promise<Listing | null> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching listing:', error)
        return null
      }

      if (!data) return null

      // Transform to expected format
      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description || '',
        fullDescription: data.description || '',
        price: data.price || 0,
        price_type: data.price_type || 'per day',
        location: data.location || '',
        rating: 0,
        reviews: 0,
        image: data.images?.[0] || '/placeholder.svg',
        images: data.images || [],
        amenities: data.features || [],
        features: data.features || [],
        rules: data.rules || [],
        available: data.status === 'published',
        status: data.status || 'draft',
        category: data.category || '',
        subcategory: data.subcategory || '',
        views: data.views || 0,
        owner: {
          id: data.user_id,
          name: 'Owner',
          avatar: '/placeholder.svg',
          rating: 4.5,
          verified: true,
        },
        ownerId: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
      throw new Error('Failed to fetch listing')
    }
  },

  // Get listings by user ID
  async getUserListings(userId: string): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user listings:', error)
        throw new Error('Failed to fetch user listings')
      }

      // Transform data
      return (data || []).map((listing: any) => ({
        id: listing.id,
        user_id: listing.user_id,
        title: listing.title,
        description: listing.description || '',
        fullDescription: listing.description || '',
        price: listing.price || 0,
        price_type: listing.price_type || 'per day',
        location: listing.location || '',
        rating: 0,
        reviews: 0,
        image: listing.images?.[0] || '/placeholder.svg',
        images: listing.images || [],
        amenities: listing.features || [],
        features: listing.features || [],
        rules: listing.rules || [],
        available: listing.status === 'published',
        status: listing.status || 'draft',
        category: listing.category || '',
        subcategory: listing.subcategory || '',
        views: listing.views || 0,
        owner: {
          id: listing.user_id,
          name: 'Owner',
          avatar: '/placeholder.svg',
          rating: 4.5,
          verified: true,
        },
        ownerId: listing.user_id,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
      }))
    } catch (error) {
      console.error('Error fetching user listings:', error)
      throw new Error('Failed to fetch user listings')
    }
  },

  // Create new listing
  async createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      console.log('Creating listing with data:', listing)

      // Validate required fields
      if (!listing.title || !listing.description || !listing.price || !listing.owner?.id) {
        throw new Error('Missing required fields: title, description, price, or owner information')
      }

      // Prepare data for Supabase schema
      const listingData = {
        user_id: listing.owner.id,
        title: listing.title,
        description: listing.fullDescription || listing.description,
        category: listing.category,
        subcategory: listing.subcategory || null,
        price: listing.price,
        price_type: 'per day',
        location: listing.location,
        images: listing.images || [],
        features: listing.amenities || [],
        rules: [],
        status: 'published',
        views: 0,
        contact_info: listing.owner.phone ? { phone: listing.owner.phone } : null,
        availability: null,
      }

      console.log('Listing data to be saved:', listingData)

      const { data, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating listing:', error)
        throw new Error(`Failed to create listing: ${error.message}`)
      }

      console.log('Listing created successfully with ID:', data.id)
      return data.id
    } catch (error) {
      console.error('Error creating listing:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          throw new Error('Permission denied. Please check your authentication status.')
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.')
        }
      }

      throw new Error(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Update listing
  async updateListing(id: string, updates: Partial<Listing>): Promise<void> {
    try {
      // Transform updates to match DB schema
      const updateData: any = {}

      if (updates.title) updateData.title = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.fullDescription) updateData.description = updates.fullDescription
      if (updates.price) updateData.price = updates.price
      if (updates.location) updateData.location = updates.location
      if (updates.category) updateData.category = updates.category
      if (updates.subcategory) updateData.subcategory = updates.subcategory
      if (updates.images) updateData.images = updates.images
      if (updates.amenities) updateData.features = updates.amenities
      if (updates.features) updateData.features = updates.features
      if (updates.status) updateData.status = updates.status

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Error updating listing:', error)
        throw new Error('Failed to update listing')
      }
    } catch (error) {
      console.error('Error updating listing:', error)
      throw new Error('Failed to update listing')
    }
  },

  // Delete listing
  async deleteListing(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting listing:', error)
        throw new Error('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      throw new Error('Failed to delete listing')
    }
  },

  // Get categories with counts
  async getCategories(): Promise<{ id: string; name: string; count: number }[]> {
    try {
      const categories = [
        { id: 'all', name: 'All Categories' },
        { id: 'vehicles', name: 'Vehicles' },
        { id: 'equipment', name: 'Equipment' },
        { id: 'homes', name: 'Homes & Apartments' },
        { id: 'events', name: 'Event Spaces' },
        { id: 'tech', name: 'Electronics' },
        { id: 'fashion', name: 'Fashion' },
        { id: 'tools', name: 'Tools' },
        { id: 'sports', name: 'Sports & Recreation' },
      ]

      // Get counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          if (category.id === 'all') {
            const { count } = await supabase
              .from('listings')
              .select('*', { count: 'exact', head: true })
            return { ...category, count: count || 0 }
          } else {
            const { count } = await supabase
              .from('listings')
              .select('*', { count: 'exact', head: true })
              .eq('category', category.id)
            return { ...category, count: count || 0 }
          }
        })
      )

      return categoriesWithCounts
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Return default categories if there's an error
      return [
        { id: 'all', name: 'All Categories', count: 0 },
        { id: 'vehicles', name: 'Vehicles', count: 0 },
        { id: 'equipment', name: 'Equipment', count: 0 },
        { id: 'homes', name: 'Homes & Apartments', count: 0 },
        { id: 'events', name: 'Event Spaces', count: 0 },
        { id: 'tech', name: 'Electronics', count: 0 },
        { id: 'fashion', name: 'Fashion', count: 0 },
        { id: 'tools', name: 'Tools', count: 0 },
        { id: 'sports', name: 'Sports & Recreation', count: 0 },
      ]
    }
  }
}
