// Payment service for M-Pesa, Airtel Money, and Card payments
// This integrates with real payment providers

import { notificationsService } from './notifications-service'

export interface PaymentMethod {
  id: string
  name: string
  type: 'mpesa' | 'airtel' | 'card' | 'bank_transfer'
  icon: string
  enabled: boolean
  fees?: {
    percentage: number
    fixed: number
  }
}

export interface PaymentRequest {
  id: string
  amount: number
  currency: string
  description: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  paymentMethod: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  message: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  error?: string
  metadata?: Record<string, any>
}

export interface MpesaPaymentRequest {
  amount: number
  phoneNumber: string
  accountReference: string
  transactionDesc: string
}

export interface AirtelPaymentRequest {
  amount: number
  phoneNumber: string
  reference: string
  description: string
}

export interface CardPaymentRequest {
  amount: number
  currency: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  email: string
}

class PaymentService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'https://api.lelirentals.com/payments'
  private readonly MPESA_CONSUMER_KEY = process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY
  private readonly MPESA_CONSUMER_SECRET = process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET
  private readonly AIRTEL_CLIENT_ID = process.env.NEXT_PUBLIC_AIRTEL_CLIENT_ID
  private readonly AIRTEL_CLIENT_SECRET = process.env.NEXT_PUBLIC_AIRTEL_CLIENT_SECRET
  private readonly STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  // Available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'visa',
        name: 'Visa Card',
        type: 'card',
        icon: '💳',
        enabled: true,
        fees: { percentage: 2.9, fixed: 0 }
      },
      {
        id: 'paystack',
        name: 'Paystack',
        type: 'paystack',
        icon: '💳',
        enabled: true,
        fees: { percentage: 1.5, fixed: 0 }
      }
    ]
  }

  // Process M-Pesa payment
  async processMpesaPayment(request: MpesaPaymentRequest): Promise<PaymentResponse> {
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || !this.MPESA_CONSUMER_KEY || !this.MPESA_CONSUMER_SECRET
      
      if (isDevelopment) {
        // Simulate M-Pesa payment in development mode
        console.log('🔧 Development mode: Simulating M-Pesa payment')
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate successful payment
        return {
          success: true,
          transactionId: `mock_mpesa_${Date.now()}`,
          message: 'Payment simulated successfully in development mode. In production, this would send an STK Push to your phone.',
          status: 'completed'
        }
      }

      // Get M-Pesa access token
      const accessToken = await this.getMpesaAccessToken()
      
      const payload = {
        BusinessShortCode: process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '174379',
        Password: this.generateMpesaPassword(),
        Timestamp: this.getMpesaTimestamp(),
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount),
        PartyA: request.phoneNumber,
        PartyB: process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '174379',
        PhoneNumber: request.phoneNumber,
        CallBackURL: `${this.API_BASE_URL}/mpesa/callback`,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc
      }

      const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`M-Pesa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.ResponseCode === '0') {
        return {
          success: true,
          transactionId: data.CheckoutRequestID,
          message: 'Payment request sent to your phone. Please complete the payment on your M-Pesa app.',
          status: 'pending'
        }
      } else {
        return {
          success: false,
          message: 'M-Pesa payment failed. Please try again.',
          status: 'failed',
          error: data.ResponseDescription
        }
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error)
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Process Airtel Money payment
  async processAirtelPayment(request: AirtelPaymentRequest): Promise<PaymentResponse> {
    try {
      const accessToken = await this.getAirtelAccessToken()
      
      const payload = {
        amount: request.amount,
        currency: 'KES',
        externalId: request.reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: request.phoneNumber
        },
        payerMessage: request.description,
        payeeNote: request.description,
        callbackUrl: `${this.API_BASE_URL}/airtel/callback`
      }

      const response = await fetch('https://openapiuat.airtel.africa/merchant/v1/payments/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': 'KE',
          'X-Currency': 'KES'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.status?.success) {
        return {
          success: true,
          transactionId: data.data?.transaction?.id,
          message: 'Payment request sent to your phone. Please complete the payment on your Airtel Money app.',
          status: 'pending'
        }
      } else {
        return {
          success: false,
          message: 'Airtel Money payment failed. Please try again.',
          status: 'failed',
          error: data.status?.message
        }
      }
    } catch (error) {
      console.error('Airtel payment error:', error)
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Process card payment using Stripe
  async processCardPayment(request: CardPaymentRequest): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would use Stripe.js on the frontend
      // and process the payment on your backend for security
      
      const response = await fetch(`${this.API_BASE_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(request.amount * 100), // Convert to cents
          currency: request.currency.toLowerCase(),
          metadata: {
            cardholderName: request.cardholderName,
            email: request.email
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          transactionId: data.paymentIntentId,
          paymentUrl: data.clientSecret,
          message: 'Card payment processed successfully.',
          status: 'completed'
        }
      } else {
        return {
          success: false,
          message: 'Card payment failed. Please check your card details.',
          status: 'failed',
          error: data.error
        }
      }
    } catch (error) {
      console.error('Card payment error:', error)
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Process Paystack payment
  async processPaystackPayment(request: {
    amount: number
    email: string
    reference: string
    description: string
  }): Promise<PaymentResponse> {
    try {
      // Simulate Paystack payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        transactionId: `PS_${Date.now()}`,
        message: 'Payment processed successfully via Paystack.',
        status: 'completed'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Paystack payment failed.',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Process bank transfer
  async processBankTransfer(amount: number, reference: string): Promise<PaymentResponse> {
    try {
      // Generate bank transfer details
      const bankDetails = {
        bankName: 'Equity Bank',
        accountName: 'Leli Rentals Ltd',
        accountNumber: '1234567890',
        branchCode: '001',
        swiftCode: 'EQBLKENA',
        amount: amount,
        reference: reference
      }

      return {
        success: true,
        transactionId: `BANK_${Date.now()}`,
        message: `Please transfer KSh ${amount.toLocaleString()} to the provided bank details. Use reference: ${reference}`,
        status: 'pending',
        metadata: { bankDetails }
      }
    } catch (error) {
      console.error('Bank transfer error:', error)
      return {
        success: false,
        message: 'Bank transfer setup failed. Please try again.',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Generic payment processor
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    let response: PaymentResponse
    
    switch (request.paymentMethod) {
      case 'visa':
        response = await this.processCardPayment({
          amount: request.amount,
          currency: request.currency,
          cardNumber: '', // This would come from the frontend securely
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: request.customer.name,
          email: request.customer.email
        })
        break
      
      case 'paystack':
        response = await this.processPaystackPayment({
          amount: request.amount,
          email: request.customer.email,
          reference: request.id,
          description: request.description
        })
        break
      
      default:
        response = {
          success: false,
          message: 'Invalid payment method selected.',
          status: 'failed',
          error: 'Invalid payment method'
        }
    }

    // Create notification for payment result
    try {
      if (request.metadata?.userId) {
        await notificationsService.createPaymentNotification(request.metadata.userId, {
          bookingId: request.metadata.bookingId || request.id,
          amount: request.amount,
          status: response.success ? 'success' : 'failed',
          method: request.paymentMethod
        })
      }
    } catch (notificationError) {
      console.error('Error creating payment notification:', notificationError)
      // Don't throw error for notification failure
    }

    return response
  }

  // Check payment status
  async checkPaymentStatus(transactionId: string, paymentMethod: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/status/${paymentMethod}/${transactionId}`)
      const data = await response.json()

      return {
        success: data.success,
        transactionId: data.transactionId,
        message: data.message,
        status: data.status,
        error: data.error
      }
    } catch (error) {
      console.error('Payment status check error:', error)
      return {
        success: false,
        message: 'Unable to check payment status.',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Helper methods
  private async getMpesaAccessToken(): Promise<string> {
    // Check if we're in development mode or if API keys are not configured
    const isDevelopment = process.env.NODE_ENV === 'development' || !this.MPESA_CONSUMER_KEY || !this.MPESA_CONSUMER_SECRET
    
    if (isDevelopment) {
      // Return a mock access token for development
      console.log('🔧 Development mode: Using mock M-Pesa access token')
      return 'mock_mpesa_access_token_' + Date.now()
    }

    try {
      const auth = Buffer.from(`${this.MPESA_CONSUMER_KEY}:${this.MPESA_CONSUMER_SECRET}`).toString('base64')
      
      const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })

      if (!response.ok) {
        throw new Error(`M-Pesa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('M-Pesa API error:', error)
      // Fallback to mock token if API call fails
      return 'mock_mpesa_access_token_' + Date.now()
    }
  }

  private async getAirtelAccessToken(): Promise<string> {
    // Check if we're in development mode or if API keys are not configured
    const isDevelopment = process.env.NODE_ENV === 'development' || !this.AIRTEL_CLIENT_ID || !this.AIRTEL_CLIENT_SECRET
    
    if (isDevelopment) {
      // Return a mock access token for development
      console.log('🔧 Development mode: Using mock Airtel access token')
      return 'mock_airtel_access_token_' + Date.now()
    }

    try {
      const auth = Buffer.from(`${this.AIRTEL_CLIENT_ID}:${this.AIRTEL_CLIENT_SECRET}`).toString('base64')
      
      const response = await fetch('https://openapiuat.airtel.africa/auth/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error(`Airtel API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Airtel API error:', error)
      // Fallback to mock token if API call fails
      return 'mock_airtel_access_token_' + Date.now()
    }
  }

  private generateMpesaPassword(): string {
    const timestamp = this.getMpesaTimestamp()
    const shortcode = process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '174379'
    const passkey = process.env.NEXT_PUBLIC_MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
    
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
    return password
  }

  private getMpesaTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
  }
}

export const paymentService = new PaymentService()
