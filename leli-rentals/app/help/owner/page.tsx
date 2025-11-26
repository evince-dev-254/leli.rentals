"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  Users, 
  FileCheck,
  MessageCircle,
  Star,
  Camera,
  Calendar,
  MapPin,
  Settings,
  CheckCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  DollarSign,
  BarChart3,
  User
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const ownerGuides = [
  {
    id: "getting-started",
    title: "Getting Started as an Owner",
    icon: <ShoppingBag className="h-6 w-6" />,
    steps: [
      {
        title: "Complete Your Profile",
        description: "Verify your identity and add a profile picture to build trust with renters.",
        icon: <User className="h-5 w-5" />
      },
      {
        title: "Create Your First Listing",
        description: "Take quality photos, write detailed descriptions, and set competitive prices.",
        icon: <Camera className="h-5 w-5" />
      },
      {
        title: "Set Availability",
        description: "Define when your items are available for rent using the calendar feature.",
        icon: <Calendar className="h-5 w-5" />
      },
      {
        title: "Choose Your Plan",
        description: "Select a subscription plan that fits your needs - Free, Basic, Premium, or Enterprise.",
        icon: <CreditCard className="h-5 w-5" />
      }
    ]
  },
  {
    id: "listing-management",
    title: "Listing Management",
    icon: <Settings className="h-6 w-6" />,
    tips: [
      "Upload high-quality photos from multiple angles",
      "Write clear, detailed descriptions highlighting key features",
      "Set competitive prices based on market research",
      "Respond to inquiries within 24 hours for better visibility",
      "Update availability regularly to avoid booking conflicts",
      "Use relevant keywords in your listing title and description"
    ]
  },
  {
    id: "pricing-strategy",
    title: "Pricing & Revenue",
    icon: <DollarSign className="h-6 w-6" />,
    content: [
      {
        heading: "Setting Competitive Prices",
        text: "Research similar listings in your area to understand market rates. Consider factors like item condition, age, brand, and demand."
      },
      {
        heading: "Platform Fees",
        text: "Leli Rentals charges a service fee of 5-10% on successful bookings. This fee covers payment processing, customer support, and platform maintenance."
      },
      {
        heading: "Maximizing Revenue",
        text: "Keep your listings active, respond quickly to messages, maintain high ratings, and offer competitive prices during peak seasons."
      }
    ]
  }
]

const ownerFAQs = [
  {
    question: "How do I verify my account?",
    answer: "Go to your profile settings and click 'Verify Account'. You'll need to upload a valid government-issued ID. Verification typically takes 24-48 hours and helps build trust with renters."
  },
  {
    question: "What subscription plans are available?",
    answer: "We offer four plans: Free (1 listing), Basic (5 listings, $9.99/month), Premium (unlimited listings, $19.99/month), and Enterprise (custom pricing with advanced features)."
  },
  {
    question: "How do I receive payments?",
    answer: "Payments are automatically processed through our secure payment system. Funds are deposited to your registered account within 2-3 business days after rental completion."
  },
  {
    question: "What happens if a renter damages my item?",
    answer: "All bookings include damage protection. If damage occurs, file a claim through the booking details page. Our support team will review the case and process compensation if eligible."
  },
  {
    question: "Can I set custom rental terms?",
    answer: "Yes! In your listing settings, you can set rental duration limits, security deposit requirements, pickup/delivery options, and cancellation policies."
  },
  {
    question: "How do I handle booking requests?",
    answer: "You'll receive notifications for new booking requests. Review the renter's profile and message history, then approve or decline within 48 hours. Instant bookings are confirmed automatically."
  }
]

export default function OwnerHelpPage() {
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
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Owner Help Center
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Everything you need to succeed as a rental owner
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
              <Link href="/list-item">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-3">
                  <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Create Listing</h3>
                <p className="text-xs text-muted-foreground">Add a new item</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/dashboard/owner">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Dashboard</h3>
                <p className="text-xs text-muted-foreground">View analytics</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/profile/settings">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-3">
                  <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Settings</h3>
                <p className="text-xs text-muted-foreground">Manage account</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Link href="/profile/billing">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full w-fit mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Billing</h3>
                <p className="text-xs text-muted-foreground">Subscription</p>
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
              Follow these steps to start renting out your items successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {ownerGuides[0].steps.map((step, index) => (
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

        {/* Listing Management Tips */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Settings className="h-6 w-6 text-purple-600" />
              Listing Management Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerGuides[1].tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Revenue */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <DollarSign className="h-6 w-6 text-green-600" />
              Pricing & Revenue Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {ownerGuides[2].content.map((item, index) => (
                <div key={index} className="p-4 border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-800 rounded-r-lg">
                  <h4 className="font-semibold mb-2">{item.heading}</h4>
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
              {ownerFAQs.map((faq, index) => (
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
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="mb-6 opacity-90">
              Our support team is available 24/7 to assist you
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

