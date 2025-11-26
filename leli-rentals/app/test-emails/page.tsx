'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Mail, Send, CheckCircle2 } from 'lucide-react'

export default function TestEmailsPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const testEmail = async (type: string, additionalData?: any) => {
    setLoading(type)
    try {
      let endpoint = ''
      let body: any = {
        userEmail: email || 'test@example.com',
        userName: 'Test User'
      }

      switch (type) {
        case 'welcome':
          endpoint = '/api/emails/welcome'
          break
        case 'verification-submitted':
          endpoint = '/api/emails/verification'
          body.status = 'submitted'
          break
        case 'verification-approved':
          endpoint = '/api/emails/verification'
          body.status = 'approved'
          break
        case 'verification-rejected':
          endpoint = '/api/emails/verification'
          body.status = 'rejected'
          body.rejectionReason = 'Document not clear'
          break
        case 'account-reminder':
          endpoint = '/api/emails/welcome' // We'll use a cron job for this
          toast({
            title: '⚠️ Account Reminder',
            description: 'This email is sent automatically via cron job after 2-3 days of inactivity',
          })
          setLoading(null)
          return
        case 'we-miss-you':
          endpoint = '/api/emails/welcome' // We'll use a cron job for this
          toast({
            title: '⚠️ We Miss You',
            description: 'This email is sent automatically via cron job after 30+ days of inactivity',
          })
          setLoading(null)
          return
        case 'booking':
          endpoint = '/api/emails/booking'
          body.booking = {
            id: 'TEST123',
            itemName: 'Tesla Model 3',
            itemImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            totalPrice: 450,
            ownerName: 'John Doe',
            ownerEmail: 'owner@example.com'
          }
          break
        case 'payment':
          endpoint = '/api/emails/payment'
          body.payment = {
            id: 'PAY123456',
            amount: 450,
            method: 'Credit Card (**** 4242)',
            date: new Date().toISOString(),
            description: 'Rental payment for Tesla Model 3'
          }
          break
        case 'support':
          endpoint = '/api/emails/support'
          body.ticket = {
            id: 'TICK123',
            subject: 'Issue with booking',
            category: 'Booking',
            priority: 'High',
            message: 'I have an issue with my recent booking. The item was not as described.'
          }
          break
        case 'inquiry':
          endpoint = '/api/emails/inquiry'
          body.inquirySubject = 'Question about premium membership'
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: '✅ Email Sent!',
          description: `${type} email sent successfully to ${email || 'test@example.com'}`,
        })
      } else {
        throw new Error(data.error || 'Failed to send email')
      }
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.message || 'Failed to send email',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const emailTypes = [
    {
      id: 'welcome',
      title: '1. Welcome Email',
      description: 'Sent when user creates account',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'verification-submitted',
      title: '2. ID Verification Submitted',
      description: 'Confirms documents received',
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'verification-approved',
      title: '2b. ID Verification Approved',
      description: 'Verification successful',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'verification-rejected',
      title: '2c. ID Verification Rejected',
      description: 'Verification failed',
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 'account-reminder',
      title: '3. Account Type Reminder',
      description: 'After 2-3 days without account type',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'we-miss-you',
      title: '4. We Miss You',
      description: 'After 30+ days of inactivity',
      color: 'from-pink-500 to-purple-500'
    },
    {
      id: 'booking',
      title: '5. Booking Confirmation',
      description: 'New booking created',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'payment',
      title: '6. Payment Receipt',
      description: 'Payment received',
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'support',
      title: '7. Support Ticket',
      description: 'Ticket created',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'inquiry',
      title: '8. General Inquiry',
      description: 'Inquiry response',
      color: 'from-violet-500 to-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Email Service Testing
          </h1>
          <p className="text-muted-foreground">
            Test all email templates and triggers
          </p>
        </div>

        {/* Email Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Test Email Address
            </CardTitle>
            <CardDescription>
              Enter your email to receive test emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Leave empty to use test@example.com
            </p>
          </CardContent>
        </Card>

        {/* Email Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailTypes.map((emailType) => (
            <Card key={emailType.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${emailType.color}`} />
              <CardHeader>
                <CardTitle className="text-lg">{emailType.title}</CardTitle>
                <CardDescription>{emailType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => testEmail(emailType.id)}
                  disabled={loading !== null}
                  className={`w-full bg-gradient-to-r ${emailType.color}`}
                >
                  {loading === emailType.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                1. Get Resend API Key
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-6">
                <li>Go to <a href="https://resend.com/signup" target="_blank" className="text-blue-600 hover:underline">resend.com/signup</a></li>
                <li>Create a free account (100 emails/day)</li>
                <li>Get your API key from the dashboard</li>
                <li>Add to .env.local: <code className="bg-muted px-2 py-1 rounded">RESEND_API_KEY=re_...</code></li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                2. Configure Domain (Optional)
              </h4>
              <p className="text-sm text-muted-foreground ml-6">
                For production, verify your domain in Resend to send from your own email address.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                3. Set Up Cron Jobs
              </h4>
              <p className="text-sm text-muted-foreground ml-6 mb-2">
                For automated reminder emails, set up cron jobs:
              </p>
              <div className="bg-muted p-4 rounded-lg text-sm ml-6">
                <p className="font-mono mb-2"># Daily account type reminders</p>
                <p className="font-mono mb-4">curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/send-account-reminders</p>
                
                <p className="font-mono mb-2"># Weekly inactive user emails</p>
                <p className="font-mono">curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/send-inactive-reminders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

