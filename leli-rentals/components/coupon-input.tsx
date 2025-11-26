import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tag, X } from 'lucide-react'
import { useState } from 'react'

interface CouponInputProps {
    onCouponApplied: (coupon: AppliedCoupon) => void
    onCouponRemoved: () => void
    listingId: string
    bookingAmount: number
}

export interface AppliedCoupon {
    code: string
    discountAmount: number
    discountType: 'percentage' | 'fixed'
    discountValue: number
}

export function CouponInput({
    onCouponApplied,
    onCouponRemoved,
    listingId,
    bookingAmount
}: CouponInputProps) {
    const [couponCode, setCouponCode] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const [error, setError] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code')
            return
        }

        setIsValidating(true)
        setError('')

        try {
            const response = await fetch('/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode.toUpperCase(),
                    listingId,
                    bookingAmount
                })
            })

            const data = await response.json()

            if (!response.ok || !data.valid) {
                setError(data.error || 'Invalid coupon code')
                return
            }

            const appliedCouponData: AppliedCoupon = {
                code: couponCode.toUpperCase(),
                discountAmount: data.discountAmount,
                discountType: data.coupon.discount_type,
                discountValue: data.coupon.discount_value
            }

            setAppliedCoupon(appliedCouponData)
            onCouponApplied(appliedCouponData)
            setCouponCode('')
        } catch (error) {
            console.error('Error validating coupon:', error)
            setError('Failed to validate coupon. Please try again.')
        } finally {
            setIsValidating(false)
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setError('')
        onCouponRemoved()
    }

    if (appliedCoupon) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Tag className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-green-900">Coupon Applied!</div>
                            <div className="text-sm text-green-700">
                                Code: <span className="font-mono font-semibold">{appliedCoupon.code}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm text-green-600">Discount</div>
                            <div className="text-lg font-bold text-green-900">
                                -KSh {appliedCoupon.discountAmount.toLocaleString()}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveCoupon}
                            className="text-gray-500 hover:text-red-600"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Have a coupon code?</label>
            </div>
            <div className="flex gap-2">
                <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setError('')
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleApplyCoupon()
                        }
                    }}
                    className={`flex-1 uppercase ${error ? 'border-red-500' : ''}`}
                />
                <Button
                    onClick={handleApplyCoupon}
                    disabled={isValidating || !couponCode.trim()}
                >
                    {isValidating ? 'Validating...' : 'Apply'}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="font-medium">✗</span>
                    {error}
                </p>
            )}
        </div>
    )
}
