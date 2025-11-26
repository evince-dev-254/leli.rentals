'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function MyUserIdPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [copied, setCopied] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)

  const copyToClipboard = (text: string, setCopiedState: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopiedState(true)
    setTimeout(() => setCopiedState(false), 2000)
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isSignedIn || !user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
            <CardDescription>Please sign in to view your user ID</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/sign-in" className="text-blue-600 hover:underline">
              Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userId = user.id
  const email = user.emailAddresses?.[0]?.emailAddress || 'No email'

  const sqlCommand = `-- Create or update your profile to super admin
INSERT INTO user_profiles (user_id, role, account_type, verification_status)
VALUES ('${userId}', 'super_admin', 'owner', 'approved')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin';

-- Verify it worked
SELECT user_id, role, account_type, verification_status
FROM user_profiles
WHERE user_id = '${userId}';`

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Your User Information</CardTitle>
          <CardDescription>Use this information for admin setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User ID */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Clerk User ID</h3>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all">
              {userId}
            </div>
            <button
              onClick={() => copyToClipboard(userId, setCopied)}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              {copied ? '✅ Copied!' : '📋 Copy to clipboard'}
            </button>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Email</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              {email}
            </div>
          </div>

          {/* SQL Command to Promote */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">SQL Command to Promote to Super Admin</h3>
            <p className="text-sm text-gray-600">
              Run this in your Supabase SQL Editor to become a super admin:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{sqlCommand}</pre>
            </div>
            <button
              onClick={() => copyToClipboard(sqlCommand, setSqlCopied)}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              {sqlCopied ? '✅ Copied!' : '📋 Copy SQL command'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-blue-900">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Copy the SQL command above</li>
              <li>Go to your Supabase project dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Paste and run the command</li>
              <li>Refresh the admin dashboard</li>
              <li>You should now have access!</li>
            </ol>
          </div>

          {/* Quick Info */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">Important:</h3>
            <p className="text-sm text-amber-800">
              Make sure both apps use the <strong>same Clerk keys</strong>. Check that your admin dashboard
              <code className="bg-amber-100 px-1 rounded mx-1">.env.local</code> has the same
              <code className="bg-amber-100 px-1 rounded mx-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and
              <code className="bg-amber-100 px-1 rounded mx-1">CLERK_SECRET_KEY</code> as this main app.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
