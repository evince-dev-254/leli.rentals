'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  Home, 
  User,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface NotificationSettings {
  email: {
    enabled: boolean
    bookingUpdates: boolean
    paymentReminders: boolean
    newMessages: boolean
    systemAlerts: boolean
    marketing: boolean
  }
  sms: {
    enabled: boolean
    bookingUpdates: boolean
    paymentReminders: boolean
    urgentAlerts: boolean
  }
  push: {
    enabled: boolean
    bookingUpdates: boolean
    newMessages: boolean
    systemAlerts: boolean
    marketing: boolean
  }
  inApp: {
    enabled: boolean
    bookingUpdates: boolean
    newMessages: boolean
    systemAlerts: boolean
    marketing: boolean
  }
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    bookingUpdates: true,
    paymentReminders: true,
    newMessages: true,
    systemAlerts: true,
    marketing: false
  },
  sms: {
    enabled: false,
    bookingUpdates: false,
    paymentReminders: true,
    urgentAlerts: true
  },
  push: {
    enabled: true,
    bookingUpdates: true,
    newMessages: true,
    systemAlerts: true,
    marketing: false
  },
  inApp: {
    enabled: true,
    bookingUpdates: true,
    newMessages: true,
    systemAlerts: true,
    marketing: false
  }
}

