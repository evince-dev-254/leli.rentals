"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, CheckCircle, Send, Key } from "lucide-react"
import { userSettingsService } from "@/lib/user-settings-service"
import { useToast } from "@/hooks/use-toast"

interface PhoneVerificationProps {
  userId: string
  currentPhone?: string
  isVerified: boolean
  onVerificationChange: (verified: boolean) => void
}

export default function PhoneVerification({
  userId,
  currentPhone,
  isVerified,
  onVerificationChange
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const { toast } = useToast()

  const handleSendCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive"
      })
      return
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      })
      return
    }

    setIsSendingCode(true)
    try {
      // In a real implementation, this would send an SMS
      // For now, we'll just simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      })

      setCodeSent(true)
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      })
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    try {
      await userSettingsService.verifyPhoneNumber(userId, phoneNumber, verificationCode)

      toast({
        title: "Phone verified successfully",
        description: "Your phone number has been verified.",
      })

      setCodeSent(false)
      setVerificationCode("")
      onVerificationChange(true)
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify phone number",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Phone Verified</div>
              <div className="text-sm text-green-600">Your phone number has been verified</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to complete your account verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={codeSent}
          />
        </div>

        {!codeSent ? (
          <Button
            onClick={handleSendCode}
            disabled={isSendingCode || !phoneNumber}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSendingCode ? "Sending..." : "Send Verification Code"}
          </Button>
        ) : (
          <>
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                <Key className="h-4 w-4 mr-2" />
                {isVerifying ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCodeSent(false)
                  setVerificationCode("")
                }}
              >
                Change Number
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}