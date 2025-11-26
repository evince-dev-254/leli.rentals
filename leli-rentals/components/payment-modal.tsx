"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InternationalPhoneInput from '@/components/international-phone-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { paymentService, PaymentMethod, PaymentRequest } from '@/lib/payment-service'
import PaystackPayment from '@/components/paystack-payment'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Phone,
  Mail,
  User,
  Shield,
  Zap
} from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id?: string
    name: string
    price: number
    currency: string
    description: string
    features: string[]
    billingCycle?: 'monthly' | 'yearly'
  }
  onPaymentSuccess?: (transactionId: string) => void
}

export default function PaymentModal({ isOpen, onClose, plan, onPaymentSuccess }: PaymentModalProps) {
  const { toast } = useToast()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  })

  const allPaymentMethods: PaymentMethod[] = paymentService.getPaymentMethods()

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      })
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive"
      })
      return
    }

    // Handle Paystack payment separately
    if (selectedMethod === 'paystack') {
      // Paystack will handle the payment flow
      return
    }

    if (selectedMethod === 'card' && (!cardInfo.cardNumber || !cardInfo.cvv || !cardInfo.cardholderName)) {
      toast({
        title: "Missing Card Information",
        description: "Please fill in all card details.",
        variant: "destructive"
      })
      return
    }

    if ((selectedMethod === 'mpesa' || selectedMethod === 'airtel') && !customerInfo.phone) {
      toast({
        title: "Missing Phone Number",
        description: "Please provide your phone number for mobile payments.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      const paymentRequest: PaymentRequest = {
        id: `plan_${Date.now()}`,
        amount: plan.price,
        currency: plan.currency,
        description: `${plan.name} subscription`,
        customer: customerInfo,
        paymentMethod: selectedMethod,
        metadata: {
          plan: plan.name,
          features: plan.features
        }
      }

      const result = await paymentService.processPayment(paymentRequest)

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: result.message,
        })
        
        // Call success callback with transaction ID
        if (onPaymentSuccess && result.transactionId) {
          onPaymentSuccess(result.transactionId)
        }
        
        // Close modal after successful payment
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        toast({
          title: "Payment Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.id === 'paystack') {
      return <Zap className="h-5 w-5 text-blue-600" />
    }
    
    switch (method.type) {
      case 'mpesa':
        return <Smartphone className="h-5 w-5 text-green-600" />
      case 'airtel':
        return <Smartphone className="h-5 w-5 text-red-600" />
      case 'card':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'bank_transfer':
        return <Building2 className="h-5 w-5 text-purple-600" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Complete your {plan.name} subscription payment securely
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{plan.currency} {plan.price.toLocaleString()}</div>
                  <Badge variant="secondary">One-time payment</Badge>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-1">
                <h4 className="font-medium text-sm">What's included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <InternationalPhoneInput
                  value={customerInfo.phone}
                  onChange={(phone) => setCustomerInfo(prev => ({ ...prev, phone }))}
                  placeholder="Enter your phone number (required for mobile payments)"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold">Choose Payment Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allPaymentMethods.map((method) => (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    selectedMethod === method.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(method)}
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        {method.fees && (
                          <div className="text-sm text-muted-foreground">
                            {method.fees.percentage > 0 && `${method.fees.percentage}% fee`}
                            {method.fees.fixed > 0 && ` + ${method.fees.fixed} KSh`}
                            {method.fees.percentage === 0 && method.fees.fixed === 0 && 'No fees'}
                          </div>
                        )}
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Paystack Payment (shown only when Paystack is selected) */}
          {selectedMethod === 'paystack' && (
            <PaystackPayment
              amount={plan.price}
              currency={plan.currency}
              email={customerInfo.email}
              description={plan.description}
              onSuccess={(response) => {
                toast({
                  title: "Payment Successful!",
                  description: "Your subscription has been activated.",
                })
                onClose()
              }}
              onError={(error) => {
                toast({
                  title: "Payment Failed",
                  description: "Please try again or contact support.",
                  variant: "destructive",
                })
              }}
              onClose={() => {
                toast({
                  title: "Payment Cancelled",
                  description: "Payment was cancelled.",
                })
              }}
            />
          )}

          {/* Card Details (shown only when card is selected) */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Card Details
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''))
                      setCardInfo(prev => ({ ...prev, cardNumber: formatted }))
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Expiry Month</Label>
                    <Input
                      id="expiryMonth"
                      value={cardInfo.expiryMonth}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, expiryMonth: e.target.value }))}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Expiry Year</Label>
                    <Input
                      id="expiryYear"
                      value={cardInfo.expiryYear}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, expiryYear: e.target.value }))}
                      placeholder="YY"
                      maxLength={2}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={cardInfo.cardholderName}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                      placeholder="Name on card"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Instructions for Mobile Money */}
          {(selectedMethod === 'mpesa' || selectedMethod === 'airtel') && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {selectedMethod === 'mpesa' ? 'M-Pesa Payment Instructions' : 'Airtel Money Payment Instructions'}
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                After clicking "Pay Now", you'll receive a prompt on your phone to complete the payment. 
                Enter your {selectedMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} PIN to authorize the transaction.
              </p>
            </div>
          )}

          {/* Bank Transfer Instructions */}
          {selectedMethod === 'bank_transfer' && (
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Bank Transfer Instructions
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                After clicking "Pay Now", you'll receive bank transfer details. 
                Complete the transfer and your account will be activated within 24 hours.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {/* Hide payment button when Paystack is selected */}
          {selectedMethod !== 'paystack' && (
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${plan.currency} ${plan.price.toLocaleString()}`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
