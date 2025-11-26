// Paystack payment service integration
// Custom implementation for better React 19 compatibility

export interface PaystackConfig {
  publicKey: string
  email: string
  amount: number // Amount in kobo (smallest currency unit)
  currency?: string
  reference?: string
  metadata?: Record<string, any>
  channels?: string[] // Payment channels: 'card', 'bank', 'ussd', 'qr', 'mobile_money', 'mpesa', 'airtel', 'pesapal'
  callback?: (response: PaystackResponse) => void
  onClose?: () => void
}

export interface PaystackResponse {
  status: 'success' | 'error'
  message: string
  reference?: string
  trans?: string
  trxref?: string
  transaction?: string
}

export interface PaystackTransaction {
  id: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  reference: string
  customer: {
    email: string
    first_name?: string
    last_name?: string
    phone?: string
  }
  authorization?: {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    reusable: boolean
    signature: string
  }
  created_at: string
}

class PaystackService {
  private readonly publicKey: string
  private readonly secretKey: string
  private readonly baseUrl = 'https://api.paystack.co'

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || ''
  }

  // Initialize Paystack payment
  initializePayment(config: PaystackConfig): void {
    if (typeof window === 'undefined') {
      console.error('Paystack can only be initialized on the client side')
      return
    }

    // Check if Paystack script is loaded
    if (!window.PaystackPop) {
      this.loadPaystackScript(() => {
        this.processPayment(config)
      })
    } else {
      this.processPayment(config)
    }
  }

  // Load Paystack script dynamically
  private loadPaystackScript(callback: () => void): void {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = callback
    script.onerror = () => {
      console.error('Failed to load Paystack script')
    }
    document.head.appendChild(script)
  }

  // Process payment with Paystack
  private processPayment(config: PaystackConfig): void {
    // Default channels: card and mobile money for Kenya
    const defaultChannels = ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'mpesa']

    // Use provided channels or default to all available channels
    const channels = config.channels && config.channels.length > 0
      ? config.channels
      : defaultChannels

    const handler = window.PaystackPop.setup({
      key: this.publicKey,
      email: config.email,
      amount: config.amount,
      currency: config.currency || 'KES',
      ref: config.reference || this.generateReference(),
      metadata: config.metadata || {},
      channels: channels, // Enable mobile money channels
      callback: (response: PaystackResponse) => {
        console.log('Paystack payment response:', response)
        if (config.callback) {
          config.callback(response)
        }
      },
      onClose: () => {
        console.log('Paystack payment closed')
        if (config.onClose) {
          config.onClose()
        }
      }
    })

    handler.openIframe()
  }

  // Verify transaction on server side
  async verifyTransaction(reference: string): Promise<PaystackTransaction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status) {
        return data.data
      }

      return null
    } catch (error) {
      console.error('Error verifying Paystack transaction:', error)
      return null
    }
  }

  // Create a transaction reference
  generateReference(): string {
    return `leli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Convert amount to kobo (Paystack's smallest unit)
  convertToKobo(amount: number, currency: string = 'KES'): number {
    // For KES, 1 KES = 100 cents, but Paystack uses kobo (1 KES = 100 kobo)
    // For NGN, 1 NGN = 100 kobo
    // For USD, 1 USD = 100 cents
    const multipliers = {
      'KES': 100,
      'NGN': 100,
      'USD': 100,
      'GHS': 100,
      'ZAR': 100
    }

    return Math.round(amount * (multipliers[currency as keyof typeof multipliers] || 100))
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): string[] {
    return [
      'card',
      'bank_transfer',
      'ussd',
      'qr',
      'mobile_money',
      'bank_transfer'
    ]
  }

  // Check if Paystack is available
  isAvailable(): boolean {
    return !!(this.publicKey && this.secretKey)
  }

  // Get payment method display name
  getPaymentMethodDisplayName(method: string): string {
    const displayNames: Record<string, string> = {
      'card': 'Credit/Debit Card',
      'bank_transfer': 'Bank Transfer',
      'ussd': 'USSD',
      'qr': 'QR Code',
      'mobile_money': 'Mobile Money'
    }

    return displayNames[method] || method
  }

  // Create subscription payment
  createSubscriptionPayment(
    email: string,
    amount: number,
    plan: string,
    userId: string
  ): PaystackConfig {
    const reference = this.generateReference()
    const amountInKobo = this.convertToKobo(amount, 'KES')

    return {
      publicKey: this.publicKey,
      email: email,
      amount: amountInKobo,
      currency: 'KES',
      reference: reference,
      metadata: {
        subscription_plan: plan,
        user_id: userId,
        payment_type: 'subscription',
        source: 'leli_rentals'
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'mpesa']
    }
  }

  // Verify subscription payment (client-side check before server verification)
  async verifySubscriptionPayment(reference: string): Promise<boolean> {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.success && data.verified
    } catch (error) {
      console.error('Error verifying subscription payment:', error)
      return false
    }
  }
}

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void
      }
    }
  }
}

export const paystackService = new PaystackService()
export default paystackService

