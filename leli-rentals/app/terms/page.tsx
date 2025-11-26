"use client"

import React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Shield, CreditCard, AlertTriangle, CheckCircle, Calendar, Mail, Phone } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our rental marketplace platform.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: January 15, 2024</p>
        </div>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Acceptance of Terms
            </CardTitle>
            <CardDescription>By using our platform, you agree to these terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                By accessing or using Leli Rentals ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use our Platform.
              </p>
              <p className="text-sm text-gray-600">
                These Terms apply to all users of the Platform, including renters, item owners, and visitors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Platform Description
            </CardTitle>
            <CardDescription>What our platform does and how it works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Leli Rentals is a peer-to-peer rental marketplace that connects people who want to rent items with people who have items to rent. 
                Our Platform facilitates transactions between users but does not own, sell, or rent the items listed.
              </p>
              <p className="text-sm text-gray-600">
                We provide the technology platform, payment processing, and support services to enable secure and convenient rentals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              User Responsibilities
            </CardTitle>
            <CardDescription>Your obligations when using our platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Account Responsibilities</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Provide accurate and complete information</li>
                  <li>• Keep your account information up to date</li>
                  <li>• Maintain the security of your account</li>
                  <li>• Notify us of any unauthorized use</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Platform Usage</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use the platform in compliance with laws</li>
                  <li>• Respect other users and their property</li>
                  <li>• Report any suspicious or illegal activity</li>
                  <li>• Follow our community guidelines</li>
              </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Rental Terms & Conditions
            </CardTitle>
            <CardDescription>Terms specific to rental transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Rental Agreements</h4>
                <p className="text-sm text-gray-600">
                  Each rental transaction is subject to a separate rental agreement between the renter and item owner. 
                  Our platform facilitates these agreements but is not a party to them.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                <p className="text-sm text-gray-600">
                  All payments are processed through our secure payment system. We may hold funds until the rental period is complete 
                  and both parties confirm the transaction.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-gray-600">
                  Cancellation terms vary by listing and are set by the item owner. Please review cancellation policies before booking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Prohibited Activities
            </CardTitle>
            <CardDescription>Activities that are not allowed on our platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Illegal Activities</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Renting illegal or prohibited items</li>
                  <li>• Using the platform for illegal purposes</li>
                  <li>• Violating any applicable laws or regulations</li>
                  <li>• Engaging in fraudulent activities</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Platform Misuse</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Creating fake accounts or listings</li>
                  <li>• Spamming or harassing other users</li>
                  <li>• Attempting to circumvent platform fees</li>
                  <li>• Reverse engineering our technology</li>
              </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liability and Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Liability & Disclaimers
            </CardTitle>
            <CardDescription>Our limitations of liability and disclaimers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Platform Liability</h4>
                <p className="text-sm text-gray-600">
                  Leli Rentals acts as a platform connecting users and does not own, sell, or rent the items listed. 
                  We are not responsible for the quality, safety, or condition of rented items.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">User Disputes</h4>
                <p className="text-sm text-gray-600">
                  Disputes between users are their responsibility to resolve. We may provide dispute resolution services 
                  but are not obligated to do so.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h4>
                <p className="text-sm text-gray-600">
                  Our liability is limited to the amount of fees we have collected from you in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Intellectual Property
            </CardTitle>
            <CardDescription>Ownership of content and intellectual property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Platform Content</h4>
                <p className="text-sm text-gray-600">
                  All content on our platform, including text, graphics, logos, and software, is owned by Leli Rentals 
                  or our licensors and is protected by copyright and other intellectual property laws.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">User Content</h4>
                <p className="text-sm text-gray-600">
                  You retain ownership of content you post on our platform, but grant us a license to use, display, 
                  and distribute it in connection with our services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Account Termination
            </CardTitle>
            <CardDescription>When and how accounts may be terminated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Termination by You</h4>
                <p className="text-sm text-gray-600">
                  You may terminate your account at any time by contacting us. We will process your request within 30 days.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Termination by Us</h4>
                <p className="text-sm text-gray-600">
                  We may terminate or suspend your account if you violate these Terms or engage in prohibited activities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Effect of Termination</h4>
                <p className="text-sm text-gray-600">
                  Upon termination, your right to use the platform ceases immediately. We may retain certain information 
                  as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Governing Law & Disputes
            </CardTitle>
            <CardDescription>Legal jurisdiction and dispute resolution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Governing Law</h4>
                <p className="text-sm text-gray-600">
                  These Terms are governed by the laws of Kenya. Any disputes will be resolved in the courts of Kenya.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Dispute Resolution</h4>
                <p className="text-sm text-gray-600">
                  We encourage users to resolve disputes amicably. If necessary, disputes may be resolved through 
                  mediation or arbitration before resorting to court proceedings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-600" />
              Contact Us
            </CardTitle>
            <CardDescription>Questions about these terms? We're here to help.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-sm text-gray-600">lelirentalsmail@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-sm text-gray-600">+254112081866</p>
                  </div>
                </div>
                      </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                    <h4 className="font-semibold text-gray-900">Response Time</h4>
                    <p className="text-sm text-gray-600">We respond to inquiries within 48 hours</p>
                  </div>
                </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Changes to Terms
            </CardTitle>
            <CardDescription>We may update these terms from time to time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                We may update these Terms to reflect changes in our services, legal requirements, or business practices.
              </p>
              <p className="text-sm text-gray-600">
                We will notify you of any material changes by email or through our platform. Your continued use of our services 
                after any changes constitutes acceptance of the updated Terms.
              </p>
              <p className="text-sm text-gray-600">
                We encourage you to review these Terms periodically to stay informed of any updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Accept Terms
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="h-5 w-5 mr-2" />
              Contact Legal Team
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Need help understanding these terms? Our legal team is here to assist you.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}