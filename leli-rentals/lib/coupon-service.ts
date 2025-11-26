import { supabase } from './supabase'

export interface Coupon {
    id: string
    owner_id: string
    code: string
    description?: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_booking_amount: number
    max_uses?: number
    current_uses: number
    start_date: string
    expiry_date?: string
    is_active: boolean
    created_at: string
}

export interface CreateCouponDTO {
    owner_id: string
    code: string
    description?: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_booking_amount?: number
    max_uses?: number
    start_date?: string
    expiry_date?: string
}

export class CouponService {
    /**
     * Create a new coupon
     */
    async createCoupon(coupon: CreateCouponDTO) {
        // Check if code already exists for this owner
        const { data: existing } = await supabase
            .from('coupons')
            .select('id')
            .eq('owner_id', coupon.owner_id)
            .eq('code', coupon.code)
            .single()

        if (existing) {
            throw new Error('Coupon code already exists for this owner')
        }

        const { data, error } = await supabase
            .from('coupons')
            .insert({
                ...coupon,
                current_uses: 0,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error
        return data
    }

    /**
     * Get coupons for an owner
     */
    async getOwnerCoupons(ownerId: string) {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Coupon[]
    }

    /**
     * Get all active public coupons (for deals page)
     * Note: In a real app, you might want a flag for "public" vs "private" coupons
     * For now, we'll assume all active coupons are public deals
     */
    async getActiveDeals() {
        const now = new Date().toISOString()
        const { data, error } = await supabase
            .from('coupons')
            .select('*, owner:user_profiles(name, avatar)')
            .eq('is_active', true)
            .lte('start_date', now)
            .or(`expiry_date.is.null,expiry_date.gt.${now}`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    /**
     * Validate a coupon code
     */
    async validateCoupon(code: string, listingId: string, bookingAmount: number) {
        // 1. Get coupon details
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single()

        if (error || !coupon) {
            return { valid: false, error: 'Invalid coupon code' }
        }

        // 2. Check expiry
        const now = new Date()
        if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
            return { valid: false, error: 'Coupon has expired' }
        }

        if (new Date(coupon.start_date) > now) {
            return { valid: false, error: 'Coupon is not active yet' }
        }

        // 3. Check usage limits
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return { valid: false, error: 'Coupon usage limit reached' }
        }

        // 4. Check minimum amount
        if (coupon.min_booking_amount && bookingAmount < coupon.min_booking_amount) {
            return { valid: false, error: `Minimum booking amount of KSh ${coupon.min_booking_amount} required` }
        }

        // 5. Check ownership (coupon must belong to listing owner)
        // First get listing owner
        const { data: listing } = await supabase
            .from('listings')
            .select('user_id')
            .eq('id', listingId)
            .single()

        if (!listing || listing.user_id !== coupon.owner_id) {
            return { valid: false, error: 'Coupon is not valid for this listing' }
        }

        // Calculate discount
        let discountAmount = 0
        if (coupon.discount_type === 'percentage') {
            discountAmount = (bookingAmount * coupon.discount_value) / 100
        } else {
            discountAmount = coupon.discount_value
        }

        // Ensure discount doesn't exceed booking amount
        discountAmount = Math.min(discountAmount, bookingAmount)

        return {
            valid: true,
            coupon,
            discountAmount
        }
    }

    /**
     * Record coupon usage
     */
    async recordUsage(couponId: string, userId: string, bookingId: string, discountAmount: number) {
        // 1. Create usage record
        const { error: usageError } = await supabase
            .from('coupon_usage')
            .insert({
                coupon_id: couponId,
                user_id: userId,
                booking_id: bookingId,
                discount_amount: discountAmount
            })

        if (usageError) throw usageError

        // 2. Increment usage count
        const { error: updateError } = await supabase.rpc('increment_coupon_uses', { coupon_id: couponId })

        // If RPC fails (maybe not created), try manual update
        if (updateError) {
            const { data: coupon } = await supabase
                .from('coupons')
                .select('current_uses')
                .eq('id', couponId)
                .single()

            if (coupon) {
                await supabase
                    .from('coupons')
                    .update({ current_uses: coupon.current_uses + 1 })
                    .eq('id', couponId)
            }
        }
    }

    /**
     * Delete/Deactivate coupon
     */
    async deleteCoupon(couponId: string) {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', couponId)

        if (error) throw error
    }
}

export const couponService = new CouponService()
