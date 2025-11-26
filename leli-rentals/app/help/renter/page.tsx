"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Shield, 
  CreditCard, 
  Search, 
  Users, 
  FileCheck,
  MessageCircle,
  Star,
  Calendar,
  MapPin,
  Settings,
  CheckCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Heart,
  Lock,
  Package,
  Clock
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const renterGuides = [
  {
    id: "getting-started",
    title: "Getting Started as a Renter",
    icon: <ShoppingBag className="h-6 w-6" />,
    steps: [
      {
        title: "Create Your Account",
        description: "Sign up with your email or phone number and verify your account to get started.",
        icon: <Users className="h-5 w-5" />
      },
      {
        title: "Browse Listings",
        description: "Search for items by category, location, price range, and availability dates.",
        icon: <Search className="h-5 w-5" />
      },
      {
        title: "Contact Owners",
        description: "Message owners directly to ask questions, negotiate terms, or confirm availability.",
        icon: <MessageCircle className="h-5 w-5" />
      },
      {
        title: "Book & Pay Securely",
        description: "Complete your booking and pay securely through our platform with multiple payment options.",
        icon: <CreditCard className="h-5 w-5" />
      }
    ]
  },
  {
    id: "booking-tips",
    title: "Booking Tips",
    icon: <Calendar className="h-6 w-6" />,
    tips: [
      "Read listing descriptions and reviews carefully before booking",
      "Check availability calendar to avoid conflicts",
      "Message owners to clarify any questions before booking",
      "Review cancellation policies before confirming",
      "Keep your contact information up to date",
      "Leave honest reviews after your rental experience"
    ]
  },
  {
    id: "safety",
    title: "Safety & Security",
    icon: <Shield className="h-6 w-6" />,
    content: [
      {
        heading: "Verified Owners",
        text: "We verify owner identities and listings to ensure a safe rental experience. Look for the verified badge on owner profiles."
      },
      {
        heading: "Secure Payments",
        text: "All payments are processed securely through our platform. Your payment information is encrypted and protected."
      },
      {
        heading: "Insurance Coverage",
        text: "All bookings include damage protection. If something goes wrong, you're covered by our insurance policy."
      },
      {
        heading: "Dispute Resolution",
        text: "Our support team is available 24/7 to help resolve any issues or disputes that may arise during your rental."
      }
    ]
  }
]

const renterFAQs = [
  {
    question: "How do I search for items to rent?",
    answer: "Use the search bar on the homepage or browse by category. You can filter results by price, location, availability dates, and ratings. Save your favorite searches for quick access later."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets like PayPal and Apple Pay. All payments are processed securely."
  },
  {
    question: "When will I be charged for my booking?",
    answer: "You'll be charged when the owner approves your booking request. For instant bookings, payment is processed immediately upon confirmation. If a booking is declined, you won't be charged."
  },
  {
    question: "Can I cancel my booking?",
    answer: "Cancellation policies vary by listing. Check the listing details for specific cancellation terms. Generally, you can cancel free of charge if done within 48 hours of booking, subject to the owner's policy."
  },
  {
    question: "What if the item is damaged or not as described?",
    answer: "Contact our support team immediately and take photos if possible. We have a dispute resolution process and insurance coverage to protect you. File a claim through your booking details page."
  },
  {
    question: "How do I communicate with owners?",
    answer: "Click 'Message Owner' on any listing to start a conversation. You can discuss rental details, ask questions, negotiate terms, and coordinate pickup/delivery. All messages are stored in your Messages section."
  },
  {
    question: "Can I rent items for multiple days?",
    answer: "Yes! Most items can be rented for any duration specified in the listing. Check the availability calendar and select your preferred start and end dates when booking."
  },
  {
    question: "How do reviews work?",
    answer: "After completing a rental, you can leave a review rating and comment about your experience. Reviews help other renters make informed decisions and help owners improve their service."
  }
]

export default function RenterHelpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Renter Help Center
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Everything you need to find and rent the perfect items
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => router.back()} variant="outline">
              Back
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/listings">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-3">
                  <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Browse Listings</h3>
                <p className="text-xs text-muted-foreground">Find items to rent</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/profile/favorites">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-3">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Saved Items</h3>
                <p className="text-xs text-muted-foreground">Your favorites</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/profile/bookings">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">My Bookings</h3>
                <p className="text-xs text-muted-foreground">View reservations</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/messages">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Messages</h3>
                <p className="text-xs text-muted-foreground">Chat with owners</p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Getting Started Guide
            </CardTitle>
            <CardDescription>
              Follow these simple steps to start renting items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renterGuides[0].steps.map((step, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Tips */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6 text-purple-600" />
              Booking Tips & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renterGuides[1].tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety & Security */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-green-600" />
              Safety & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renterGuides[2].content.map((item, index) => (
                <div key={index} className="p-4 border-l-4 border-green-500 bg-gray-50 dark:bg-gray-800 rounded-r-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    {item.heading}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <HelpCircle className="h-6 w-6 text-orange-600" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renterFAQs.map((faq, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h4>
                  <p className="text-sm text-muted-foreground ml-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Need more help?</h3>
            <p className="mb-6 opacity-90">
              Our support team is here to assist you 24/7
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Contact Support
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  General Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

