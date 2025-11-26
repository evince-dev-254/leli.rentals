import { supabase } from './supabase'

export interface SpecialOffer {
    id: string
    owner_id: string
    listing_id: string | null
    title: string
    description?: string
    discount_percentage: number
    start_date: string
    end_date: string
    is_active: boolean
    views_count: number
    bookings_generated: number
    created_at: string
    updated_at: string
}

export interface CreateSpecialOfferDTO {
    owner_id: string
    listing_id?: string | null
    title: string
    description?: string
    discount_percentage: number
    start_date: string
    end_date: string
}

export class SpecialOffersService {
    /**
     * Create a new special offer
     */
    async createOffer(offer: CreateSpecialOfferDTO): Promise<SpecialOffer> {
        const { data, error } = await supabase
            .from('special_offers')
            .insert({
                ...offer,
                views_count: 0,
                bookings_generated: 0,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error
        return data
    }

    /**
     * Get special offers for an owner
     */
    async getOwnerOffers(ownerId: string): Promise<SpecialOffer[]> {
        const { data, error } = await supabase
            .from('special_offers')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    /**
     * Get active offers for a specific listing
     */
    async getListingOffers(listingId: string): Promise<SpecialOffer[]> {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('special_offers')
            .select('*')
            .eq('listing_id', listingId)
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
            .order('discount_percentage', { ascending: false })

        if (error) throw error
        return data
    }

    /**
     * Get active offers for an owner (owner-wide offers)
     */
    async getOwnerWideOffers(ownerId: string): Promise<SpecialOffer[]> {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('special_offers')
            .select('*')
            .eq('owner_id', ownerId)
            .is('listing_id', null)
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
            .order('discount_percentage', { ascending: false })

        if (error) throw error
        return data
    }

    /**
     * Get all active public deals for homepage
     */
    async getActiveDeals(): Promise<SpecialOffer[]> {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('special_offers')
            .select(`
                *,
                listing:listings(id, title, price, images, category)
            `)
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
            .order('discount_percentage', { ascending: false })
            .limit(12)

        if (error) throw error
        return data
    }

    /**
     * Get best offer for a listing (highest discount)
     * Considers both listing-specific and owner-wide offers
     */
    async getBestOfferForListing(listingId: string, ownerId: string): Promise<SpecialOffer | null> {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('special_offers')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
            .or(`listing_id.eq.${listingId},and(listing_id.is.null,owner_id.eq.${ownerId})`)
            .order('discount_percentage', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data || null
    }

    /**
     * Update special offer
     */
    async updateOffer(offerId: string, updates: Partial<SpecialOffer>): Promise<SpecialOffer> {
        const { data, error } = await supabase
            .from('special_offers')
            .update(updates)
            .eq('id', offerId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    /**
     * Delete/Deactivate special offer
     */
    async deleteOffer(offerId: string): Promise<void> {
        const { error } = await supabase
            .from('special_offers')
            .update({ is_active: false })
            .eq('id', offerId)

        if (error) throw error
    }

    /**
     * Increment views count for an offer
     */
    async incrementViews(offerId: string): Promise<void> {
        const { error } = await supabase.rpc('increment_offer_views', { offer_id: offerId })

        // If RPC fails, fallback to manual update
        if (error) {
            const { data: offer } = await supabase
                .from('special_offers')
                .select('views_count')
                .eq('id', offerId)
                .single()

            if (offer) {
                await supabase
                    .from('special_offers')
                    .update({ views_count: offer.views_count + 1 })
                    .eq('id', offerId)
            }
        }
    }

    /**
     * Increment bookings generated count
     */
    async incrementBookings(offerId: string): Promise<void> {
        const { error } = await supabase.rpc('increment_offer_bookings', { offer_id: offerId })

        // If RPC fails, fallback to manual update
        if (error) {
            const { data: offer } = await supabase
                .from('special_offers')
                .select('bookings_generated')
                .eq('id', offerId)
                .single()

            if (offer) {
                await supabase
                    .from('special_offers')
                    .update({ bookings_generated: offer.bookings_generated + 1 })
                    .eq('id', offerId)
            }
        }
    }

    /**
     * Calculate discount amount for a booking with special offer
     */
    calculateDiscount(originalPrice: number, discountPercentage: number): number {
        return (originalPrice * discountPercentage) / 100
    }

    /**
     * Calculate final price after special offer
     */
    calculateFinalPrice(originalPrice: number, discountPercentage: number): number {
        const discount = this.calculateDiscount(originalPrice, discountPercentage)
        return originalPrice - discount
    }
}

export const specialOffersService = new SpecialOffersService()
