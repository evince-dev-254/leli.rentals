"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Send,
  CheckCircle,
  Users,
  Shield,
  Headphones,
} from "lucide-react"

export default function ContactPage() {
  const searchParams = useSearchParams()
  const ownerParam = searchParams?.get('owner')
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  // Handle owner parameter from URL
  useEffect(() => {
    if (ownerParam) {
      setFormData(prev => ({
        ...prev,
        subject: `Inquiry about rental from ${ownerParam}`,
        message: `Hello ${ownerParam},\n\nI'm interested in discussing a rental opportunity. Please let me know more details.\n\nBest regards,`
      }))
      
      toast({
        title: "Contact form pre-filled",
        description: `Form has been pre-filled for contacting ${ownerParam}`,
        duration: 3000,
      })
    }
  }, [ownerParam, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error("Please fill in all required fields")
      }

      // Send contact form email via API
      const response = await fetch('/api/emails/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'General Inquiry',
          category: formData.category || 'general',
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSubmitting(false)
      setIsSubmitted(true)

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      })

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({ name: "", email: "", subject: "", category: "", message: "" })
      }, 3000)
    } catch (error: any) {
      setIsSubmitting(false)
      toast({
        title: "Failed to send message",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContactMethod = (method: string, contact: string) => {
    switch (method) {
      case "email":
        if (typeof window !== 'undefined') {
          window.location.href = `mailto:${contact}`
        }
        break
      case "phone":
        if (typeof window !== 'undefined') {
          window.location.href = `tel:${contact.replace(/\D/g, "")}`
        }
        break
      case "whatsapp":
        if (typeof window !== 'undefined') {
          const whatsappNumber = "+254112081866"
          const message = encodeURIComponent(`Hi Leli Rentals AI Assistant! I need help with a rental listing.`)
          window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${message}`, '_blank')
        }
        break
      case "chat":
        // Chat is now global - just show a message
        toast({
          title: "🤖 Leli AI Assistant",
          description: "Click the message icon in the bottom right corner to chat with our AI assistant!",
        })
        break
      case "emergency":
        if (typeof window !== 'undefined') {
          window.location.href = `tel:+254112081866`
        }
        break
      default:
        break
    }
  }

  const contactMethods = [
    {
      icon: MessageSquare,
      title: "WhatsApp AI Assistant",
      description: "Chat with our AI assistant on WhatsApp",
      contact: "+254112081866",
      responseTime: "Available 24/7",
      color: "bg-green-500/10 text-green-600",
      method: "whatsapp",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "lelirentalsmail@gmail.com",
      responseTime: "Within 24 hours",
      color: "bg-blue-500/10 text-blue-600",
      method: "email",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team",
      contact: "+254112081866",
      responseTime: "Mon-Fri, 9AM-6PM EAT",
      color: "bg-orange-500/10 text-orange-600",
      method: "phone",
    },
    {
      icon: Headphones,
      title: "24/7 Emergency",
      description: "Urgent rental issues",
      contact: "+254112081866",
      responseTime: "Available 24/7",
      color: "bg-red-500/10 text-red-600",
      method: "emergency",
    },
  ]

  const officeLocations = [
    {
      city: "Nairobi",
      address: "123 Rental Street, Suite 400",
      zipCode: "Nairobi, Kenya 00100",
      phone: "+254112081866",
      hours: "Mon-Fri: 9AM-6PM EAT",
    },
    {
      city: "Mombasa",
      address: "456 Innovation Ave, Floor 12",
      zipCode: "Mombasa, Kenya 80100",
      phone: "+254112081867",
      hours: "Mon-Fri: 9AM-6PM EAT",
    },
    {
      city: "Kisumu",
      address: "789 Startup Blvd, Building C",
      zipCode: "Kisumu, Kenya 40100",
      phone: "+254112081868",
      hours: "Mon-Fri: 9AM-6PM EAT",
    },
  ]

  const faqs = [
    {
      question: "How do I list my item for rent?",
      answer:
        "Creating a listing is simple! Sign up for an account, click 'List Your Item', upload photos, add a description and pricing, then submit for review. Our team will verify your listing within 24 hours.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely through our encrypted payment system.",
    },
    {
      question: "How does insurance work for rentals?",
      answer:
        "All rentals are covered by our comprehensive insurance policy. This includes damage protection up to $10,000 and liability coverage. Both renters and owners are protected during the rental period.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel your booking according to the cancellation policy set by the owner. Most listings offer flexible cancellation up to 24 hours before the rental period begins.",
    },
    {
      question: "How do I become a verified user?",
      answer:
        "To become verified, complete your profile with a government-issued ID, phone number verification, and email confirmation. Verified users get priority in bookings and can access premium features.",
    },
    {
      question: "What if there's an issue with my rental?",
      answer:
        "Contact our 24/7 support team immediately. We have dedicated resolution specialists who will work with both parties to resolve any issues quickly and fairly.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              We're Here to
              <span className="text-primary"> Help</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto leading-relaxed">
              Have questions about rentals, need support, or want to partner with us? Our team is ready to assist you
              with anything you need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Preferred Contact Method</h2>
              <p className="text-lg text-muted-foreground">
                We offer multiple ways to get in touch based on your needs and urgency.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <Card
                  key={index}
                  className={`border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    method.method === "chat" ? "ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-blue-50" : ""
                  }`}
                  onClick={() => handleContactMethod(method.method, method.contact)}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full ${method.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <method.icon className="h-8 w-8" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{method.title}</h3>
                      {method.method === "chat" && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                    <p className="font-medium text-foreground mb-2">{method.contact}</p>
                    <p className="text-xs text-muted-foreground">{method.responseTime}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <Card className="border-2">
                  <CardContent className="p-8">
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground">
                          Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              placeholder="Your full name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="your.email@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="support">Technical Support</SelectItem>
                              <SelectItem value="billing">Billing & Payments</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleInputChange("subject", e.target.value)}
                            placeholder="Brief description of your inquiry"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => handleInputChange("message", e.target.value)}
                            placeholder="Please provide details about your inquiry..."
                            rows={6}
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Office Locations */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Offices</h2>
                <div className="space-y-6">
                  {officeLocations.map((office, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">{office.city}</h3>
                            <p className="text-muted-foreground mb-1">{office.address}</p>
                            <p className="text-muted-foreground mb-3">{office.zipCode}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-primary" />
                                <a href={`tel:${office.phone}`} className="hover:text-primary transition-colors">
                                  {office.phone}
                                </a>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{office.hours}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Find quick answers to common questions about our platform and services.
              </p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">50K+</div>
                <div className="text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">2 min</div>
                <div className="text-muted-foreground">Average Response Time</div>
              </div>
              <div>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">99.9%</div>
                <div className="text-muted-foreground">Issue Resolution Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
