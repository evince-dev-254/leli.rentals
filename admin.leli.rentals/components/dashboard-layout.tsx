'use client'

import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Home,
    Calendar,
    Settings,
    Menu,
    X,
    DollarSign,
    Star,
    FileCheck,
    Shield,
    MessageSquare,
    Tag,
    LifeBuoy,
    User
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Listings', href: '/dashboard/listings', icon: Home },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Star },
    { name: 'Verifications', href: '/dashboard/verifications', icon: FileCheck },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Coupons', href: '/dashboard/coupons', icon: Tag },
    { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
    { name: 'Admins', href: '/dashboard/admins', icon: Shield },
    { name: 'Profile Images', href: '/dashboard/media/profile-images', icon: User },
    { name: 'Verifications Docs', href: '/dashboard/media/verification-documents', icon: FileCheck },
    { name: 'Listing Images', href: '/dashboard/media/listing-images', icon: Home },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white/10 backdrop-blur-md border-r border-white/20
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-white/20">
                        <h1 className="text-2xl font-bold text-white">Leli Admin</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                                            ? 'bg-white text-purple-600 shadow-lg'
                                            : 'text-white hover:bg-white/10'
                                        }
                  `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-white/20">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
                            <div suppressHydrationWarning>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                            {user && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.firstName || 'Admin'}
                                    </p>
                                    <p className="text-xs text-white/70 truncate">
                                        {user.emailAddresses?.[0]?.emailAddress}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold text-white">
                            {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                        </h2>
                        <div className="w-10 lg:hidden" /> {/* Spacer for mobile */}
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
