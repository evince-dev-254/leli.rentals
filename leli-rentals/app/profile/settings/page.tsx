"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User, Mail, Phone, Shield, Bell, Eye, EyeOff,
  Lock, Key, Trash2, Save, AlertTriangle, CheckCircle, Globe,
  Smartphone, MessageSquare, ArrowLeft, QrCode, Copy, Download,
  Crown, Building, CreditCard, Settings as SettingsIcon, FileText, BarChart
} from "lucide-react"
import { useUser } from '@clerk/nextjs'
import { userSettingsService, UserSettings } from "@/lib/user-settings-service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getUserAccountType } from "@/lib/account-type-utils"
import { AccountTypeRequiredDropdown } from "@/components/account-type-required-dropdown"

export default function AccountSettingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("profile")
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  
  // SMS Verification states
  const [showSMSSetup, setShowSMSSetup] = useState(false)
  const [smsPhoneNumber, setSmsPhoneNumber] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [smsCodeSent, setSmsCodeSent] = useState(false)
  const [isVerifyingSMS, setIsVerifyingSMS] = useState(false)
  
  // Authenticator states
  const [showAuthenticatorSetup, setShowAuthenticatorSetup] = useState(false)
  const [authenticatorSecret, setAuthenticatorSecret] = useState("")
  const [authenticatorQR, setAuthenticatorQR] = useState("")
  const [authenticatorCode, setAuthenticatorCode] = useState("")
  const [isVerifyingAuthenticator, setIsVerifyingAuthenticator] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
  })

  // Get user account type
  const userAccountType = (user?.unsafeMetadata?.accountType as string) || 
                          (user?.publicMetadata?.accountType as string) || 
                          'renter'

  // Check if user has account type
  const hasAccountType = user && (
    (user.publicMetadata?.accountType as string) || 
    (user.unsafeMetadata?.accountType as string)
  )

  // Get email verification status from Clerk
  const isEmailVerified = user?.emailAddresses?.[0]?.verification?.status === 'verified'

  // Handle redirect if not logged in
  useEffect(() => {
    if (!user && isLoaded) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return

      try {
        const settings = await userSettingsService.getUserSettings(user.id)
        setUserSettings(settings)
        
        if (settings?.profile) {
          setProfileData({
            name: settings.profile.name || user.fullName || "",
            email: settings.profile.email || user.emailAddresses[0]?.emailAddress || "",
            phone: settings.profile.phone || "",
            location: settings.profile.location || "",
            bio: settings.profile.bio || "",
            website: settings.profile.website || "",
          })
          setPhoneNumber(settings.profile.phone || "")
        } else {
          setProfileData({
            name: user.fullName || "",
            email: user.emailAddresses[0]?.emailAddress || "",
            phone: "",
            location: "",
            bio: "",
            website: "",
          })
        }
      } catch (error) {
        console.error("Error loading user settings:", error)
      }
    }
    loadUserSettings()
  }, [user])

  // Handle email verification
  const handleSendVerificationEmail = async () => {
    if (!user) return

    setIsSendingVerification(true)
    try {
      // Use Clerk's prepareEmailAddressVerification with code strategy
      await user.emailAddresses[0]?.prepareVerification({ strategy: 'email_code' })
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification code.",
      })
    } catch (error: any) {
      console.error('Error sending verification email:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive"
      })
    } finally {
      setIsSendingVerification(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user?.id) return

    try {
      await userSettingsService.updateProfile(user.id, profileData)
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  // Handle phone number save
  const handlePhoneNumberSave = async () => {
    if (!user?.id) return

    try {
      await userSettingsService.updatePhoneNumber(user.id, phoneNumber)
      setProfileData(prev => ({ ...prev, phone: phoneNumber }))
      
      toast({
        title: "Phone Number Updated",
        description: "Your phone number has been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update phone number",
        variant: "destructive"
      })
    }
  }

  // Handle MFA method toggle
  const handleMFAMethodToggle = async (method: 'sms' | 'authenticator' | 'backupCodes', enabled: boolean) => {
    if (!user?.id) return

    if (enabled) {
      // Show setup dialog instead of directly enabling
      if (method === 'sms') {
        setShowSMSSetup(true)
        return
      } else if (method === 'authenticator') {
        // Generate secret and QR code
        const secret = generateRandomSecret()
        setAuthenticatorSecret(secret)
        const qrData = `otpauth://totp/LeliRentals:${user.emailAddresses[0]?.emailAddress}?secret=${secret}&issuer=LeliRentals`
        setAuthenticatorQR(qrData)
        setShowAuthenticatorSetup(true)
        return
      }
    }

    try {
      if (enabled) {
        await userSettingsService.enableMFAMethod(user.id, method)
      } else {
        await userSettingsService.disableMFAMethod(user.id, method)
      }

      if (userSettings) {
        setUserSettings({
          ...userSettings,
          security: {
            ...userSettings.security,
            mfaMethods: {
              ...userSettings.security.mfaMethods,
              [method]: enabled
            }
          }
        })
      }

      toast({
        title: `${method.toUpperCase()} ${enabled ? 'Enabled' : 'Disabled'}`,
        description: `Multi-factor authentication via ${method} has been ${enabled ? 'enabled' : 'disabled'}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update MFA method",
        variant: "destructive"
      })
    }
  }

  // Generate random secret for authenticator
  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)]
    }
    return secret
  }

  // Handle SMS verification code send
  const handleSendSMSCode = async () => {
    if (!smsPhoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive"
      })
      return
    }

    setIsSendingSMS(true)
    try {
      // Simulate sending SMS (in production, this would call your SMS provider API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSmsCodeSent(true)
      toast({
        title: "Code Sent",
        description: `Verification code sent to ${smsPhoneNumber}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send SMS code",
        variant: "destructive"
      })
    } finally {
      setIsSendingSMS(false)
    }
  }

  // Handle SMS code verification
  const handleVerifySMSCode = async () => {
    if (!smsCode || smsCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      })
      return
    }

    setIsVerifyingSMS(true)
    try {
      // Simulate verification (in production, verify with your backend)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Enable SMS MFA
      if (user?.id) {
        await userSettingsService.enableMFAMethod(user.id, 'sms')
        await userSettingsService.updatePhoneNumber(user.id, smsPhoneNumber)
        
        if (userSettings) {
          setUserSettings({
            ...userSettings,
            security: {
              ...userSettings.security,
              mfaMethods: {
                ...userSettings.security.mfaMethods,
                sms: true
              },
              phoneNumber: smsPhoneNumber
            }
          })
        }
      }
      
      toast({
        title: "SMS Verification Enabled",
        description: "You can now use SMS codes for two-factor authentication",
      })
      
      setShowSMSSetup(false)
      setSmsCode("")
      setSmsCodeSent(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify SMS code",
        variant: "destructive"
      })
    } finally {
      setIsVerifyingSMS(false)
    }
  }

  // Handle authenticator verification
  const handleVerifyAuthenticator = async () => {
    if (!authenticatorCode || authenticatorCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      })
      return
    }

    setIsVerifyingAuthenticator(true)
    try {
      // Simulate verification (in production, verify TOTP code with your backend)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Enable Authenticator MFA
      if (user?.id) {
        await userSettingsService.enableMFAMethod(user.id, 'authenticator')
        
        if (userSettings) {
          setUserSettings({
            ...userSettings,
            security: {
              ...userSettings.security,
              mfaMethods: {
                ...userSettings.security.mfaMethods,
                authenticator: true
              }
            }
          })
        }
      }
      
      toast({
        title: "Authenticator Enabled",
        description: "You can now use your authenticator app for two-factor authentication",
      })
      
      setShowAuthenticatorSetup(false)
      setAuthenticatorCode("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify authenticator code",
        variant: "destructive"
      })
    } finally {
      setIsVerifyingAuthenticator(false)
    }
  }

  // Handle backup codes generation
  const handleGenerateBackupCodes = async () => {
    if (!user?.id) return

    try {
      const codes = await userSettingsService.generateBackupCodes(user.id)
      setBackupCodes(codes)
      setShowBackupCodes(true)

      if (userSettings) {
        setUserSettings({
          ...userSettings,
          security: {
            ...userSettings.security,
            backupCodes: codes,
            mfaMethods: {
              ...userSettings.security.mfaMethods,
              backupCodes: true
            }
          }
        })
      }
      
      toast({
        title: "Backup Codes Generated",
        description: "Save these codes in a safe place",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate backup codes",
        variant: "destructive"
      })
    }
  }

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
      toast({
      title: "Codes Copied",
      description: "Backup codes copied to clipboard",
    })
  }

  const handleDownloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
      toast({
      title: "Codes Downloaded",
      description: "Backup codes have been downloaded",
      })
  }

  // Handle notification toggle
  const handleNotificationToggle = async (setting: string, value: boolean) => {
    if (!user?.id) return

    try {
      await userSettingsService.updateNotificationSettings(user.id, { [setting]: value })
      
      if (userSettings) {
        setUserSettings({
          ...userSettings,
          notifications: { ...userSettings.notifications, [setting]: value }
        })
      }
      
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      })
    }
  }

  // Handle privacy toggle
  const handlePrivacyToggle = async (setting: string, value: any) => {
    if (!user?.id) return

    try {
      await userSettingsService.updatePrivacySettings(user.id, { [setting]: value })
      
      if (userSettings) {
        setUserSettings({
          ...userSettings,
          privacy: { ...userSettings.privacy, [setting]: value }
        })
      }

      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings",
        variant: "destructive"
      })
    }
  }

  // Show account type reminder if not set - BLOCK ACCESS
  if (isLoaded && user && !hasAccountType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <AccountTypeRequiredDropdown blocking={true} />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Account Type Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please select an account type above to access settings and other features.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
            <Button 
          variant="ghost"
          size="sm"
              onClick={() => router.back()}
          className="mb-4 hover:bg-purple-100 dark:hover:bg-purple-900"
            >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
            </Button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account Settings</h1>
            </div>
            {userAccountType === 'owner' && (
              <Badge className="bg-gradient-to-r from-orange-500 to-purple-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Owner Account
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 overflow-x-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            {userAccountType === 'owner' && (
              <TabsTrigger value="business">Business</TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Account Type Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-orange-600" />
                  Account Type
                </CardTitle>
                <CardDescription>Switch between renter and owner accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      userAccountType === 'owner' 
                        ? 'bg-orange-100 dark:bg-orange-900/30' 
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {userAccountType === 'owner' ? (
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-semibold">
                        Current Account: {userAccountType === 'owner' ? 'Owner' : 'Renter'}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {userAccountType === 'owner' 
                          ? 'You can list items and manage bookings' 
                          : 'You can browse and book rentals'}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/profile/switch-account')}
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    Switch Account Type
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                          />
                        </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                      disabled
                      className="bg-gray-50"
                          />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                        </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                          <Input
                            id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="flex-1"
                      />
                      <Button onClick={handlePhoneNumberSave} variant="outline" size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                        </div>
                  </div>
                  <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                          />
                        </div>
                  <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                          />
                        </div>
                  <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={4}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} className="bg-blue-600 hover:bg-blue-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Email Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email Verification
                </CardTitle>
                <CardDescription>Verify your email address for added security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isEmailVerified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {isEmailVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <div className="font-medium">
                        {isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                    </div>
                      <div className="text-sm text-muted-foreground">
                        {user.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                </div>
                  {!isEmailVerified && (
                    <Button 
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingVerification}
                      variant="outline"
                      size="sm"
                    >
                      {isSendingVerification ? 'Sending...' : 'Send Verification Email'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Multi-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Multi-Factor Authentication
                </CardTitle>
                <CardDescription>Add extra layers of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SMS Verification */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">SMS Verification Code</div>
                      <div className="text-sm text-muted-foreground">
                        Receive verification codes via SMS
                      </div>
                      {!phoneNumber && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Add a phone number in the Profile tab first
                      </div>
                      )}
                    </div>
                    </div>
                  <Switch
                    checked={userSettings?.security?.mfaMethods?.sms || false}
                    onCheckedChange={(checked) => handleMFAMethodToggle('sms', checked)}
                    disabled={!phoneNumber}
                  />
                  </div>

                {/* Authenticator App */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Authenticator Application</div>
                      <div className="text-sm text-muted-foreground">
                        Use Google Authenticator, Authy, or similar apps
                    </div>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings?.security?.mfaMethods?.authenticator || false}
                    onCheckedChange={(checked) => handleMFAMethodToggle('authenticator', checked)}
                  />
                </div>

                {/* Backup Codes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-green-600" />
                    <div>
                        <div className="font-medium">Backup Codes</div>
                      <div className="text-sm text-muted-foreground">
                          Generate emergency access codes
                      </div>
                    </div>
                  </div>
                    <Switch
                      checked={userSettings?.security?.mfaMethods?.backupCodes || false}
                      onCheckedChange={(checked) => handleMFAMethodToggle('backupCodes', checked)}
                    />
                      </div>

                  {userSettings?.security?.mfaMethods?.backupCodes && (
                          <Button
                      onClick={handleGenerateBackupCodes}
                      variant="outline"
                      className="w-full"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Generate New Backup Codes
                          </Button>
                        )}
                      </div>
              </CardContent>
            </Card>

            {/* SMS Setup Dialog */}
            <Dialog open={showSMSSetup} onOpenChange={setShowSMSSetup}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Setup SMS Verification
                  </DialogTitle>
                  <DialogDescription>
                    Enter your phone number to receive verification codes
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={smsPhoneNumber}
                      onChange={(e) => setSmsPhoneNumber(e.target.value)}
                      disabled={smsCodeSent}
                    />
                  </div>

                  {!smsCodeSent ? (
                    <Button 
                      onClick={handleSendSMSCode}
                      disabled={isSendingSMS || !smsPhoneNumber}
                      className="w-full"
                    >
                      {isSendingSMS ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sms-code">Verification Code</Label>
                        <Input
                          id="sms-code"
                          type="text"
                          placeholder="123456"
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit code sent to {smsPhoneNumber}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleVerifySMSCode}
                          disabled={isVerifyingSMS || smsCode.length !== 6}
                          className="flex-1"
                        >
                          {isVerifyingSMS ? 'Verifying...' : 'Verify Code'}
                        </Button>
                        <Button
                          onClick={() => {
                            setSmsCodeSent(false)
                            setSmsCode("")
                          }}
                          variant="outline"
                        >
                          Resend
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Standard SMS rates may apply. Make sure you have access to this phone number.
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Authenticator Setup Dialog */}
            <Dialog open={showAuthenticatorSetup} onOpenChange={setShowAuthenticatorSetup}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    Setup Authenticator App
                  </DialogTitle>
                  <DialogDescription>
                    Scan the QR code with your authenticator app
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Step 1: Scan QR Code</p>
                    <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                      {authenticatorQR && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(authenticatorQR)}`}
                          alt="QR Code"
                          className="w-48 h-48"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">Or enter this code manually:</p>
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                        {authenticatorSecret}
                      </code>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Step 2: Enter Verification Code</p>
                    <div className="space-y-2">
                      <Label htmlFor="auth-code">6-Digit Code from App</Label>
                      <Input
                        id="auth-code"
                        type="text"
                        placeholder="123456"
                        value={authenticatorCode}
                        onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                      />
                    </div>

                    <Button
                      onClick={handleVerifyAuthenticator}
                      disabled={isVerifyingAuthenticator || authenticatorCode.length !== 6}
                      className="w-full"
                    >
                      {isVerifyingAuthenticator ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground bg-purple-50 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Recommended apps: Google Authenticator, Authy, Microsoft Authenticator
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Backup Codes Dialog */}
            <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Your Backup Codes</DialogTitle>
                  <DialogDescription>
                    Save these codes in a safe place. Each code can only be used once.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="py-1">
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCopyBackupCodes} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Codes
                    </Button>
                    <Button onClick={handleDownloadBackupCodes} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Store these codes securely. They are your only backup if you lose access to other MFA methods.
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Account Section */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warning: This action is irreversible
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    <li>All your personal information will be deleted</li>
                    <li>All your listings will be removed</li>
                    <li>All your bookings and messages will be deleted</li>
                    <li>Your reviews and ratings will be removed</li>
                    <li>You will lose access to all premium features</li>
                    <li>This action cannot be reversed</li>
                  </ul>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <div className="text-red-600 dark:text-red-400 font-semibold">
                          This will permanently delete your account and remove all your data from our servers.
                        </div>
                        <div>This includes:</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Your profile and personal information</li>
                          <li>All listings you've created</li>
                          <li>Your booking history</li>
                          <li>All messages and conversations</li>
                          <li>Your reviews and ratings</li>
                          <li>Payment and subscription information</li>
                        </ul>
                        <div className="font-semibold pt-2">
                          This action cannot be undone. Are you sure you want to continue?
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/account/delete', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' }
                            })

                            if (response.ok) {
                              toast({
                                title: "Account Deleted",
                                description: "Your account has been permanently deleted. Redirecting...",
                                duration: 3000,
                              })
                              
                              // Redirect to home page after short delay
                              setTimeout(() => {
                                window.location.href = '/'
                              }, 2000)
                            } else {
                              throw new Error('Failed to delete account')
                            }
                          } catch (error) {
                            console.error('Error deleting account:', error)
                            toast({
                              title: "Error",
                              description: "Failed to delete account. Please try again or contact support.",
                              variant: "destructive"
                            })
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Communication Channels</h3>
                  
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email Notifications</span>
                  </div>
                  <Switch
                    checked={userSettings?.notifications?.emailNotifications || false}
                    onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">SMS Notifications</span>
                  </div>
                  <Switch
                    checked={userSettings?.notifications?.smsNotifications || false}
                    onCheckedChange={(checked) => handleNotificationToggle('smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Push Notifications</span>
                  </div>
                  <Switch
                    checked={userSettings?.notifications?.pushNotifications || false}
                    onCheckedChange={(checked) => handleNotificationToggle('pushNotifications', checked)}
                  />
                  </div>
                </div>
                
                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Activity Alerts</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Booking Updates</span>
                  </div>
                  <Switch
                    checked={userSettings?.notifications?.bookingUpdates || false}
                    onCheckedChange={(checked) => handleNotificationToggle('bookingUpdates', checked)}
                  />
                </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Payment Reminders</span>
                    </div>
                    <Switch
                      checked={userSettings?.notifications?.paymentReminders || false}
                      onCheckedChange={(checked) => handleNotificationToggle('paymentReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Security Alerts</span>
                  </div>
                  <Switch
                    checked={userSettings?.notifications?.securityAlerts || false}
                    onCheckedChange={(checked) => handleNotificationToggle('securityAlerts', checked)}
                  />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control what information is visible to others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Profile Visibility</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="public"
                        name="visibility"
                        value="public"
                        checked={userSettings?.privacy?.profileVisibility === "public"}
                        onChange={(e) => handlePrivacyToggle('profileVisibility', e.target.value)}
                        className="text-blue-600"
                        aria-label="Public profile visibility"
                      />
                      <Label htmlFor="public" className="text-sm cursor-pointer">
                        Public - Anyone can view your profile
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="private"
                        name="visibility"
                        value="private"
                        checked={userSettings?.privacy?.profileVisibility === "private"}
                        onChange={(e) => handlePrivacyToggle('profileVisibility', e.target.value)}
                        className="text-blue-600"
                        aria-label="Private profile visibility"
                      />
                      <Label htmlFor="private" className="text-sm cursor-pointer">
                        Private - Only you can view your full profile
                      </Label>
                    </div>
                  </div>
                </div>
                
                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Contact Information</h3>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm">Show Email Address</span>
                  <Switch
                    checked={userSettings?.privacy?.showEmail || false}
                    onCheckedChange={(checked) => handlePrivacyToggle('showEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm">Show Phone Number</span>
                  <Switch
                    checked={userSettings?.privacy?.showPhone || false}
                    onCheckedChange={(checked) => handlePrivacyToggle('showPhone', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Location</span>
                  <Switch
                    checked={userSettings?.privacy?.showLocation || false}
                    onCheckedChange={(checked) => handlePrivacyToggle('showLocation', checked)}
                  />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow Messages from Others</span>
                    <Switch
                      checked={userSettings?.privacy?.allowMessages || false}
                      onCheckedChange={(checked) => handlePrivacyToggle('allowMessages', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab (Owner Only) */}
          {userAccountType === 'owner' && (
            <TabsContent value="business" className="space-y-6">
              <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-orange-600" />
                    Business Settings
                </CardTitle>
                  <CardDescription>Manage your business profile and preferences</CardDescription>
              </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <Crown className="h-6 w-6 text-orange-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Owner Account Benefits</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Create and manage unlimited listings
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Access to analytics dashboard
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Priority customer support
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Advanced booking management
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Quick Navigation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => router.push('/dashboard/owner')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                            <SettingsIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Dashboard</div>
                            <div className="text-xs text-muted-foreground">Manage your listings</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => router.push('/list-item')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Create New Listing</div>
                            <div className="text-xs text-muted-foreground">Add a new rental item</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => router.push('/dashboard/owner?tab=drafts')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">My Drafts</div>
                            <div className="text-xs text-muted-foreground">Resume editing drafts</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => router.push('/admin/analytics')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-lg">
                            <BarChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Analytics</div>
                            <div className="text-xs text-muted-foreground">View performance metrics</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => router.push('/profile/billing')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                            <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Billing & Subscription</div>
                            <div className="text-xs text-muted-foreground">Manage your plan</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => router.push('/verification')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                            <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Identity Verification</div>
                            <div className="text-xs text-muted-foreground">Verify your identity</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
