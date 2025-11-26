import { createClient } from '@/utils/supabase/client'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  currency: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  icon?: any
  color?: string
  buttonColor?: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_type: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  start_date: string
  end_date: string
  auto_renew: boolean
  payment_id?: string
  created_at: string
  updated_at: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'KES',
    features: [
      "Up to 3 listings",
      "Basic search and filters",
      "Standard customer support",
      "Basic analytics",
      "Mobile app access",
      "Secure payments",
    ],
    limitations: [
      "Limited to 3 active listings",
      "Basic support only",
      "Standard listing visibility",
    ],
    icon: null,
    color: "border-gray-200",
    buttonColor: "bg-gray-600 hover:bg-gray-700",
  },
  {
    id: "basic",
    name: "Basic",
    description: "For casual renters",
    price: {
      monthly: 1000,
      yearly: 10000,
    },
    currency: 'KES',
    features: [
      "Up to 10 listings",
      "Priority search placement",
      "Email support",
      "Basic analytics",
    ],
    limitations: [],
    icon: null,
    color: "border-green-200",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Best for active renters",
    price: {
      monthly: 2900,
      yearly: 29000,
    },
    currency: 'KES',
    popular: true,
    features: [
      "Unlimited listings",
      "Advanced search and filters",
      "Priority customer support",
      "Advanced analytics & insights",
      "Mobile app access",
      "Secure payments",
      "Custom branding",
      "Booking management tools",
      "Automated messaging",
      "Performance optimization",
    ],
    limitations: [],
    icon: null,
    color: "border-blue-200",
    buttonColor: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  },
  {
    id: "premium",
    name: "Premium",
    description: "For businesses and agencies",
    price: {
      monthly: 9900,
      yearly: 99000,
    },
    currency: 'KES',
    features: [
      "Everything in Pro",
      "White-label solution",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Multi-user accounts",
      "API access",
      "Custom domain",
      "Priority feature requests",
      "24/7 phone support",
      "Advanced security features",
      "Bulk operations",
    ],
    limitations: [],
    icon: null,
    color: "border-purple-200",
    buttonColor: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
  }
]

class SubscriptionService {
  private supabase = createClient()

  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows found
        console.error('Error getting user subscription:', error)
        return null
      }

      return data as UserSubscription
    } catch (error) {
      console.error('Error getting user subscription:', error)
      throw new Error('Failed to get subscription data')
    }
  }

  // Create or update user subscription
  async createSubscription(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    paymentId?: string
  ): Promise<UserSubscription | null> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
      if (!plan) {
        throw new Error('Invalid plan ID')
      }

      const now = new Date()
      const endDate = new Date(now)

      // Calculate end date based on billing cycle
      if (billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }

      // Deactivate any existing active subscriptions
      await this.supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')

      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: planId,
          status: 'active',
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: planId !== 'free',
          payment_id: paymentId
        })
        .select()
        .single()

      if (error) throw error

      // Update user profile with subscription info
      await this.supabase
        .from('user_profiles')
        .update({
          subscription_plan: planId,
          subscription_status: 'active'
        })
        .eq('user_id', userId)

      return data as UserSubscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error('Failed to create subscription')
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          auto_renew: false
        })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) throw error

      // Update user profile
      await this.supabase
        .from('user_profiles')
        .update({
          subscription_status: 'cancelled'
        })
        .eq('user_id', userId)

    } catch (error) {
      console.error('Error cancelling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  // Get plan by ID
  getPlanById(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
  }

  // Get all available plans
  getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) return false

      const now = new Date()
      const endDate = new Date(subscription.end_date)

      return subscription.status === 'active' && now < endDate
    } catch (error) {
      console.error('Error checking active subscription:', error)
      return false
    }
  }

  // Get user's subscription features
  async getUserFeatures(userId: string): Promise<string[]> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (subscription && subscription.status === 'active') {
        const plan = this.getPlanById(subscription.plan_type)
        return plan?.features || []
      }

      // Return free plan features as default
      const freePlan = this.getPlanById('free')
      return freePlan?.features || []
    } catch (error) {
      console.error('Error getting user features:', error)
      return []
    }
  }
}

export const subscriptionService = new SubscriptionService()


