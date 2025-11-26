"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, MessageCircle, Phone, Mail, Clock, CheckCircle, 
  AlertCircle, HelpCircle, BookOpen, Users, Shield, 
  CreditCard, Truck, Star, MessageSquare, Send, 
  ThumbsUp, ThumbsDown, FileText, Download
} from "lucide-react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import ProfessionalAIChat from "@/components/professional-ai-chat"

// Mock FAQ data
const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <BookOpen className="h-5 w-5" />,
    questions: [
      {
        id: "faq-1",
        question: "How do I create my first listing?",
        answer: "To create your first listing, go to your profile and click 'Create Listing'. Fill in the details about your item, add photos, set your price, and publish. Make sure to provide accurate descriptions and high-quality photos to attract more renters.",
      },
      {
        id: "faq-2", 
        question: "What are the fees for using Leli Rentals?",
        answer: "Leli Rentals charges a small service fee on each successful booking. The fee is typically 5-10% of the rental amount, which helps us maintain the platform, provide customer support, and ensure secure transactions.",
      },
      {
        id: "faq-3",
        question: "How do I verify my account?",
        answer: "Account verification helps build trust with other users. You can verify your account by providing a valid ID, phone number, and email address. Verified accounts get priority in search results and have access to premium features.",
      },
    ],
  },
  {
    id: "booking",
    title: "Booking & Payments",
    icon: <CreditCard className="h-5 w-5" />,
    questions: [
      {
        id: "faq-4",
        question: "How do I book an item?",
        answer: "Browse our listings, find an item you like, and click 'Book Now'. Select your rental dates, review the terms, and complete the payment. The owner will receive your booking request and can approve or decline it.",
      },
      {
        id: "faq-5",
        question: "What payment methods are accepted?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets like PayPal and Apple Pay. All payments are processed securely through our payment partners.",
      },
      {
        id: "faq-6",
        question: "When will I be charged?",
        answer: "You'll be charged when the owner approves your booking request. If the booking is declined, you won't be charged. For instant bookings, you'll be charged immediately upon booking confirmation.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & Security",
    icon: <Shield className="h-5 w-5" />,
    questions: [
      {
        id: "faq-7",
        question: "How does Leli Rentals ensure safety?",
        answer: "We have several safety measures in place: identity verification, secure payments, user reviews and ratings, 24/7 customer support, and insurance coverage for eligible items. We also have a dedicated safety team that monitors the platform.",
      },
      {
        id: "faq-8",
        question: "What if something goes wrong with my rental?",
        answer: "If you encounter any issues, contact our support team immediately. We have a resolution process in place and can help mediate disputes. For damaged or lost items, we have insurance coverage and a claims process.",
      },
    ],
  },
]

// Mock support tickets
const mockTickets = [
  {
    id: "ticket-1",
    subject: "Payment not processed",
    status: "open",
    priority: "high",
    category: "billing",
    createdAt: "2024-12-15",
    lastUpdated: "2024-12-15",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        message: "I tried to book a camera but my payment wasn't processed. Can you help?",
        timestamp: "2024-12-15T10:30:00Z",
      },
      {
        id: "msg-2",
        sender: "support",
        message: "I've looked into your account and found the issue. Your payment method needs to be updated. Please try adding a new payment method and attempt the booking again.",
        timestamp: "2024-12-15T11:15:00Z",
      },
    ],
  },
  {
    id: "ticket-2",
    subject: "Listing visibility issue",
    status: "resolved",
    priority: "medium",
    category: "listings",
    createdAt: "2024-12-10",
    lastUpdated: "2024-12-12",
    messages: [
      {
        id: "msg-3",
        sender: "user",
        message: "My listing isn't showing up in search results. What's wrong?",
        timestamp: "2024-12-10T14:20:00Z",
      },
      {
        id: "msg-4",
        sender: "support",
        message: "I've reviewed your listing and found that it was flagged for review due to missing photos. I've approved it and it should now be visible in search results.",
        timestamp: "2024-12-12T09:30:00Z",
      },
    ],
  },
]

export default function HelpPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("faq")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  })

  const filteredFAQs = faqCategories
    .filter(category => selectedCategory === "all" || category.id === selectedCategory)
    .map(category => ({
      ...category,
      questions: category.questions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0)

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTicket.subject || !newTicket.category || !newTicket.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Support ticket created!",
        description: "We've received your request and will respond within 24 hours.",
      })
      
      setIsCreatingTicket(false)
      setNewTicket({
        subject: "",
        category: "",
        priority: "medium",
        message: "",
      })
    } catch (error) {
      toast({
        title: "Error creating ticket",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Help & Support
              </h1>
              <p className="text-muted-foreground mt-2">
                Find answers to common questions or get help from our support team
              </p>
            </div>
            <Button 
              onClick={() => router.back()}
              variant="outline"
            >
              Back
            </Button>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">Get instant help from our support team</p>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setIsChatOpen(true)}
              >
                Chat with Leli AI
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Call us at 1-800-LELI-HELP</p>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Send us an email anytime</p>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search help articles, FAQs, and support topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger value="faq" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <Users className="h-4 w-4 mr-2" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="getting-started">Getting Started</SelectItem>
                  <SelectItem value="booking">Booking & Payments</SelectItem>
                  <SelectItem value="safety">Safety & Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {filteredFAQs.map((category) => (
                <Card key={category.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq) => (
                        <div key={faq.id} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-semibold mb-2">{faq.question}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse all categories.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Support Tickets</h2>
              <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>
                      Describe your issue and we'll get back to you within 24 hours
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="billing">Billing & Payments</SelectItem>
                            <SelectItem value="listings">Listings</SelectItem>
                            <SelectItem value="bookings">Bookings</SelectItem>
                            <SelectItem value="account">Account Issues</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide detailed information about your issue..."
                        value={newTicket.message}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreatingTicket(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Send className="h-4 w-4 mr-2" />
                        Create Ticket
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {mockTickets.map((ticket) => (
                <Card key={ticket.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {ticket.messages.slice(0, 2).map((message) => (
                        <div key={message.id} className={`p-3 rounded-lg ${
                          message.sender === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {message.sender === 'user' ? 'You' : 'Support Team'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Us Tab */}
          <TabsContent value="contact" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Get in Touch</CardTitle>
                  <CardDescription>We're here to help with any questions or concerns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Phone Support</div>
                        <div className="text-sm text-muted-foreground">1-800-LELI-HELP (1-800-535-4435)</div>
                        <div className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM PST</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-muted-foreground">lelirentalsmail@gmail.com</div>
                        <div className="text-xs text-muted-foreground">Response within 24 hours</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Live Chat</div>
                        <div className="text-sm text-muted-foreground">Available 24/7</div>
                        <div className="text-xs text-muted-foreground">Instant responses</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Business Hours</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Monday - Friday: 9:00 AM - 6:00 PM PST</div>
                      <div>Saturday: 10:00 AM - 4:00 PM PST</div>
                      <div>Sunday: Closed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Send us a Message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={4} placeholder="Tell us more about your inquiry..." />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Professional AI Support Chat */}
      <ProfessionalAIChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  )
}

