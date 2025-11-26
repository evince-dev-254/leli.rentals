'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { statsService, type PlatformStats } from '@/lib/services/stats'
import { BarChart3, RefreshCw, TrendingUp, ArrowLeft } from 'lucide-react'

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchStats()
    }
  }, [isLoaded, user])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const data = await statsService.getPlatformStats()
      setPlatformStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to load analytics',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || isLoading) {
    return <LoadingSpinner message="Loading analytics..." variant="admin" />
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Comprehensive platform insights and statistics
            </p>
          </div>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {platformStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{platformStats.users.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {platformStats.users.owners} owners, {platformStats.users.renters} renters
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{platformStats.listings.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {platformStats.listings.published} published
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{platformStats.bookings.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {platformStats.bookings.confirmed} confirmed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${platformStats.revenue.total.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${platformStats.revenue.monthly.toLocaleString()} this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Listings by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(platformStats.listings.categories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded">
                      <span className="capitalize font-medium">{category}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

