'use client'

import { useState, useEffect } from 'react'
import { Snowflake, Gift, Calendar, Star } from 'lucide-react'

interface FestivePromotion {
  id: string
  title: string
  description: string
  code?: string
  discount: number
  minAmount?: number
  validUntil: string
  isActive: boolean
}

// Festive season promotions (hardcoded for demo, should come from API)
const festivePromotions: FestivePromotion[] = [
  {
    id: 'festive-25',
    title: '🎄 Festive Season Special',
    description: 'Celebrate the holidays with 25% off all rentals! Perfect for your holiday events and celebrations.',
    code: 'FESTIVE25',
    discount: 25,
    minAmount: 5000,
    validUntil: '2025-01-15',
    isActive: true
  },
  {
    id: 'newyear-30',
    title: '🎊 New Year Celebration',
    description: 'Ring in the new year with incredible savings! Get 30% off premium rentals.',
    code: 'NEWYEAR30',
    discount: 30,
    minAmount: 8000,
    validUntil: '2025-01-10',
    isActive: true
  },
  {
    id: 'luxury-35',
    title: '🏠 Luxury Apartment Deal',
    description: 'Exclusive 35% off luxury apartment rentals for festive family gatherings.',
    code: 'LUXURY35',
    discount: 35,
    minAmount: 15000,
    validUntil: '2025-01-15',
    isActive: true
  }
]

interface FestivePromoBannerProps {
  onApplyPromotion?: (code: string, promotion: FestivePromotion) => void
  className?: string
}

export function FestivePromoBanner({ onApplyPromotion, className = '' }: FestivePromoBannerProps) {
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const currentPromotion = festivePromotions[currentPromotionIndex]

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentPromotionIndex((prev) => (prev + 1) % festivePromotions.length)
    }, 5000) // Rotate every 5 seconds

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible || !currentPromotion.isActive) return null

  const handleApplyPromotion = () => {
    if (currentPromotion.code && onApplyPromotion) {
      onApplyPromotion(currentPromotion.code, currentPromotion)
    }
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-red-600 via-green-600 to-red-600 p-4 rounded-lg shadow-lg ${className}`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-4 animate-bounce">
          <Snowflake className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-4 right-6 animate-pulse">
          <Gift className="w-8 h-8 text-yellow-300" />
        </div>
        <div className="absolute bottom-3 left-8 animate-spin">
          <Star className="w-5 h-5 text-yellow-200" />
        </div>
        <div className="absolute bottom-1 right-4 animate-bounce delay-300">
          <Snowflake className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{currentPromotion.title}</h3>
            <span className="px-2 py-1 bg-yellow-400 text-red-800 text-xs font-bold rounded-full animate-pulse">
              {currentPromotion.discount}% OFF
            </span>
          </div>
          
          <p className="text-white/90 text-sm mb-3">{currentPromotion.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Valid until {new Date(currentPromotion.validUntil).toLocaleDateString()}</span>
            </div>
            {currentPromotion.minAmount && (
              <div className="flex items-center gap-1">
                <span>Min: KSh {currentPromotion.minAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {currentPromotion.code && (
            <div className="text-center">
              <div className="text-white/70 text-xs mb-1">Use Code:</div>
              <div className="bg-black/30 px-3 py-1 rounded border border-white/30">
                <span className="text-yellow-300 font-mono font-bold text-lg tracking-wider">
                  {currentPromotion.code}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleApplyPromotion}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-red-800 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Promotion indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {festivePromotions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPromotionIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentPromotionIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full text-white/80 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
  )
}

interface CouponInputProps {
  onValidate?: (code: string, listingId: string, amount: number) => Promise<{
    valid: boolean
    discount?: number
    error?: string
  }>
  listingId?: string
  bookingAmount?: number
  placeholder?: string
  className?: string
}

export function CouponInput({ 
  onValidate,
  listingId = 'default-listing',
  bookingAmount = 0,
  placeholder = "Enter coupon code",
  className = ""
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    discount?: number
    error?: string
  } | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<FestivePromotion | null>(null)

  const handleValidate = async () => {
    if (!couponCode.trim()) return

    setIsValidating(true)
    setValidationResult(null)

    try {
      // If custom validator provided, use it
      if (onValidate) {
        const result = await onValidate(couponCode, listingId, bookingAmount)
        setValidationResult(result)
        
        if (result.valid) {
          // Create applied promotion object
          setAppliedCoupon({
            id: 'applied',
            title: 'Applied Coupon',
            description: 'Discount applied successfully',
            code: couponCode.toUpperCase(),
            discount: result.discount || 0,
            validUntil: '',
            isActive: true
          })
        }
      } else {
        // Built-in validation for festive season codes
        const matchedPromotion = festivePromotions.find(
          promo => promo.code?.toLowerCase() === couponCode.toLowerCase() && 
                  promo.isActive &&
                  new Date(promo.validUntil) > new Date()
        )

        if (matchedPromotion) {
          if (bookingAmount >= (matchedPromotion.minAmount || 0)) {
            const discount = (bookingAmount * matchedPromotion.discount) / 100
            setValidationResult({ valid: true, discount })
            setAppliedCoupon(matchedPromotion)
          } else {
            setValidationResult({ 
              valid: false, 
              error: `Minimum booking amount of KSh ${matchedPromotion.minAmount?.toLocaleString()} required` 
            })
          }
        } else {
          setValidationResult({ valid: false, error: 'Invalid or expired coupon code' })
        }
      }
    } catch (error) {
      setValidationResult({ valid: false, error: 'Failed to validate coupon' })
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setValidationResult(null)
    setAppliedCoupon(null)
  }

  if (appliedCoupon) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-green-800">🎉 Coupon Applied!</h4>
            <p className="text-sm text-green-600">
              {appliedCoupon.code} - {appliedCoupon.discount}% discount
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
        />
        <button
          onClick={handleValidate}
          disabled={!couponCode.trim() || isValidating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isValidating ? 'Validating...' : 'Apply'}
        </button>
      </div>
      
      {validationResult && (
        <div className={`p-3 rounded-lg text-sm ${
          validationResult.valid 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {validationResult.valid ? (
            <div className="flex items-center gap-2">
              <span>✅ Valid coupon! Discount: KSh {validationResult.discount?.toLocaleString()}</span>
            </div>
          ) : (
            <span>❌ {validationResult.error}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default FestivePromoBanner