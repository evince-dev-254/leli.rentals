"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VideoBackground } from "@/components/video-background"
import { Users, Shield, Star, Globe, Heart, CheckCircle, Zap, Target, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Successful Rentals", value: "200K+", icon: CheckCircle },
    { label: "Cities Covered", value: "25+", icon: Globe },
    { label: "Average Rating", value: "4.8", icon: Star },
  ]

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description:
        "Every listing is verified and every user is background-checked to ensure your safety and peace of mind.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We leverage cutting-edge technology to make renting as simple as a few taps on your phone.",
    },
    {
      icon: Heart,
      title: "Community",
      description: "Building connections between people who share resources and create memorable experiences together.",
    },
    {
      icon: Target,
      title: "Accessibility",
      description: "Making quality rentals accessible to everyone, regardless of budget or location.",
    },
  ]

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder",
      image: "https://picsum.photos/400/400?random=1",
      bio: "Former tech executive with 15 years in marketplace platforms. Passionate about sustainable sharing economy.",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format",
      bio: "Full-stack engineer and AI specialist. Previously led engineering teams at major tech companies.",
    },
    {
      name: "Emily Johnson",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format",
      bio: "Operations expert with background in logistics and customer experience optimization.",
    },
    {
      name: "David Kim",
      role: "Head of Design",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format",
      bio: "Award-winning product designer focused on creating intuitive and beautiful user experiences.",
    },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Browse & Discover",
      description:
        "Explore thousands of verified listings across multiple categories with advanced filters and search.",
    },
    {
      step: "02",
      title: "Book Instantly",
      description: "Secure your rental with our streamlined booking process and instant confirmation system.",
    },
    {
      step: "03",
      title: "Connect & Enjoy",
      description: "Meet your host, pick up your rental, and enjoy your experience with 24/7 support.",
    },
    {
      step: "04",
      title: "Rate & Review",
      description: "Share your experience to help build trust and improve our community for everyone.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Video Background */}
      <VideoBackground 
        src="/videos/about-hero-video.mp4"
        fallbackImage="/modern-rental-marketplace-hero-with-cars--apartmen.jpg"
        className="py-20 flex items-center justify-center min-h-[60vh]"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-white/20 backdrop-blur-sm text-white border-white/30">
              About Leli Rentals
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance drop-shadow-lg">
              Revolutionizing the
              <span className="text-orange-400"> Sharing Economy</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 text-pretty max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              We're building the future of rentals by connecting people with the things they need, when they need them.
              From homes to vehicles, equipment to experiences - we make sharing simple, safe, and sustainable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg">
                <Link href="/listings/homes">Start Exploring</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900">
                <Link href="/contact">Join Our Mission</Link>
              </Button>
            </div>
          </div>
        </div>
      </VideoBackground>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Leli Rentals was born from a simple observation: people own things they rarely use, while others
                    need those same things but can't justify buying them. We saw an opportunity to create a platform
                    that benefits everyone.
                  </p>
                  <p>
                    Founded in 2023 by a team of tech veterans and sharing economy enthusiasts, we've grown from a small
                    startup to a thriving marketplace serving thousands of users across multiple cities.
                  </p>
                  <p>
                    Our mission is to make the sharing economy accessible, safe, and beneficial for everyone. We believe
                    that by sharing resources, we can build stronger communities while reducing environmental impact and
                    making life more affordable.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/modern-rental-marketplace-hero-with-cars--apartmen.jpg"
                  alt="Modern rental marketplace showcasing cars and apartments"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.onerror = null
                    t.src = "/placeholder.svg"
                    t.alt = "About image not available"
                  }}
                />
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">2023</div>
                  <div className="text-sm">Founded</div>
                </div>
              </div>
            </div>
            
            {/* Additional Story Images */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <img
                  src="/luxury-cars-in-modern-showroom.jpg"
                  alt="Luxury cars in modern showroom"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.onerror = null
                    t.src = "/placeholder.svg"
                    t.alt = "Luxury cars image not available"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                  <p className="text-sm opacity-90">Curated selection of high-quality rentals</p>
                </div>
              </div>
              
              <div className="relative group">
                <img
                  src="/modern-apartment-city-view.png"
                  alt="Modern apartment with city view"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.onerror = null
                    t.src = "/placeholder.svg"
                    t.alt = "Modern apartment image not available"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
                  <p className="text-sm opacity-90">Verified hosts and secure transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do and shape our platform's future.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Getting started with Leli Rentals is simple. Here's how our platform works.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The passionate individuals working to revolutionize the sharing economy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-6 text-center">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement
                        t.onerror = null
                        t.src = "/placeholder-user.jpg"
                        t.alt = `${member.name} - image not available`
                      }}
                    />
                    <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Lightbulb className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Join the Revolution?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're looking to rent something special or share what you own, Leli Rentals is here to make it
              happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/signup">Get Started Today</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
