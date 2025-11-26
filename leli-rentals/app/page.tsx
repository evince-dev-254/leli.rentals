"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FestiveBanner } from "@/components/festive-banner"
import { Button } from "@/components/ui/button"
import { VideoBackground } from "@/components/video-background"
import { ArrowRight, User, Car, Home, Wrench, Laptop, Shirt, Music, Camera, Star, TrendingUp, Users, Shield, CheckCircle, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useEffect } from "react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { createWelcomeNotification } from "@/lib/welcome-notification"

export default function HomePage() {
  return <HomePageContent />
}

function HomePageContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  // Check if user needs to select account type and redirect
  useEffect(() => {
    if (user && isLoaded) {
      const accountType = (user.publicMetadata?.accountType as string) ||
        (user.unsafeMetadata?.accountType as string)

      // If account type is not set or is 'not_selected', redirect to get-started
      if (!accountType || accountType === 'not_selected') {
        router.push('/get-started')
        return
      }

      // Check if this is a new sign-in (hasn't seen welcome notification)
      const hasSeenWelcome = localStorage.getItem(`welcome_${user.id}`)

      if (!hasSeenWelcome) {
        const userName = user.fullName || user.firstName || 'User'

        // Create welcome notification
        createWelcomeNotification(user.id, userName, accountType as 'renter' | 'owner')

        // Mark as seen
        localStorage.setItem(`welcome_${user.id}`, 'true')
      }
    }
  }, [user, isLoaded, router])

  // No automatic redirects - let users choose their path
  // They can click "Get Started" to begin onboarding

  const shouldShowGetStarted = !user

  return (
    <div className="min-h-screen bg-background transition-all duration-500">
      <Header />

      <VideoBackground
        src="/videos/rental-hero-video.mp4"
        fallbackImage="/modern-rental-marketplace-hero-with-cars--apartmen.jpg"
        className="h-screen flex items-center justify-center relative"
        overlayStyle="hero"
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 text-balance drop-shadow-lg fade-in-up leading-tight">
            Find Your Perfect Rental
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-12 text-pretty max-w-2xl mx-auto leading-relaxed drop-shadow-md fade-in-up stagger-1">
            Discover amazing rentals for every occasion.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>From cars to equipment, we've got you covered.
          </p>
        </div>
      </VideoBackground>

      <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose Leli Rentals?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the future of rentals with our modern platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Easy Search</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  Find exactly what you need with our powerful search and filtering system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Verified Listings</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  All our rentals are verified and quality-checked for your peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Instant Booking</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  Book instantly with our streamlined reservation system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Most Popular
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Popular Categories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our most popular rental categories with thousands of verified listings
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm sm:text-base font-medium">10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm sm:text-base font-medium">8,000+ Items Available</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-sm sm:text-base font-medium">100% Secure</span>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                id: "vehicles",
                name: "Vehicles",
                description: "Cars, motorcycles, trucks & more",
                count: "1,800+ listings",
                href: "/listings?category=vehicles",
                categoryHref: "/categories",
                image: "/luxury-cars-in-modern-showroom.jpg",
                icon: Car,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                textColor: "text-blue-600 dark:text-blue-400",
                borderColor: "border-blue-200 dark:border-blue-800",
                features: ["Insurance included", "24/7 support", "Flexible pickup"],
                popular: true
              },
              {
                id: "equipment",
                name: "Equipment",
                description: "Professional & DIY tools",
                count: "3,200+ listings",
                href: "/listings?category=equipment",
                categoryHref: "/categories",
                image: "/professional-construction-and-industrial-equipment.jpg",
                icon: Wrench,
                color: "from-orange-500 to-orange-600",
                bgColor: "bg-orange-50 dark:bg-orange-900/20",
                textColor: "text-orange-600 dark:text-orange-400",
                borderColor: "border-orange-200 dark:border-orange-800",
                features: ["Professional grade", "Delivery available", "Training included"],
                popular: true
              },
              {
                id: "homes",
                name: "Homes & Apartments",
                description: "Short-term rentals & vacation homes",
                count: "2,500+ listings",
                href: "/listings?category=homes",
                categoryHref: "/categories",
                image: "/modern-apartment-city-view.png",
                icon: Home,
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                textColor: "text-green-600 dark:text-green-400",
                borderColor: "border-green-200 dark:border-green-800",
                features: ["Fully furnished", "Utilities included", "Flexible terms"],
                popular: true
              },
              {
                id: "electronics",
                name: "Electronics",
                description: "Gadgets, computers & tech accessories",
                count: "950+ listings",
                href: "/listings?category=electronics",
                categoryHref: "/categories",
                image: "/modern-electronics-and-tech-gadgets-display.jpg",
                icon: Laptop,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50 dark:bg-purple-900/20",
                textColor: "text-purple-600 dark:text-purple-400",
                borderColor: "border-purple-200 dark:border-purple-800",
                features: ["Latest models", "Warranty included", "Tech support"],
                popular: true
              },
              {
                id: "fashion",
                name: "Fashion",
                description: "Clothing, jewelry & accessories",
                count: "1,200+ listings",
                href: "/listings?category=fashion",
                categoryHref: "/categories",
                image: "/designer-clothing-and-fashion-accessories.jpg",
                icon: Shirt,
                color: "from-pink-500 to-pink-600",
                bgColor: "bg-pink-50 dark:bg-pink-900/20",
                textColor: "text-pink-600 dark:text-pink-400",
                borderColor: "border-pink-200 dark:border-pink-800",
                features: ["Designer brands", "Size matching", "Styling advice"],
                popular: true
              },
              {
                id: "entertainment",
                name: "Entertainment",
                description: "Music, gaming & entertainment",
                count: "850+ listings",
                href: "/listings?category=entertainment",
                categoryHref: "/categories",
                image: "/elegant-event-venue-with-chandeliers-and-tables.jpg",
                icon: Music,
                color: "from-indigo-500 to-indigo-600",
                bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
                textColor: "text-indigo-600 dark:text-indigo-400",
                borderColor: "border-indigo-200 dark:border-indigo-800",
                features: ["Professional setup", "Delivery & setup", "Expert guidance"],
                popular: true
              },
              {
                id: "photography",
                name: "Photography",
                description: "Cameras, lighting & production gear",
                count: "600+ listings",
                href: "/listings?category=photography",
                categoryHref: "/categories",
                image: "/professional-construction-and-industrial-equipment.jpg",
                icon: Camera,
                color: "from-cyan-500 to-cyan-600",
                bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
                textColor: "text-cyan-600 dark:text-cyan-400",
                borderColor: "border-cyan-200 dark:border-cyan-800",
                features: ["Professional gear", "Technical support", "Insurance included"],
                popular: true
              },
              {
                id: "tools",
                name: "Tools",
                description: "Professional & DIY tools",
                count: "900+ listings",
                href: "/listings?category=tools",
                categoryHref: "/categories",
                image: "/professional-construction-and-industrial-equipment.jpg",
                icon: Wrench,
                color: "from-gray-500 to-gray-600",
                bgColor: "bg-gray-50 dark:bg-gray-900/20",
                textColor: "text-gray-600 dark:text-gray-400",
                borderColor: "border-gray-200 dark:border-gray-800",
                features: ["Professional grade", "Safety certified", "Maintenance included"],
                popular: true
              }
            ].map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={category.id}
                  className={`group cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${category.borderColor} overflow-hidden card-animate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link href={category.href}>
                    <div className="relative">
                      {/* Image Section */}
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                        {/* Popular Badge */}
                        {category.popular && (
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              <Star className="h-3 w-3 fill-current" />
                              Popular
                            </div>
                          </div>
                        )}

                        {/* Category Icon */}
                        <div className="absolute top-3 left-3">
                          <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center backdrop-blur-sm`}>
                            <IconComponent className={`h-5 w-5 ${category.textColor}`} />
                          </div>
                        </div>

                        {/* Category Info Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-lg sm:text-xl font-bold mb-1">{category.name}</h3>
                          <p className="text-sm opacity-90 mb-2">{category.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              {category.count}
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Card Content */}
                  <CardContent className="p-4 sm:p-6">
                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {category.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={category.href} className="flex-1">
                        <Button
                          className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white text-sm btn-animate shadow-lg hover:shadow-xl transition-all duration-200`}
                        >
                          Browse Items
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                      <Link href={category.categoryHref}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs btn-animate bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* View All Categories CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <Link href="/categories">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-6"
              >
                View All Categories
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Get Started Section - Only show for non-logged-in users or users without account type */}
      {shouldShowGetStarted && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl">
            <div className="text-center text-white mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Ready to Join the Sharing Economy?
              </h2>
              <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Whether you want to rent items or earn money by listing your own,
                we'll help you get started with the perfect plan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Link href="/get-started">
                <Card className="group cursor-pointer border-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 sm:p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <User className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Get Started</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Choose your path and set up your profile in minutes
                    </p>
                    <Button variant="outline" className="get-started-button px-6 py-3 border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                      Start Your Journey
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/categories">
                <Card className="group cursor-pointer border-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 sm:p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Browse Categories</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Explore thousands of items across all categories
                    </p>
                    <Button variant="outline" className="get-started-button px-6 py-3 border-2 border-white bg-transparent text-white hover:bg-white hover:text-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                      Explore Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      )}

      <FestiveBanner />
      <Footer />
    </div>
  )
}


