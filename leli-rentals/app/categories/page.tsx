"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Car, Home, Camera, Dumbbell, Laptop, Shirt, Music, Gamepad2,
  Wrench, Palette, Book, Heart, Search, Filter, Star, Users,
  TrendingUp, Shield, Clock, MapPin, DollarSign, ChevronRight,
  ArrowRight, Sparkles, Zap, Award, CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"

// Comprehensive category data for Leli Rentals with images
const categories = [
  {
    id: "vehicles",
    name: "Vehicles",
    description: "Cars, motorcycles, trucks, and more",
    image: "/images/Luxury Sports Car.jpg",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    popular: true,
    count: "1,200+",
    subcategories: ["Sedans", "SUVs", "Trucks", "Motorcycles", "Luxury Cars", "Electric Vehicles"],
    features: ["Insurance included", "24/7 support", "Flexible pickup"]
  },
  {
    id: "homes",
    name: "Homes & Apartments",
    description: "Short-term rentals and vacation homes",
    image: "/images/modern-apartment-rental.jpg",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    popular: true,
    count: "800+",
    subcategories: ["Apartments", "Houses", "Condos", "Studios", "Penthouses", "Vacation Rentals"],
    features: ["Fully furnished", "Utilities included", "Flexible terms"]
  },
  {
    id: "equipment",
    name: "Equipment & Tools",
    description: "Professional and DIY equipment",
    image: "/images/professional-equipment-rental.jpg",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    popular: true,
    count: "2,500+",
    subcategories: ["Power Tools", "Construction", "Gardening", "Cleaning", "Audio/Video", "Photography"],
    features: ["Professional grade", "Delivery available", "Training included"]
  },
  {
    id: "electronics",
    name: "Electronics & Tech",
    description: "Gadgets, computers, and tech accessories",
    image: "/images/electronics-rental.jpg",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    popular: true,
    count: "1,800+",
    subcategories: ["Laptops", "Phones", "Cameras", "Gaming", "Audio", "Smart Home"],
    features: ["Latest models", "Warranty included", "Tech support"]
  },
  {
    id: "sports",
    name: "Sports & Recreation",
    description: "Sports equipment and recreational gear",
    image: "/images/Mountain Bike.jpg",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    popular: false,
    count: "900+",
    subcategories: ["Fitness", "Outdoor", "Water Sports", "Winter Sports", "Team Sports", "Adventure"],
    features: ["Professional quality", "Safety certified", "Maintenance included"]
  },
  {
    id: "fashion",
    name: "Fashion & Accessories",
    description: "Clothing, jewelry, and style accessories",
    image: "/images/Designer Dress Collection.jpg",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    popular: false,
    count: "1,100+",
    subcategories: ["Formal Wear", "Casual", "Jewelry", "Bags", "Shoes", "Accessories"],
    features: ["Designer brands", "Size matching", "Styling advice"]
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Music, gaming, and entertainment equipment",
    image: "/images/Gaming Setup.jpg",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    popular: false,
    count: "600+",
    subcategories: ["Musical Instruments", "Gaming", "Party Equipment", "Books", "Movies", "Art Supplies"],
    features: ["Professional setup", "Delivery & setup", "Expert guidance"]
  },
  {
    id: "photography",
    name: "Photography & Video",
    description: "Cameras, lighting, and production equipment",
    image: "/images/Vintage Camera Collection.jpg",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    popular: false,
    count: "400+",
    subcategories: ["Cameras", "Lenses", "Lighting", "Audio", "Accessories", "Drones"],
    features: ["Professional gear", "Technical support", "Insurance included"]
  }
]

const popularCategories = categories.filter(cat => cat.popular)
const otherCategories = categories.filter(cat => !cat.popular)

export default function CategoriesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.subcategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Navigate to listings with category filter
    router.push(`/listings?category=${categoryId}`)
  }

  const handleGetStarted = () => {
    if (user) {
      router.push('/onboarding')
    } else {
      router.push('/signup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Discover Amazing Rentals
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              What would you like to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                rent today?
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose from thousands of items across multiple categories.
              From vehicles to equipment, find exactly what you need for your next adventure.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search categories or items..."
                  className="pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm sm:text-base font-medium">10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm sm:text-base font-medium">8,000+ Items Available</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-sm sm:text-base font-medium">100% Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Start with our most popular rental categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {popularCategories.map((category) => (
              <Card
                key={category.id}
                className={`group cursor-pointer border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl ${category.borderColor} ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {category.count} items
                    </Badge>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">Popular</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {category.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full mt-4 bg-gradient-to-r ${category.color} hover:opacity-90 text-white`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategorySelect(category.id)
                    }}
                  >
                    Explore
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Categories
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Browse all available rental categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className={`group cursor-pointer border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg ${category.borderColor} ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                        {category.popular && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs">Popular</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategorySelect(category.id)
                    }}
                  >
                    View Items
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="mb-6">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Renting?
                </h2>
                <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
                  Join thousands of users who trust Leli Rentals for their rental needs.
                  Get started in minutes with our simple onboarding process.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
                  onClick={handleGetStarted}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 font-semibold transition-all duration-200"
                  onClick={() => router.push('/about')}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}


