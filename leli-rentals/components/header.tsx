"use client"

import type React from "react"

import { Search, Moon, Sun, User, Bell, ChevronDown, Menu, X, Shield, LogOut } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser, SignInButton, SignUpButton, SignedIn, SignedOut, useClerk } from '@clerk/nextjs'
import { useNotifications } from "@/lib/notification-context"
import { notificationsServiceRealtime } from "@/lib/notifications-service-realtime"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationPanel } from "@/components/notification-panel"

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const { signOut } = useClerk()
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [realtimeUnreadCount, setRealtimeUnreadCount] = useState(0)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const { user } = useUser()
  const { unreadCount, refreshNotifications } = useNotifications()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Get user account type from Clerk metadata
  const userAccountType = (user?.unsafeMetadata?.accountType as string) || 
                          (user?.publicMetadata?.accountType as string) || 
                          'renter'

  useEffect(() => {
    setMounted(true)
    // Create audio element for notification sound (optional)
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification-sound.mp3')
      audioRef.current.volume = 0.5
    }
  }, [])

  // Refresh notifications when user changes or panel opens
  useEffect(() => {
    if (user?.id) {
      refreshNotifications()
      loadUnreadCount()
    }
  }, [user?.id, refreshNotifications])

  // Setup real-time notification subscription
  useEffect(() => {
    if (!user?.id) return

    // Check if Supabase is configured
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('Supabase not configured, skipping real-time notifications')
      return
    }

    console.log('Setting up real-time notification subscription for user:', user.id)

    try {
      // Subscribe to real-time notifications
      const channel = notificationsServiceRealtime.subscribeToNotifications(
        user.id,
        (notification) => {
          console.log('New notification received via real-time:', notification)
          
          // Update unread count
          setRealtimeUnreadCount(prev => prev + 1)
          setHasNewNotification(true)
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message || '',
            duration: 5000,
          })
          
          // Play notification sound (optional)
          try {
            audioRef.current?.play().catch(err => console.log('Audio play failed:', err))
          } catch (error) {
            console.log('Error playing notification sound:', error)
          }
          
          // Trigger animation by resetting after a short delay
          setTimeout(() => setHasNewNotification(false), 300)
          
          // Refresh notifications list
          refreshNotifications()
        }
      )

      channelRef.current = channel

      // Cleanup subscription on unmount
      return () => {
        if (channelRef.current) {
          console.log('Cleaning up real-time notification subscription')
          notificationsServiceRealtime.unsubscribe(channelRef.current)
        }
      }
    } catch (error) {
      console.error('Error setting up real-time notifications:', error)
    }
  }, [user?.id, refreshNotifications, toast])

  // Load initial unread count
  const loadUnreadCount = async () => {
    if (!user?.id) return
    
    try {
      const count = await notificationsServiceRealtime.getUnreadCount(user.id)
      setRealtimeUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  // Refresh notifications when panel opens/closes
  useEffect(() => {
    if (isNotificationPanelOpen && user?.id) {
      refreshNotifications()
      loadUnreadCount()
    }
  }, [isNotificationPanelOpen, user?.id, refreshNotifications])

  // Use realtime count if available, fallback to context count
  const displayUnreadCount = realtimeUnreadCount || unreadCount

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/listings')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleNotificationPanelClose = () => {
    setIsNotificationPanelOpen(false)
    // Refresh notifications when panel closes to update unread count
    if (user?.id) {
      refreshNotifications()
    }
  }

  return (
        <header className="w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 shadow-theme">
      <div className="container mx-auto flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4 max-w-7xl gap-2">
        {/* Left: Logo and Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Menu Button - Only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex-shrink-0 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-all duration-200"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo - Smaller on mobile */}
          <Link href="/" className="flex items-center group shrink-0">
          <img 
            src="/default-monochrome-black.svg" 
            alt="Leli Rentals Logo" 
            className="h-4 w-auto sm:h-5 md:h-6 object-contain dark:hidden hover:opacity-80 transition-opacity duration-200"
          />
          <img 
            src="/default-monochrome-white.svg" 
            alt="Leli Rentals Logo" 
            className="h-4 w-auto sm:h-5 md:h-6 object-contain hidden dark:block hover:opacity-80 transition-opacity duration-200"
          />
        </Link>
        </div>

        {/* Navigation Links - Desktop only */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-center">
          <Link 
            href="/" 
            className="text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            href="/categories" 
            className="text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200"
          >
            Categories
          </Link>
          {/* More links in dropdown for cleaner header */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500">
                More <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/get-started" className="cursor-pointer">
                  Get Started
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about" className="cursor-pointer">
                  About
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact" className="cursor-pointer">
                  Contact
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/help" className="cursor-pointer">
                  Help & Support
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search Bar - Desktop only */}
        <div className="hidden md:flex items-center gap-1 flex-1 max-w-[200px] mx-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 group-focus-within:text-orange-500 transition-colors duration-200" />
            <Input
              placeholder="Search Rentals"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-6 h-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 focus-enhanced text-xs rounded-md w-full"
            />
          </div>
          <Button
            onClick={handleSearch}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all duration-200"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>

        {/* Right Side Actions - Optimized for mobile */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          {/* Mobile Menu Indicator */}

          {/* WhatsApp AI Chat - Desktop only */}
          <a
            href="https://wa.me/254112081866?text=Hi%20Leli%20Rentals%20AI%20Assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-800 dark:text-gray-200 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            title="Chat with AI Assistant"
            onClick={(e) => {
              console.log('WhatsApp button clicked')
            }}
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>

          {/* Theme Toggle - Smaller on mobile */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-all duration-200 flex-shrink-0 hidden sm:flex"
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-yellow-500" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <SignedIn>
            {/* Authenticated user section - Compact on mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Notification Bell - Always visible */}
              <div className="relative flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationPanelOpen(true)}
                  className={`h-9 w-9 transition-colors relative ${
                    displayUnreadCount > 0 
                      ? 'text-orange-500 hover:text-orange-600' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-orange-500'
                  }`}
                  title="Notifications"
                >
                  <Bell className={`h-4 w-4 ${displayUnreadCount > 0 ? 'animate-pulse' : ''} ${hasNewNotification ? 'animate-bounce' : ''}`} />
                  {displayUnreadCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium ${hasNewNotification ? 'animate-bounce' : 'animate-pulse'}`}>
                      {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* User Profile - Avatar only on mobile, full on desktop */}
              {mounted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                      <Link href="/profile">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all">
                          <AvatarImage src={user?.imageUrl || ""} />
                          <AvatarFallback className="bg-purple-500 text-white text-xs sm:text-sm font-medium">
                            {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"}
                      </span>
                      <ChevronDown className="hidden lg:block h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {/* Profile Header with Avatar */}
                    <div className="flex items-center gap-3 p-3 border-b">
                      <Avatar className="h-12 w-12 border-2 border-orange-500">
                        <AvatarImage src={user?.imageUrl || ""} />
                        <AvatarFallback className="bg-purple-500 text-white text-sm font-medium">
                          {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </div>
                    </div>

                    {/* Owner Dashboard Section (only for owners) */}
                    {userAccountType === 'owner' && (
                      <>
                        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground px-2 pt-2">
                          Owner Dashboard
                        </DropdownMenuLabel>
                        <div className="py-2">
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/owner" className="cursor-pointer">
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/list-item" className="cursor-pointer">
                              Create Listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/owner?tab=drafts" className="cursor-pointer">
                              My Drafts
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/owner?tab=analytics" className="cursor-pointer">
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Admin Section (only for admins) */}
                    {(user?.publicMetadata?.role === 'admin' || (user?.unsafeMetadata as any)?.role === 'admin') && (
                      <>
                        <div className="py-2 bg-red-50 dark:bg-red-900/20 rounded-md px-2 mb-2">
                          <DropdownMenuItem asChild>
                            <Link href="/admin/verify-users" className="cursor-pointer font-bold text-red-600 dark:text-red-400">
                              <Shield className="h-4 w-4 mr-2" />
                              Admin: Verify Users
                            </Link>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Profile Section */}
                    <div className="py-2">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer font-medium">
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/settings" className="cursor-pointer">
                          Account Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/billing" className="cursor-pointer">
                          Billing & Payments
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Activity Section */}
                    <div className="py-2">
                      <DropdownMenuItem asChild>
                        <Link href="/profile/bookings" className="cursor-pointer">
                          My Bookings
                        </Link>
                      </DropdownMenuItem>
                      {userAccountType === 'owner' && (
                        <DropdownMenuItem asChild>
                          <Link href="/profile/listings" className="cursor-pointer">
                            My Listings
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/profile/favorites" className="cursor-pointer">
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/help" className="cursor-pointer">
                        Help & Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut(() => router.push('/'))}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            {/* Non-authenticated user section */}
            <div className="flex items-center gap-1">
              <Link href="/sign-in">
                <Button
                  className="h-6 px-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up" className="hidden sm:block">
                <Button
                  className="h-6 px-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          </SignedOut>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            {/* Mobile Search - Top Priority */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search Rentals"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  />
                </div>
                <Button
                  onClick={() => {
                    handleSearch();
                    setIsMobileMenuOpen(false);
                  }}
                  className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/categories" 
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/get-started" 
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
              <Link 
                href="/about" 
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>

            {/* User-specific links for authenticated users */}
            {user && (
              <>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">My Account</p>
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/profile" 
                      className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      href="/profile/bookings" 
                      className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                    {userAccountType === 'owner' && (
                      <>
                        <Link 
                          href="/dashboard/owner" 
                          className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Owner Dashboard
                        </Link>
                        <Link 
                          href="/profile/listings" 
                          className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Listings
                        </Link>
                        <Link 
                          href="/list-item" 
                          className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Create Listing
                        </Link>
                      </>
                    )}
                    <Link 
                      href="/profile/favorites" 
                      className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Favorites
                    </Link>
                    <Link 
                      href="/profile/settings" 
                      className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <Link 
                      href="/profile/billing" 
                      className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Billing & Payments
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            {/* WhatsApp AI Chat - Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href="https://wa.me/254112081866?text=Hi%20Leli%20Rentals%20AI%20Assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 text-green-600 border border-green-200 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                onClick={(e) => {
                  console.log('Mobile WhatsApp button clicked')
                }}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Chat with AI Assistant
              </a>
            </div>

            {/* Mobile Search */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search Rentals"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  />
                </div>
                <Button
                  onClick={() => {
                    handleSearch();
                    setIsMobileMenuOpen(false);
                  }}
                  className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={handleNotificationPanelClose}
      />
    </header>
  )
}