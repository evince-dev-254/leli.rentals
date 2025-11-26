"use client"

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Users, Database, AlertTriangle, Loader2 } from "lucide-react"

interface User {
    id: string
    email?: string
    firstName?: string
    lastName?: string
    imageUrl?: string
    createdAt?: number
    lastSignInAt?: number
    accountType?: string
    verificationStatus?: string
    user_id?: string
    avatar_url?: string
    account_type?: string
    verification_status?: string
    created_at?: string
}

export default function UserSyncPage() {
    const [activeTab, setActiveTab] = useState("clerk")
    const [clerkUsers, setClerkUsers] = useState<User[]>([])
    const [dbUsers, setDbUsers] = useState<User[]>([])
    const [syncIssues, setSyncIssues] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)

    const fetchClerkUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/users/clerk', {
                headers: {
                    'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''
                }
            })
            const data = await response.json()
            setClerkUsers(data.users || [])
        } catch (error) {
            console.error('Error fetching Clerk users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDbUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/users/database', {
                headers: {
                    'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''
                }
            })
            const data = await response.json()
            setDbUsers(data.users || [])
        } catch (error) {
            console.error('Error fetching database users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSyncIssues = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/users/sync-issues', {
                headers: {
                    'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''
                }
            })
            const data = await response.json()
            setSyncIssues(data.syncIssues || [])
        } catch (error) {
            console.error('Error fetching sync issues:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleManualSync = async () => {
        setSyncing(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (data.success) {
                alert(`Sync Complete: Synced ${data.synced} users. ${data.failed} failed.`)
                fetchSyncIssues()
                fetchDbUsers()
            } else {
                throw new Error(data.error || 'Sync failed')
            }
        } catch (error: any) {
            console.error('Sync error:', error)
            alert(`Sync Failed: ${error.message}`)
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => {
        if (activeTab === "clerk") {
            fetchClerkUsers()
        } else if (activeTab === "database") {
            fetchDbUsers()
        } else if (activeTab === "sync") {
            fetchSyncIssues()
        }
    }, [activeTab])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-2">User Sync Monitoring</h1>
                    <p className="text-white/70">Monitor and sync users between Clerk and Database</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
                        <TabsTrigger value="clerk" className="data-[state=active]:bg-white/20">
                            <Users className="mr-2 h-4 w-4" />
                            Clerk ({clerkUsers.length})
                        </TabsTrigger>
                        <TabsTrigger value="database" className="data-[state=active]:bg-white/20">
                            <Database className="mr-2 h-4 w-4" />
                            Database ({dbUsers.length})
                        </TabsTrigger>
                        <TabsTrigger value="sync" className="data-[state=active]:bg-white/20">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Issues ({syncIssues.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="clerk">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Clerk Users</h3>
                                        <p className="text-sm text-white/70">All users authenticated via Clerk</p>
                                    </div>
                                    <Button onClick={fetchClerkUsers} disabled={loading} className="bg-white/20 hover:bg-white/30">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/5 border-b border-white/20">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {clerkUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-white/5">
                                                        <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                                                        <td className="px-4 py-3 text-sm text-white">{user.firstName} {user.lastName}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                                                {user.accountType || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge className="bg-white/10 text-white">{user.verificationStatus || 'unverified'}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-white/70">
                                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="database">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Database Users</h3>
                                        <p className="text-sm text-white/70">All users in Supabase database</p>
                                    </div>
                                    <Button onClick={fetchDbUsers} disabled={loading} className="bg-white/20 hover:bg-white/30">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/5 border-b border-white/20">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">User ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {dbUsers.map((user) => (
                                                    <tr key={user.user_id} className="hover:bg-white/5">
                                                        <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                                                        <td className="px-4 py-3 text-xs font-mono text-white/70">{user.user_id?.substring(0, 12)}...</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                                                {user.account_type || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge className="bg-white/10 text-white">{user.verification_status || 'unverified'}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-white/70">
                                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sync">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Sync Issues</h3>
                                        <p className="text-sm text-white/70">Users in Clerk but missing from database</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={fetchSyncIssues} disabled={loading} variant="outline" className="bg-white/10 hover:bg-white/20">
                                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </Button>
                                        <Button onClick={handleManualSync} disabled={syncing || syncIssues.length === 0} className="bg-orange-500 hover:bg-orange-600">
                                            {syncing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Database className="mr-2 h-4 w-4" />
                                            )}
                                            Sync All
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                ) : syncIssues.length === 0 ? (
                                    <div className="text-center p-8 text-white/70">
                                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No sync issues found! All users are synchronized.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/5 border-b border-white/20">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Created in Clerk</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {syncIssues.map((user) => (
                                                    <tr key={user.id} className="hover:bg-white/5">
                                                        <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                                                        <td className="px-4 py-3 text-sm text-white">{user.firstName} {user.lastName}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                                                {user.accountType || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-white/70">
                                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