export default function NotificationsPage() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchNotificationSettings = async () => {
      try {
        // Firebase removed - using default settings
        setSettings(defaultSettings)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching notification settings:', error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to load notification settings",
          variant: "destructive"
        })
      }
    }

    fetchNotificationSettings()
  }, [user, toast])

  const handleSaveSettings = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Firebase removed - simulating save
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Success",
        description: "Notification settings saved successfully"
      })
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (path: string, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: any = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const handleEnableAll = (type: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: true,
        ...Object.keys(prev[type]).reduce((acc, key) => {
          if (key !== 'enabled') {
            acc[key] = true
          }
          return acc
        }, {} as any)
      }
    }))
  }

  const handleDisableAll = (type: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: false,
        ...Object.keys(prev[type]).reduce((acc, key) => {
          if (key !== 'enabled') {
            acc[key] = false
          }
          return acc
        }, {} as any)
      }
    }))
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600 mt-2">Manage how you receive notifications</p>
      </div>

      <div className="space-y-8">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications via email
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) => handleToggle('email.enabled', checked)}
                />
                <Label>Enable Email</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Booking Updates</Label>
                <p className="text-sm text-gray-600">Get notified about booking confirmations, changes, and cancellations</p>
              </div>
              <Switch
                checked={settings.email.bookingUpdates}
                onCheckedChange={(checked) => handleToggle('email.bookingUpdates', checked)}
                disabled={!settings.email.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Payment Reminders</Label>
                <p className="text-sm text-gray-600">Receive reminders about upcoming payments and invoices</p>
              </div>
              <Switch
                checked={settings.email.paymentReminders}
                onCheckedChange={(checked) => handleToggle('email.paymentReminders', checked)}
                disabled={!settings.email.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">New Messages</Label>
                <p className="text-sm text-gray-600">Get notified when you receive new messages from hosts or guests</p>
              </div>
              <Switch
                checked={settings.email.newMessages}
                onCheckedChange={(checked) => handleToggle('email.newMessages', checked)}
                disabled={!settings.email.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">System Alerts</Label>
                <p className="text-sm text-gray-600">Important system notifications and security alerts</p>
              </div>
              <Switch
                checked={settings.email.systemAlerts}
                onCheckedChange={(checked) => handleToggle('email.systemAlerts', checked)}
                disabled={!settings.email.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Marketing & Promotions</Label>
                <p className="text-sm text-gray-600">Receive updates about new features and special offers</p>
              </div>
              <Switch
                checked={settings.email.marketing}
                onCheckedChange={(checked) => handleToggle('email.marketing', checked)}
                disabled={!settings.email.enabled}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnableAll('email')}
                disabled={!settings.email.enabled}
              >
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisableAll('email')}
                disabled={!settings.email.enabled}
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>SMS Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications via text message
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.sms.enabled}
                  onCheckedChange={(checked) => handleToggle('sms.enabled', checked)}
                />
                <Label>Enable SMS</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Booking Updates</Label>
                <p className="text-sm text-gray-600">Get notified about booking confirmations and changes</p>
              </div>
              <Switch
                checked={settings.sms.bookingUpdates}
                onCheckedChange={(checked) => handleToggle('sms.bookingUpdates', checked)}
                disabled={!settings.sms.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Payment Reminders</Label>
                <p className="text-sm text-gray-600">Receive reminders about upcoming payments</p>
              </div>
              <Switch
                checked={settings.sms.paymentReminders}
                onCheckedChange={(checked) => handleToggle('sms.paymentReminders', checked)}
                disabled={!settings.sms.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Urgent Alerts</Label>
                <p className="text-sm text-gray-600">Critical notifications that require immediate attention</p>
              </div>
              <Switch
                checked={settings.sms.urgentAlerts}
                onCheckedChange={(checked) => handleToggle('sms.urgentAlerts', checked)}
                disabled={!settings.sms.enabled}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnableAll('sms')}
                disabled={!settings.sms.enabled}
              >
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisableAll('sms')}
                disabled={!settings.sms.enabled}
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications on your device
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.push.enabled}
                  onCheckedChange={(checked) => handleToggle('push.enabled', checked)}
                />
                <Label>Enable Push</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Booking Updates</Label>
                <p className="text-sm text-gray-600">Get notified about booking confirmations and changes</p>
              </div>
              <Switch
                checked={settings.push.bookingUpdates}
                onCheckedChange={(checked) => handleToggle('push.bookingUpdates', checked)}
                disabled={!settings.push.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">New Messages</Label>
                <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
              </div>
              <Switch
                checked={settings.push.newMessages}
                onCheckedChange={(checked) => handleToggle('push.newMessages', checked)}
                disabled={!settings.push.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">System Alerts</Label>
                <p className="text-sm text-gray-600">Important system notifications</p>
              </div>
              <Switch
                checked={settings.push.systemAlerts}
                onCheckedChange={(checked) => handleToggle('push.systemAlerts', checked)}
                disabled={!settings.push.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Marketing & Promotions</Label>
                <p className="text-sm text-gray-600">Receive updates about new features and offers</p>
              </div>
              <Switch
                checked={settings.push.marketing}
                onCheckedChange={(checked) => handleToggle('push.marketing', checked)}
                disabled={!settings.push.enabled}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnableAll('push')}
                disabled={!settings.push.enabled}
              >
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisableAll('push')}
                disabled={!settings.push.enabled}
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <div>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications within the app
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.inApp.enabled}
                  onCheckedChange={(checked) => handleToggle('inApp.enabled', checked)}
                />
                <Label>Enable In-App</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Booking Updates</Label>
                <p className="text-sm text-gray-600">Get notified about booking confirmations and changes</p>
              </div>
              <Switch
                checked={settings.inApp.bookingUpdates}
                onCheckedChange={(checked) => handleToggle('inApp.bookingUpdates', checked)}
                disabled={!settings.inApp.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">New Messages</Label>
                <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
              </div>
              <Switch
                checked={settings.inApp.newMessages}
                onCheckedChange={(checked) => handleToggle('inApp.newMessages', checked)}
                disabled={!settings.inApp.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">System Alerts</Label>
                <p className="text-sm text-gray-600">Important system notifications</p>
              </div>
              <Switch
                checked={settings.inApp.systemAlerts}
                onCheckedChange={(checked) => handleToggle('inApp.systemAlerts', checked)}
                disabled={!settings.inApp.enabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Marketing & Promotions</Label>
                <p className="text-sm text-gray-600">Receive updates about new features and offers</p>
              </div>
              <Switch
                checked={settings.inApp.marketing}
                onCheckedChange={(checked) => handleToggle('inApp.marketing', checked)}
                disabled={!settings.inApp.enabled}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnableAll('inApp')}
                disabled={!settings.inApp.enabled}
              >
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisableAll('inApp')}
                disabled={!settings.inApp.enabled}
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setSettings(defaultSettings)}
          >
            Reset to Default
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


