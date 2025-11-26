"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Tag, Copy, ArrowRight, Loader2, Sparkles } from "lucide-react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { couponService } from "@/lib/coupon-service"

export default function DealsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [deals, setDeals] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const data = await couponService.getActiveDeals()
                setDeals(data || [])
            } catch (error) {
                console.error("Error fetching deals:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDeals()
    }, [])

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast({
            title: "Code Copied!",
            description: `${code} has been copied to your clipboard.`
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <div className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-yellow-300" />
                        Exclusive Deals & Offers
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Save on your next rental with these limited-time offers. Copy a code and apply it at checkout!
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {deals.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <Tag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No active deals right now</h3>
                        <p className="text-gray-500 mt-2">Check back later for new offers!</p>
                        <Button
                            className="mt-6"
                            onClick={() => router.push('/listings')}
                        >
                            Browse Listings
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals.map((deal) => (
                            <Card key={deal.id} className="flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                            {deal.discount_type === 'percentage'
                                                ? `${deal.discount_value}% OFF`
                                                : `KSh ${deal.discount_value} OFF`}
                                        </Badge>
                                        {deal.expiry_date && (
                                            <span className="text-xs text-gray-500">
                                                Expires {format(new Date(deal.expiry_date), 'MMM d')}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-gray-900">
                                        {deal.code}
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        {deal.description || "Special discount for you!"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {deal.min_booking_amount > 0 && (
                                            <p>• Min. booking: KSh {deal.min_booking_amount}</p>
                                        )}
                                        <p>• Valid for select listings</p>
                                        {deal.owner && (
                                            <p className="flex items-center gap-2 mt-4 pt-4 border-t">
                                                <span className="text-xs text-gray-400">Offered by</span>
                                                <span className="font-medium text-gray-900">{deal.owner.name}</span>
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gray-50 p-4 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => copyCode(deal.code)}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Code
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={() => router.push('/listings')}
                                    >
                                        Book Now
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
