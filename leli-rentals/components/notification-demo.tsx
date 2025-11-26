'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotificationTriggers } from '@/lib/hooks/use-notification-triggers'
import { useUser } from '@clerk/nextjs'
import { Bell, Calendar, Star, MessageCircle, CreditCard, AlertCircle } from 'lucide-react'

export function NotificationDemo() {
  const { user } = useUser()
  const {
    triggerBookingRequest,
    triggerBookingConfirmed,
    triggerNewReview,
    triggerMessageReceived,
    triggerPaymentReceived,
    triggerSystemAnnouncement
  } = useNotificationTriggers()

  if (!user) {
    return null
  }

  const handleTestNotification = async (type: string) => {
    switch (type) {
      case 'booking_request':
        await triggerBookingRequest(user.id, 'Test Listing - Luxury Apartment')
        break
      case 'booking_confirmed':
        await triggerBookingConfirmed(user.id, 'Test Listing - Luxury Apartment')
        break
      case 'new_review':
        await triggerNewReview(user.id, 'Test Listing - Luxury Apartment', 5)
        break
      case 'message_received':
        await triggerMessageReceived(user.id, 'Test Listing - Luxury Apartment')
        break
      case 'payment_received':
        await triggerPaymentReceived(user.id, 150, 'Test Listing - Luxury Apartment')
        break
      case 'system_announcement':
        await triggerSystemAnnouncement(user.id, 'System Update', 'New features have been added to the platform!')
        break
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Click the buttons below to test different types of notifications. 
          Check the notification bell in the header to see them.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleTestNotification('booking_request')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Booking Request
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleTestNotification('booking_confirmed')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Booking Confirmed
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleTestNotification('new_review')}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            New Review
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleTestNotification('message_received')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            New Message
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleTestNotification('payment_received')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Payment Received
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleTestNotification('system_announcement')}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            System Announcement
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>• Notifications are stored in Firebase Firestore</p>
          <p>• Real-time updates using Firestore listeners</p>
          <p>• Click notifications to mark as read</p>
          <p>• Use the notification bell in the header to view all notifications</p>
        </div>
      </CardContent>
    </Card>
  )
}

