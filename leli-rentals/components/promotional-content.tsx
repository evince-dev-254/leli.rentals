"use client"

import { useEffect, useState } from 'react'
import { SpecialOfferBanner } from '@/components/special-offer-banner'
import { CouponCard } from '@/components/coupon-card'

interface Coupon {
    id: string
    code: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    description: string
    valid_until: string
    min_purchase_amount?: number
}

interface SpecialOffer {
    id: string
    title: string
    description: string
    discount_percentage: number
    end_date: string
    image_url?: string
}

export function PromotionalContent() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPromotions() {
            try {
                // Fetch active coupons
                const couponsRes = await fetch('/api/coupons/active')
                if (couponsRes.ok) {
                    const couponsData = await couponsRes.json()
                    setCoupons(couponsData)
                }

                // Fetch active special offers
                const offersRes = await fetch('/api/special-offers/active')
                if (offersRes.ok) {
                    const offersData = await offersRes.json()
                    setSpecialOffers(offersData)
                }
            } catch (error) {
                console.error('Error fetching promotions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPromotions()
    }, [])

    if (loading) return null

    return (
        <>
            {/* Special Offer Banner at Top */}
            {specialOffers.length > 0 && (
                <SpecialOfferBanner
                    title={specialOffers[0].title}
                    description={specialOffers[0].description}
                    discountPercentage={specialOffers[0].discount_percentage}
                    expiryDate={specialOffers[0].end_date}
                    imageUrl={specialOffers[0].image_url}
                />
            )}

            {/* Coupon Cards Section (to be placed at bottom of home page) */}
            {coupons.length > 0 && (
                <section className="py-12 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                🎁 Exclusive Coupons
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Save big with our limited-time offers!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coupons.map((coupon) => (
                                <CouponCard
                                    key={coupon.id}
                                    code={coupon.code}
                                    discountType={coupon.discount_type}
                                    discountValue={coupon.discount_value}
                                    description={coupon.description}
                                    expiryDate={coupon.valid_until}
                                    minPurchase={coupon.min_purchase_amount}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}
