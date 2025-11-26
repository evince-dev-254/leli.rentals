'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  DollarSign, 
  Package, 
  Shield, 
  CheckCircle,
  Send,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText
} from 'lucide-react'

export default function CustomPlansPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    
    // Contact Information
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    position: '',
    
    // Business Requirements
    monthlyListings: '',
    expectedRevenue: '',
    customFeatures: '',
    specialRequirements: '',
    
    // Additional Information
    budget: '',
    timeline: '',
    message: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      toast({
        title: '⚠️ Agreement Required',
        description: 'Please read and agree to the confidentiality terms',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Send support ticket email with custom plan request
      const response = await fetch('/api/emails/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: formData.email,
          userName: formData.fullName,
          ticket: {
            id: `CUSTOM-${Date.now()}`,
            subject: `Custom Plan Request - ${formData.companyName}`,
            category: 'Custom Enterprise Plan',
            priority: 'High',
            message: `
CUSTOM PLAN REQUEST

Company Information:
- Company Name: ${formData.companyName}
- Company Size: ${formData.companySize}
- Industry: ${formData.industry}
- Website: ${formData.website || 'N/A'}

Contact Information:
- Name: ${formData.fullName}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Position: ${formData.position}

Business Requirements:
- Monthly Listings: ${formData.monthlyListings}
- Expected Revenue: ${formData.expectedRevenue}
- Custom Features: ${formData.customFeatures}
- Special Requirements: ${formData.specialRequirements}

Budget & Timeline:
- Budget Range: ${formData.budget}
- Timeline: ${formData.timeline}

Additional Message:
${formData.message}

Confidentiality Agreement: Accepted
Submission Date: ${new Date().toLocaleString()}
            `.trim()
          }
        })
      })

      if (response.ok) {
        toast({
          title: '✅ Request Submitted!',
          description: 'Our sales team will contact you within 24 hours',
        })

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      toast({
        title: '❌ Submission Failed',
        description: 'Please try again or contact support directly',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="text-center mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600">
                Enterprise Solutions
              </Badge>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Custom Enterprise Plans
              </h1>
              <p className="text-lg text-muted-foreground">
                Tailored solutions for businesses with unique requirements
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <Package className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">Custom Features</h3>
                <p className="text-sm text-muted-foreground">
                  Get features built specifically for your business needs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-pink-600 mb-3" />
                <h3 className="font-semibold mb-2">Dedicated Support</h3>
                <p className="text-sm text-muted-foreground">
                  Priority support with a dedicated account manager
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <DollarSign className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">Flexible Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Pay only for what you need with custom pricing tiers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Plan Request</CardTitle>
                <CardDescription>
                  Fill out this form and our sales team will contact you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        required
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companySize">Company Size *</Label>
                      <Input
                        id="companySize"
                        value={formData.companySize}
                        onChange={(e) => handleChange('companySize', e.target.value)}
                        required
                        placeholder="e.g., 50-100 employees"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        required
                        placeholder="e.g., Technology, Real Estate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position/Title *</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        required
                        placeholder="CEO, CTO, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Business Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Business Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthlyListings">Expected Monthly Listings *</Label>
                      <Input
                        id="monthlyListings"
                        value={formData.monthlyListings}
                        onChange={(e) => handleChange('monthlyListings', e.target.value)}
                        required
                        placeholder="e.g., 500+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedRevenue">Expected Monthly Revenue *</Label>
                      <Input
                        id="expectedRevenue"
                        value={formData.expectedRevenue}
                        onChange={(e) => handleChange('expectedRevenue', e.target.value)}
                        required
                        placeholder="e.g., $50,000+"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="customFeatures">Required Custom Features</Label>
                      <Textarea
                        id="customFeatures"
                        value={formData.customFeatures}
                        onChange={(e) => handleChange('customFeatures', e.target.value)}
                        placeholder="Describe any specific features you need (API access, white-labeling, integrations, etc.)"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={(e) => handleChange('specialRequirements', e.target.value)}
                        placeholder="Any compliance, security, or integration requirements"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget & Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Budget Range</Label>
                      <Input
                        id="budget"
                        value={formData.budget}
                        onChange={(e) => handleChange('budget', e.target.value)}
                        placeholder="e.g., $500-1000/month"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeline">Implementation Timeline</Label>
                      <Input
                        id="timeline"
                        value={formData.timeline}
                        onChange={(e) => handleChange('timeline', e.target.value)}
                        placeholder="e.g., Within 2 months"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Any other details you'd like to share"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Confidentiality Agreement */}
                <Card className="border-2 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Confidentiality Agreement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-2 text-muted-foreground">
                      <p>
                        <strong>CONFIDENTIAL INFORMATION PROTECTION</strong>
                      </p>
                      <p>
                        By submitting this form, you acknowledge and agree that:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>All information provided will be treated as confidential business information</li>
                        <li>Leli Rentals will not share your data with third parties without consent</li>
                        <li>Your information will be used solely for creating your custom enterprise plan</li>
                        <li>We maintain industry-standard security measures to protect your data</li>
                        <li>You may request deletion of your information at any time</li>
                        <li>All discussions and proposals will remain confidential</li>
                      </ul>
                      <p className="mt-4">
                        <strong>DATA PROTECTION</strong>
                      </p>
                      <p>
                        We comply with GDPR, CCPA, and other data protection regulations. Your personal and business 
                        information is encrypted and stored securely. We will never sell or distribute your information.
                      </p>
                      <p className="mt-4">
                        <strong>CONTACT</strong>
                      </p>
                      <p>
                        For questions about this agreement, contact: privacy@lelirentals.com
                      </p>
                    </div>

                    <div className="flex items-start space-x-3 pt-4 border-t">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        I have read and agree to the confidentiality terms stated above, and I authorize 
                        Leli Rentals to contact me regarding this custom plan request. *
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !agreedToTerms}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Our sales team is here to assist you
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">sales@lelirentals.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">Available Worldwide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

