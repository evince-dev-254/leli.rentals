'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function CheckAdminStatusPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

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
            <p>Please sign in to check your admin status.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const publicRole = (user.publicMetadata?.role as string) || 'none'
  const unsafeRole = ((user.unsafeMetadata as any)?.role as string) || 'none'
  const isAdmin = publicRole === 'admin' || unsafeRole === 'admin'

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAdmin ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              Admin Status Check
            </CardTitle>
            <CardDescription>
              Verify your admin privileges and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm">{user.emailAddresses?.[0]?.emailAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Status</p>
                <Badge variant={isAdmin ? 'default' : 'destructive'}>
                  {isAdmin ? 'Admin ✅' : 'Not Admin ❌'}
                </Badge>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Public Metadata</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono">
                    role: "{publicRole}"
                  </p>
                  <Badge variant={publicRole === 'admin' ? 'default' : 'outline'} className="mt-2">
                    {publicRole === 'admin' ? 'Admin Role Set ✅' : 'No Admin Role ❌'}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Unsafe Metadata</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono">
                    role: "{unsafeRole}"
                  </p>
                  <Badge variant={unsafeRole === 'admin' ? 'default' : 'outline'} className="mt-2">
                    {unsafeRole === 'admin' ? 'Admin Role Set ✅' : 'No Admin Role ❌'}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Full Public Metadata</h3>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
                  {JSON.stringify(user.publicMetadata, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Full Unsafe Metadata</h3>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
                  {JSON.stringify(user.unsafeMetadata, null, 2)}
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isAdmin ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                {isAdmin ? (
                  <>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      ✅ You Have Admin Access!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      Your admin role is properly configured. You should be able to access admin routes.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => router.push('/admin-panel')}>
                        Go to Admin Panel
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/admin/verify-users')}>
                        Verify Users
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      ❌ No Admin Access
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      You don't have admin privileges. Follow these steps:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-red-700 dark:text-red-300 space-y-2">
                      <li>Go to your Clerk Dashboard</li>
                      <li>Navigate to Users → Find your user</li>
                      <li>Under &quot;Public Metadata&quot;, add: <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">{`{"role": "admin"}`}</code></li>
                      <li>Save changes</li>
                      <li>Sign out and sign back in</li>
                      <li>Return to this page to verify</li>
                    </ol>
                  </>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

