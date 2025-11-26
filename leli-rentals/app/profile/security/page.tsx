'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Mail, 
  Clock, 
  MapPin, 
  Monitor, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Download,
  Settings
} from 'lucide-react'

interface SecuritySettings {
  twoFactorEnabled: boolean
  emailNotifications: boolean
  loginAlerts: boolean
  suspiciousActivityAlerts: boolean
  passwordExpiry: number // days
  sessionTimeout: number // minutes
}

interface LoginActivity {
  id: string
  timestamp: Date
  ipAddress: string
  location: string
  device: string
  browser: string
  isCurrent: boolean
}

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  emailNotifications: true,
  loginAlerts: true,
  suspiciousActivityAlerts: true,
  passwordExpiry: 90,
  sessionTimeout: 30
}

export default function SecurityPage() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [settings, setSettings] = useState<SecuritySettings>(defaultSecuritySettings)
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Password change form
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Email change form
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: ''
  })

  // 2FA setup
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchSecurityData = async () => {
      try {
        // Firebase removed - using mock data
        setSettings(defaultSecuritySettings)
        setLoginActivity([])
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching security data:', error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to load security information",
          variant: "destructive"
        })
      }
    }

    fetchSecurityData()
  }, [user, toast])

  const handleSaveSettings = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Firebase removed - simulating save
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Success",
        description: "Security settings saved successfully"
      })
    } catch (error) {
      console.error('Error saving security settings:', error)
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!user) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    try {
      // Firebase removed - simulating password change
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Success",
        description: "Password changed successfully"
      })

      setShowPasswordDialog(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      })
    }
  }

  const handleEmailChange = async () => {
    if (!user) return

    try {
      // Firebase removed - simulating email change
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Success",
        description: "Email changed successfully. Please check your new email for verification."
      })

      setShowEmailDialog(false)
      setEmailForm({
        newEmail: '',
        currentPassword: ''
      })
    } catch (error: any) {
      console.error('Error changing email:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to change email",
        variant: "destructive"
      })
    }
  }

  const handleEnable2FA = async () => {
    if (!user) return

    try {
      // In a real implementation, you would:
      // 1. Generate a secret key
      // 2. Show QR code for user to scan
      // 3. Verify the code they enter
      // 4. Enable 2FA if verification succeeds

      // For now, we'll simulate the process
      if (twoFactorCode.length !== 6) {
        toast({
          title: "Error",
          description: "Please enter a valid 6-digit code",
          variant: "destructive"
        })
        return
      }

      // Firebase removed - simulating 2FA enable
      await new Promise(resolve => setTimeout(resolve, 500))

      setSettings(prev => ({ ...prev, twoFactorEnabled: true }))

      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully"
      })

      setShow2FADialog(false)
      setTwoFactorCode('')
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive"
      })
    }
  }

  const handleDisable2FA = async () => {
    if (!user) return

    try {
      // Firebase removed - simulating 2FA disable
      await new Promise(resolve => setTimeout(resolve, 500))

      setSettings(prev => ({ ...prev, twoFactorEnabled: false }))

      toast({
        title: "Success",
        description: "Two-factor authentication disabled"
      })
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive"
      })
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!user) return

    try {
      // Firebase removed - simulating session revoke
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Success",
        description: "Session revoked successfully"
      })
    } catch (error) {
      console.error('Error revoking session:', error)
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive"
      })
    }
  }

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />
    } else if (device.toLowerCase().includes('tablet')) {
      return <Monitor className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account security and privacy</p>
      </div>

      <div className="space-y-8">
        {/* Password Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Password Security</CardTitle>
                <CardDescription>
                  Manage your password and authentication
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Change Password</Label>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handlePasswordChange} className="w-full">
                      Change Password
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Change Email</Label>
                <p className="text-sm text-gray-600">Update your account email address</p>
              </div>
              <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Email</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Email</DialogTitle>
                    <DialogDescription>
                      Enter your new email address and current password
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newEmail">New Email Address</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                        placeholder="new@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={emailForm.currentPassword}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleEmailChange} className="w-full">
                      Change Email
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={settings.twoFactorEnabled ? "default" : "secondary"}>
                  {settings.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!settings.twoFactorEnabled ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Two-factor authentication adds an extra layer of security by requiring a second form of verification when you sign in.
                </p>
                <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                      <DialogDescription>
                        Scan the QR code with your authenticator app and enter the code below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center rounded-lg">
                          <span className="text-gray-500">QR Code Placeholder</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="twoFactorCode">Enter 6-digit code</Label>
                        <Input
                          id="twoFactorCode"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                        />
                      </div>
                      <Button onClick={handleEnable2FA} className="w-full">
                        Enable 2FA
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Two-factor authentication is enabled</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
                </p>
                <Button variant="outline" onClick={handleDisable2FA}>
                  Disable 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle>Security Preferences</CardTitle>
                <CardDescription>
                  Configure your security and privacy settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive security alerts via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Login Alerts</Label>
                <p className="text-sm text-gray-600">Get notified of new login attempts</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginAlerts: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Label className="text-base font-medium">Suspicious Activity Alerts</Label>
                <p className="text-sm text-gray-600">Get notified of unusual account activity</p>
              </div>
              <Switch
                checked={settings.suspiciousActivityAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, suspiciousActivityAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Login Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div>
                <CardTitle>Login Activity</CardTitle>
                <CardDescription>
                  Monitor your account access and active sessions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(activity.device)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{activity.device}</span>
                        {activity.isCurrent && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{activity.browser}</p>
                      <p className="text-sm text-gray-600">
                        {activity.location} • {activity.ipAddress}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!activity.isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevokeSession(activity.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
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


