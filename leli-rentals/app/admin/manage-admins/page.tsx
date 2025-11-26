'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Shield, ShieldCheck, User, Search, UserPlus, UserMinus, Activity } from 'lucide-react'

interface UserProfile {
    id: string
    user_id: string
    role: 'user' | 'admin' | 'super_admin'
    account_type: 'renter' | 'owner'
    verification_status: string
    created_at: string
}

interface AdminActivity {
    id: string
    admin_user_id: string
    action_type: string
    target_user_id: string | null
    details: any
    created_at: string
}

export default function ManageAdminsPage() {
    const { user } = useUser()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [admins, setAdmins] = useState<UserProfile[]>([])
    const [activityLog, setActivityLog] = useState<AdminActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [searchEmail, setSearchEmail] = useState('')
    const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin'>('admin')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch all users
            const usersRes = await fetch('/api/admin/users/list')
            if (usersRes.ok) {
                const usersData = await usersRes.json()
                setUsers(usersData.users || [])

                // Filter admins
                const adminUsers = (usersData.users || []).filter(
                    (u: UserProfile) => u.role === 'admin' || u.role === 'super_admin'
                )
                setAdmins(adminUsers)
            }

            // Fetch activity log
            const activityRes = await fetch('/api/admin/activity-log?limit=20')
            if (activityRes.ok) {
                const activityData = await activityRes.json()
                setActivityLog(activityData.activityLog || [])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const promoteUser = async (userId: string, role: 'admin' | 'super_admin') => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/promote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message || 'User promoted successfully')
                fetchData() // Refresh data
            } else {
                toast.error(data.error || 'Failed to promote user')
            }
        } catch (error) {
            console.error('Error promoting user:', error)
            toast.error('Failed to promote user')
        }
    }

    const demoteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to demote this user from admin?')) {
            return
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}/demote`, {
                method: 'POST',
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message || 'User demoted successfully')
                fetchData() // Refresh data
            } else {
                toast.error(data.error || 'Failed to demote user')
            }
        } catch (error) {
            console.error('Error demoting user:', error)
            toast.error('Failed to demote user')
        }
    }

    const searchUser = async () => {
        if (!searchEmail.trim()) {
            toast.error('Please enter an email address')
            return
        }

        try {
            const res = await fetch('/api/admin/search-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: searchEmail }),
            })

            const data = await res.json()

            if (res.ok && data.user) {
                // Show user details and promote option
                const userRole = data.user.publicMetadata?.role || 'user'
                toast.info(`User found: ${data.user.emailAddresses[0]?.emailAddress} (Role: ${userRole})`)
            } else {
                toast.error('User not found')
            }
        } catch (error) {
            console.error('Error searching user:', error)
            toast.error('Failed to search user')
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <Badge className="bg-purple-600"><ShieldCheck className="w-3 h-3 mr-1" />Super Admin</Badge>
            case 'admin':
                return <Badge className="bg-blue-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
            default:
                return <Badge variant="outline"><User className="w-3 h-3 mr-1" />User</Badge>
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Management</h1>
                    <p className="text-muted-foreground">Manage admin users and view activity</p>
                </div>
            </div>

            {/* Search and Promote User */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Promote User to Admin
                    </CardTitle>
                    <CardDescription>
                        Search for a user by email and promote them to admin or super admin
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search-email">User Email</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    id="search-email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                                />
                                <Button onClick={searchUser} variant="outline">
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </div>
                        <div className="w-48">
                            <Label htmlFor="role-select">Role</Label>
                            <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                                <SelectTrigger id="role-select" className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current Admins */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Current Admins ({admins.length})
                    </CardTitle>
                    <CardDescription>
                        Users with admin or super admin privileges
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {admins.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No admin users found</p>
                        ) : (
                            admins.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            {admin.role === 'super_admin' ? (
                                                <ShieldCheck className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <Shield className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{admin.user_id}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {admin.account_type} • {admin.verification_status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getRoleBadge(admin.role)}
                                        {admin.user_id !== user?.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => demoteUser(admin.user_id)}
                                            >
                                                <UserMinus className="w-4 h-4 mr-2" />
                                                Demote
                                            </Button>
                                        )}
                                        {admin.user_id === user?.id && (
                                            <Badge variant="secondary">You</Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Admin Activity
                    </CardTitle>
                    <CardDescription>
                        Last 20 admin actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {activityLog.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No activity logged yet</p>
                        ) : (
                            activityLog.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start justify-between p-3 border rounded-lg text-sm"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{activity.action_type}</div>
                                        <div className="text-muted-foreground">
                                            Admin: {activity.admin_user_id}
                                            {activity.target_user_id && ` → Target: ${activity.target_user_id}`}
                                        </div>
                                        {activity.details && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {JSON.stringify(activity.details)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
