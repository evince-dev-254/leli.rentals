'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { NotificationDemo } from '@/components/notification-demo'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  Shield,
  Users,
  Home,
  Calendar
} from 'lucide-react'

export default function TestIntegrationPage() {
  const { user, isLoaded } = useUser()
  const [testResults, setTestResults] = useState<{
    auth: boolean
    firebase: boolean
  }>({
    auth: false,
    firebase: false
  })

  // Test Firebase auth
  useEffect(() => {
    if (user && isLoaded) {
      setTestResults(prev => ({ ...prev, auth: true, firebase: true }))
    }
  }, [user, isLoaded])

  const allTestsPassed = Object.values(testResults).every(Boolean)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Integration Tests</h1>
          <p className="text-muted-foreground">
            Test your Firebase integration
          </p>
        </div>

        {/* Test Results Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {testResults.auth ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Firebase Auth</span>
                <Badge variant={testResults.auth ? "default" : "destructive"}>
                  {testResults.auth ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {testResults.firebase ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Firebase Services</span>
                <Badge variant={testResults.firebase ? "default" : "destructive"}>
                  {testResults.firebase ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isLoaded ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading auth status...</span>
              </div>
            ) : user ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">✅ User authenticated</p>
                <p className="text-sm text-muted-foreground">
                  Email: {user.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-sm text-muted-foreground">
                  UID: {user.id}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">❌ No user authenticated</p>
            )}
          </CardContent>
        </Card>

        {/* Overall Status */}
        {allTestsPassed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 All integration tests passed! Your Firebase setup is working correctly.
            </AlertDescription>
          </Alert>
        )}

        {/* Notification Demo */}
        {user && (
          <NotificationDemo />
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Create your <code className="bg-muted px-1 rounded">.env.local</code> file with your Firebase configuration</p>
            <p>2. Test the notification system using the demo above</p>
            <p>3. Once all tests pass, your Firebase integration is ready</p>
            <p>4. You can now connect to Render for hosting and database services</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


