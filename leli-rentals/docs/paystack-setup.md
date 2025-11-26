# Paystack Integration Setup

This guide will help you set up Paystack payments for Leli Rentals.

## What is Paystack?

Paystack is a payment gateway that supports multiple payment methods including:
- Credit/Debit Cards (Visa, Mastercard, American Express)
- Mobile Money (M-Pesa, Airtel Money, MTN Mobile Money)
- Bank Transfers
- USSD
- QR Code payments

## Setup Steps

### 1. Create Paystack Account

1. Go to [Paystack](https://paystack.com/)
2. Sign up for an account
3. Complete the verification process
4. Access your dashboard

### 2. Get API Keys

1. Go to Settings → Developers in your Paystack dashboard
2. Copy your **Public Key** and **Secret Key**
3. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

### 3. Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_6b5af019feb0a47dc1c2cfdbb6c8ed6fc5eecf85
PAYSTACK_SECRET_KEY=sk_test_493eee98186340a114551307307fbd2be958af4c
```

**Important Notes:**
- The public key starts with `NEXT_PUBLIC_` so it can be used in the browser
- The secret key should NOT have `NEXT_PUBLIC_` prefix for security
- Never commit your `.env.local` file to version control

### 4. Enable Mobile Money in Paystack Dashboard

1. Log in to your Paystack dashboard
2. Go to Settings → Payment Methods
3. Enable the following mobile money options:
   - ✅ M-Pesa (Kenya)
   - ✅ Airtel Money (Kenya)
   - ✅ Pesapal (Kenya)
4. Save your settings

The app is already configured to use these mobile money channels when users select "Mobile Money" as their payment method.

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Go to the pricing page: `/profile/billing`
3. Click on "Plans & Pricing" tab
4. Select a paid plan
5. Choose "Paystack (Recommended)" as payment method
6. Test with Paystack's test card numbers:
   - **Success**: 4084084084084085
   - **Declined**: 4084084084084086
   - **Insufficient Funds**: 4084084084084087

### 6. Go Live

When ready for production:

1. Switch to live keys in Paystack dashboard
2. Update your environment variables with live keys
3. Test with real payment methods
4. Configure webhooks for payment notifications

## Features Included

### Payment Methods Supported
- ✅ Credit/Debit Cards
- ✅ Mobile Money (M-Pesa, Airtel Money, Pesapal)
- ✅ Bank Transfers
- ✅ USSD
- ✅ QR Code

### Security Features
- ✅ PCI DSS compliant
- ✅ 3D Secure authentication
- ✅ Fraud detection
- ✅ Secure tokenization

### User Experience
- ✅ One-click payments
- ✅ Mobile-optimized interface
- ✅ Multiple payment options
- ✅ Real-time payment status
- ✅ Automatic retry on failure

## Development Mode

The integration includes development mode handling:

- **No API Keys**: Falls back to mock responses
- **Development Environment**: Uses test keys automatically
- **Error Handling**: Graceful fallbacks for API failures
- **Console Logging**: Clear feedback for debugging

## Webhook Setup (Optional)

For production, set up webhooks to receive payment notifications:

1. Go to Settings → Webhooks in Paystack dashboard
2. Add webhook URL: `https://yourdomain.com/api/paystack/webhook`
3. Select events: `charge.success`, `charge.failed`
4. Implement webhook handler in your API routes

## Support

- **Paystack Documentation**: https://paystack.com/docs
- **API Reference**: https://paystack.com/docs/api
- **Test Cards**: https://paystack.com/docs/payments/test-payments

## Benefits of Paystack

1. **African Focus**: Optimized for African payment methods
2. **High Success Rates**: Better conversion than international gateways
3. **Local Support**: Customer support in local time zones
4. **Competitive Fees**: Lower fees than international alternatives
5. **Easy Integration**: Simple API and excellent documentation
6. **Mobile Money**: Native support for M-Pesa, Airtel Money, etc.
7. **Bank Transfers**: Direct bank integration
8. **Fraud Protection**: Built-in fraud detection and prevention

## Migration from Other Payment Methods

The Paystack integration works alongside existing payment methods:

- **M-Pesa**: Still available as fallback
- **Airtel Money**: Still available as fallback  
- **Card Payments**: Enhanced with Paystack
- **Bank Transfer**: Improved with Paystack integration

Users can choose their preferred payment method, with Paystack recommended for the best experience.
