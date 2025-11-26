import { supabase } from './supabase'

export interface Subscription {
    id: string
    user_id: string
    plan_type: 'trial' | 'basic' | 'professional' | 'premium'
    status: 'active' | 'expired' | 'cancelled'
    start_date: string
    end_date: string
    auto_renew: boolean
    payment_id?: string
    stripe_subscription_id?: string
    created_at: string
    updated_at: string
}

/**
 * Create a 5-day trial subscription for a user
 */
export async function createTrialSubscription(userId: string): Promise<Subscription | null> {
    try {
        // Calculate trial end date (5 days from now)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 5)

        // Check if user already has an active subscription
        const { data: existing } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (existing) {
            console.log('User already has an active subscription')
            return existing
        }

        // Create trial subscription
        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan_type: 'trial',
                status: 'active',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                auto_renew: false,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating trial subscription:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Failed to create trial subscription:', error)
        return null
    }
}

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null
            }
            console.error('Error fetching active subscription:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Failed to fetch active subscription:', error)
        return null
    }
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean
    subscription: Subscription | null
    planType: string | null
    daysRemaining: number | null
    isExpired: boolean
}> {
    const subscription = await getActiveSubscription(userId)

    if (!subscription) {
        return {
            hasActiveSubscription: false,
            subscription: null,
            planType: null,
            daysRemaining: null,
            isExpired: false,
        }
    }

    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = daysRemaining <= 0

    return {
        hasActiveSubscription: !isExpired,
        subscription,
        planType: subscription.plan_type,
        daysRemaining: Math.max(0, daysRemaining),
        isExpired,
    }
}

/**
 * Check if user has active subscription (trial or paid)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const status = await getSubscriptionStatus(userId)
    return status.hasActiveSubscription
}

/**
 * Check if trial is expired
 */
export async function isTrialExpired(userId: string): Promise<boolean> {
    const subscription = await getActiveSubscription(userId)

    if (!subscription || subscription.plan_type !== 'trial') {
        return false
    }

    const now = new Date()
    const endDate = new Date(subscription.end_date)
    return now > endDate
}

/**
 * Get days remaining in trial
 */
export async function daysRemainingInTrial(userId: string): Promise<number> {
    const subscription = await getActiveSubscription(userId)

    if (!subscription || subscription.plan_type !== 'trial') {
        return 0
    }

    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return Math.max(0, daysRemaining)
}

/**
 * Expire a subscription
 */
export async function expireSubscription(userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('user_id', userId)
            .eq('status', 'active')

        if (error) {
            console.error('Error expiring subscription:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Failed to expire subscription:', error)
        return false
    }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', userId)
            .eq('status', 'active')

        if (error) {
            console.error('Error cancelling subscription:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Failed to cancel subscription:', error)
        return false
    }
}

/**
 * Check and expire trial subscriptions that have passed their end date
 */
export async function checkAndExpireTrials(): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('plan_type', 'trial')
            .eq('status', 'active')
            .lt('end_date', new Date().toISOString())
            .select()

        if (error) {
            console.error('Error expiring trials:', error)
            return 0
        }

        return data?.length || 0
    } catch (error) {
        console.error('Failed to expire trials:', error)
        return 0
    }
}
