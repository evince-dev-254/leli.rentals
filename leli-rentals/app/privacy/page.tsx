"use client"

import React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, Database, Users, Mail, Phone, Calendar } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: January 15, 2024</p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Information We Collect
            </CardTitle>
            <CardDescription>We collect information to provide and improve our services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Personal Information</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Name and contact information</li>
                  <li>• Email address and phone number</li>
                  <li>• Profile information and preferences</li>
                  <li>• Payment and billing information</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Usage Information</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Rental history and preferences</li>
                  <li>• Search queries and browsing behavior</li>
                  <li>• Device information and location data</li>
                  <li>• Communication records</li>
              </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              How We Use Your Information
            </CardTitle>
            <CardDescription>We use your information to provide and improve our services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Service Delivery</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Process rental bookings and payments</li>
                  <li>• Connect renters with item owners</li>
                  <li>• Provide customer support</li>
                  <li>• Send important service updates</li>
              </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Service Improvement</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Analyze usage patterns and preferences</li>
                  <li>• Improve our platform and features</li>
                  <li>• Develop new services and offerings</li>
                  <li>• Personalize your experience</li>
              </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Data Protection & Security
            </CardTitle>
            <CardDescription>We implement strong security measures to protect your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Technical Safeguards</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• End-to-end encryption for sensitive data</li>
                  <li>• Secure servers and data centers</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Access controls and authentication</li>
              </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Operational Safeguards</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Limited access to authorized personnel</li>
                  <li>• Regular staff training on data protection</li>
                  <li>• Incident response procedures</li>
                  <li>• Regular backup and recovery systems</li>
              </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Your Privacy Rights
            </CardTitle>
            <CardDescription>You have control over your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Access & Control</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• View and update your profile information</li>
                  <li>• Download your data in a portable format</li>
                  <li>• Delete your account and data</li>
                  <li>• Opt out of marketing communications</li>
              </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Data Portability</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Export your rental history</li>
                  <li>• Transfer data to other services</li>
                  <li>• Request data correction</li>
                  <li>• Restrict data processing</li>
              </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              Cookies & Tracking
            </CardTitle>
            <CardDescription>We use cookies and similar technologies to enhance your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                <p className="text-sm text-gray-600">Required for basic website functionality, authentication, and security.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">Help us understand how you use our platform to improve our services.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                <p className="text-sm text-gray-600">Used to deliver relevant advertisements and measure campaign effectiveness.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-teal-600" />
              Third-Party Services
            </CardTitle>
            <CardDescription>We work with trusted partners to provide our services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Processors</h4>
                <p className="text-sm text-gray-600">We use secure payment processors to handle transactions. They have their own privacy policies.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics Services</h4>
                <p className="text-sm text-gray-600">We use analytics services to understand usage patterns and improve our platform.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Communication Services</h4>
                <p className="text-sm text-gray-600">We use communication services to send notifications and support messages.</p>
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
            <CardDescription>Questions about our privacy practices? We're here to help.</CardDescription>
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
                    <p className="text-sm text-gray-600">We respond to privacy inquiries within 48 hours</p>
                  </div>
                </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

        {/* Policy Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Policy Updates
            </CardTitle>
            <CardDescription>We may update this privacy policy from time to time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                We may update this privacy policy to reflect changes in our practices or for other operational, legal, or regulatory reasons.
              </p>
              <p className="text-sm text-gray-600">
                We will notify you of any material changes by email or through our platform. We encourage you to review this policy periodically.
              </p>
              <p className="text-sm text-gray-600">
                Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Shield className="h-5 w-5 mr-2" />
              Manage Privacy Settings
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="h-5 w-5 mr-2" />
              Contact Privacy Team
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Need help understanding your privacy rights? Our team is here to assist you.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}