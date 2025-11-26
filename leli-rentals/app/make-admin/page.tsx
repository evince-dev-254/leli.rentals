'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function MakeAdminPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleMakeAdmin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/make-me-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage('✅ Admin role set successfully! Please sign out and sign back in to apply changes.')
      } else {
        setSuccess(false)
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error: any) {
      setSuccess(false)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Set Admin Role
            </CardTitle>
            <CardDescription>
              Grant yourself admin privileges for the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2"><strong>Current User:</strong></p>
              <p className="text-sm">Name: {user.firstName} {user.lastName}</p>
              <p className="text-sm">Email: {user.emailAddresses?.[0]?.emailAddress}</p>
              <p className="text-xs font-mono mt-2">ID: {user.id}</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> After clicking the button below:
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Admin role will be added to your account</li>
                  <li>You MUST sign out</li>
                  <li>Sign back in to refresh your session</li>
                  <li>Then you can access admin routes</li>
                </ol>
              </AlertDescription>
            </Alert>

            {message && (
              <Alert variant={success ? 'default' : 'destructive'}>
                {success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleMakeAdmin}
                disabled={loading || success}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Setting Admin Role...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Admin Role Set!
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Make Me Admin
                  </>
                )}
              </Button>

              {success && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/check-admin-status')}
                  className="w-full"
                >
                  Check Admin Status
                </Button>
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>⚠️ This is a development tool</p>
              <p>Delete <code className="text-xs">/app/api/make-me-admin/route.ts</code> before deploying to production</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

