"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Zap
} from 'lucide-react'
import { paystackService, PaystackConfig } from '@/lib/paystack-service'
import { useToast } from '@/hooks/use-toast'

interface PaystackPaymentProps {
  amount: number
  currency?: string
  email: string
  description: string
  onSuccess?: (response: any) => void
  onError?: (error: any) => void
  onClose?: () => void
  className?: string
}

export function PaystackPayment({
  amount,
  currency = 'KES',
  email,
  description,
  onSuccess,
  onError,
  onClose,
  className = ''
}: PaystackPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('card')
  const [customerEmail, setCustomerEmail] = useState(email)
  const [customerPhone, setCustomerPhone] = useState('')
  const { toast } = useToast()

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Visa, Mastercard, American Express',
      available: true
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'M-Pesa, Airtel Money, Pesapal',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Direct bank transfer',
      available: true
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCode className="h-5 w-5" />,
      description: 'Scan QR code to pay',
      available: true
    }
  ]

  const handlePayment = async () => {
    if (!customerEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const amountInKobo = paystackService.convertToKobo(amount, currency)
      const reference = paystackService.generateReference()

      // Determine channels based on selected payment method
      let channels: string[] = []
      if (selectedMethod === 'mobile_money') {
        // Enable all mobile money channels for Kenya
        channels = ['mobile_money', 'mpesa', 'airtel', 'pesapal']
      } else if (selectedMethod === 'card') {
        channels = ['card']
      } else if (selectedMethod === 'bank_transfer') {
        channels = ['bank']
      } else if (selectedMethod === 'qr') {
        channels = ['qr']
      } else {
        // Default: enable all channels
        channels = ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'mpesa', 'airtel', 'pesapal']
      }

      const config: PaystackConfig = {
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: customerEmail,
        amount: amountInKobo,
        currency: currency,
        reference: reference,
        channels: channels, // Enable mobile money channels
        metadata: {
          description: description,
          phone: customerPhone,
          payment_method: selectedMethod,
          source: 'leli_rentals'
        },
        callback: (response) => {
          console.log('Paystack payment successful:', response)
          setIsProcessing(false)
          
          if (response.status === 'success') {
            toast({
              title: "Payment Successful!",
              description: "Your payment has been processed successfully.",
            })
            
            if (onSuccess) {
              onSuccess(response)
            }
          } else {
            toast({
              title: "Payment Failed",
              description: response.message || "Payment could not be processed.",
              variant: "destructive",
            })
            
            if (onError) {
              onError(response)
            }
          }
        },
        onClose: () => {
          console.log('Paystack payment closed')
          setIsProcessing(false)
          
          if (onClose) {
            onClose()
          }
        }
      }

      paystackService.initializePayment(config)
    } catch (error) {
      console.error('Payment initialization error:', error)
      setIsProcessing(false)
      
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
      
      if (onError) {
        onError(error)
      }
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-blue-600" />
            Payment Summary
          </CardTitle>
          <CardDescription>Review your payment details before proceeding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatAmount(amount, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Description:</span>
            <span className="font-medium">{description}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Method:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {paystackService.getPaymentMethodDisplayName(selectedMethod)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
          <CardDescription>Enter your contact details for payment processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254 700 000 000"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => method.available && setSelectedMethod(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-0 shadow-lg bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Secure Payment</div>
              <div className="text-sm text-green-700">
                Your payment is processed securely by Paystack. We never store your payment details.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || !customerEmail.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay {formatAmount(amount, currency)}
          </>
        )}
      </Button>

      {/* Payment Methods Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Supported payment methods: Card, M-Pesa, Airtel Money, Pesapal, Bank Transfer, QR Code</p>
        <p className="mt-1">Powered by Paystack • Secure & Reliable</p>
      </div>
    </div>
  )
}

export default PaystackPayment
