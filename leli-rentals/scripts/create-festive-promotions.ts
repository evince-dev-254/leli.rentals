import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PromotionData {
    id: string
    title: string
    description: string
    discount_percentage: number
    code?: string
    min_booking_amount?: number
    start_date: string
    end_date: string
    category?: string
}

// Festive season promotions data
const festivePromotions: PromotionData[] = [
    {
        id: randomUUID(),
        title: "🎄 Festive Season Special - 25% Off!",
        description: "Celebrate the holidays with 25% off all rentals this festive season! Perfect for your holiday events and celebrations.",
        discount_percentage: 25,
        code: "FESTIVE25",
        min_booking_amount: 5000,
        start_date: "2024-12-15T00:00:00.000Z",
        end_date: "2025-01-15T23:59:59.999Z"
    },
    {
        id: randomUUID(),
        title: "🎊 New Year Celebration - 30% Off!",
        description: "Ring in the new year with incredible savings! Get 30% off premium rentals for your NYE celebrations.",
        discount_percentage: 30,
        code: "NEWYEAR30",
        min_booking_amount: 8000,
        start_date: "2024-12-28T00:00:00.000Z",
        end_date: "2025-01-10T23:59:59.999Z"
    },
    {
        id: randomUUID(),
        title: "🎁 Holiday Gift Special - 20% Off!",
        description: "Make this holiday season special with our gift-friendly 20% discount on all rental categories.",
        discount_percentage: 20,
        code: "HOLIDAY20",
        min_booking_amount: 3000,
        start_date: "2024-12-01T00:00:00.000Z",
        end_date: "2025-01-05T23:59:59.999Z"
    }
]

// Category-specific festive promotions
const categoryPromotions: PromotionData[] = [
    {
        id: randomUUID(),
        title: "🏠 Luxury Apartment Rentals - Festive Deal",
        description: "Exclusive 35% off luxury apartment rentals for the festive season. Perfect for family gatherings and holiday stays.",
        discount_percentage: 35,
        code: "LUXURY35",
        min_booking_amount: 15000,
        start_date: "2024-12-20T00:00:00.000Z",
        end_date: "2025-01-15T23:59:59.999Z",
        category: "apartments"
    },
    {
        id: randomUUID(),
        title: "🚗 Premium Car Rentals - Holiday Special",
        description: "Drive in style this festive season with 40% off premium car rentals. Available for NYE and holiday trips.",
        discount_percentage: 40,
        code: "CAR40",
        min_booking_amount: 10000,
        start_date: "2024-12-25T00:00:00.000Z",
        end_date: "2025-01-12T23:59:59.999Z",
        category: "cars"
    },
    {
        id: randomUUID(),
        title: "📸 Event Equipment - Party Ready",
        description: "Get your event equipment ready for the holidays with 30% off cameras, audio equipment, and more.",
        discount_percentage: 30,
        code: "EVENT30",
        min_booking_amount: 5000,
        start_date: "2024-12-10T00:00:00.000Z",
        end_date: "2025-01-08T23:59:59.999Z",
        category: "electronics"
    }
]

async function createSpecialOffers() {
    console.log("🎄 Creating festive season special offers...")
    
    for (const promotion of [...festivePromotions, ...categoryPromotions]) {
        try {
            const { data, error } = await supabase
                .from('special_offers')
                .insert({
                    id: promotion.id,
                    owner_id: '00000000-0000-0000-0000-000000000000', // System-wide offers
                    listing_id: null, // Owner-wide offers
                    title: promotion.title,
                    description: promotion.description,
                    discount_percentage: promotion.discount_percentage,
                    start_date: promotion.start_date,
                    end_date: promotion.end_date,
                    is_active: true,
                    views_count: 0,
                    bookings_generated: 0
                })
                .select()
                .single()

            if (error) {
                console.error(`❌ Error creating special offer "${promotion.title}":`, error.message)
            } else {
                console.log(`✅ Created special offer: ${promotion.title} (${promotion.discount_percentage}% off)`)
            }
        } catch (error) {
            console.error(`❌ Unexpected error creating special offer "${promotion.title}":`, error)
        }
    }
}

async function createFestiveCoupons() {
    console.log("🎁 Creating festive season coupons...")
    
    for (const promotion of [...festivePromotions, ...categoryPromotions]) {
        if (!promotion.code) continue
        
        try {
            const { data, error } = await supabase
                .from('coupons')
                .insert({
                    id: randomUUID(),
                    owner_id: '00000000-0000-0000-0000-000000000000', // System-wide coupons
                    code: promotion.code,
                    description: promotion.description,
                    discount_type: 'percentage',
                    discount_value: promotion.discount_percentage,
                    min_booking_amount: promotion.min_booking_amount || 0,
                    max_uses: 1000, // Allow up to 1000 uses
                    current_uses: 0,
                    start_date: promotion.start_date,
                    expiry_date: promotion.end_date,
                    is_active: true
                })
                .select()
                .single()

            if (error) {
                console.error(`❌ Error creating coupon "${promotion.code}":`, error.message)
            } else {
                console.log(`✅ Created coupon: ${promotion.code} (${promotion.discount_percentage}% off)`)
            }
        } catch (error) {
            console.error(`❌ Unexpected error creating coupon "${promotion.code}":`, error)
        }
    }
}

async function main() {
    try {
        console.log("🎄 Starting festive season promotion setup...")
        console.log(`📅 Creating ${festivePromotions.length + categoryPromotions.length} special offers`)
        console.log(`🎁 Creating ${festivePromotions.length + categoryPromotions.length} corresponding coupons`)
        
        await createSpecialOffers()
        await createFestiveCoupons()
        
        console.log("\n🎉 Festive season promotions created successfully!")
        console.log("\n📋 Available Promotions:")
        console.log("━".repeat(50))
        
        for (const promotion of [...festivePromotions, ...categoryPromotions]) {
            console.log(`• ${promotion.title}`)
            if (promotion.code) {
                console.log(`  Code: ${promotion.code}`)
            }
            console.log(`  Discount: ${promotion.discount_percentage}% off`)
            console.log(`  Valid: ${new Date(promotion.start_date).toLocaleDateString()} - ${new Date(promotion.end_date).toLocaleDateString()}`)
            console.log("")
        }
        
        console.log("🎊 Happy holidays and successful bookings! 🎊")
    } catch (error) {
        console.error("❌ Fatal error during promotion setup:", error)
        process.exit(1)
    }
}

// Run the script
if (require.main === module) {
    main()
}

export { main as createFestivePromotions }