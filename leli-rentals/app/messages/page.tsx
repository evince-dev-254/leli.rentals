"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useUser } from '@clerk/nextjs'
import Link from "next/link"
import Image from "next/image"
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  Check,
  CheckCheck,
  Star,
  Shield,
  Calendar,
  MapPin,
  Eye,
  Heart,
  Share2,
  Download,
  User,
  ShoppingBag,
  Verified,
  ChevronRight,
  Sparkles
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
  type: 'text' | 'image' | 'file'
  bookingId?: string
  listingId?: string
}

interface ChatSession {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  participantPhone?: string
  participantRating?: number
  participantVerified?: boolean
  lastMessage?: Message
  unreadCount: number
  listingTitle?: string
  listingImage?: string
  bookingId?: string
  createdAt: Date
  updatedAt: Date
}

interface OwnerProfile {
  id: string
  name: string
  avatar: string
  rating: number
  verified: boolean
  phone?: string
  email?: string
  location?: string
  bio?: string
  accountType: string
  totalListings?: number
  totalBookings?: number
}

interface OwnerListing {
  id: string
  title: string
  price: number
  image: string
  category: string
  location?: string
  rating?: number
  status?: string
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "bookings">("all")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null)
  const [ownerListings, setOwnerListings] = useState<OwnerListing[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingOwnerData, setLoadingOwnerData] = useState(false)
  const [showOwnerSidebar, setShowOwnerSidebar] = useState(true)

  // Load chat sessions from API
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user?.id || !isLoaded) return
      
      setLoadingChats(true)
      try {
        const response = await fetch(`/api/messages?action=sessions&userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          const sessions: ChatSession[] = data.sessions?.map((session: any) => ({
            id: session.id,
            participantId: session.participantId,
            participantName: session.participantName || 'Unknown',
            participantAvatar: session.participantAvatar || '/placeholder-user.jpg',
            participantPhone: session.participantPhone,
            participantRating: session.participantRating || 0,
            participantVerified: session.participantVerified || false,
            lastMessage: session.lastMessage ? {
              id: session.lastMessage.id || 'temp',
              senderId: session.lastMessage.senderId,
              receiverId: session.lastMessage.receiverId || user.id,
              content: session.lastMessage.content,
              timestamp: new Date(session.lastMessage.timestamp),
              read: session.lastMessage.read || false,
              type: session.lastMessage.type || 'text'
            } : undefined,
            unreadCount: session.unreadCount || 0,
            listingTitle: session.listingTitle,
            listingImage: session.listingImage,
            bookingId: session.bookingId,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          })) || []
          
          setChatSessions(sessions)
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error)
      } finally {
        setLoadingChats(false)
      }
    }

    loadChatSessions()
  }, [user?.id, isLoaded])

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat || !user?.id) return
      
      setLoadingMessages(true)
      try {
        const response = await fetch(`/api/messages?action=messages&sessionId=${activeChat}`)
        if (response.ok) {
          const data = await response.json()
          const loadedMessages: Message[] = (data.messages || []).map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            read: msg.read || false,
            type: msg.type || 'text',
            bookingId: msg.bookingId,
            listingId: msg.listingId
          }))
          
          setMessages(loadedMessages)
          
          // Mark messages as read
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'mark-read',
              sessionId: activeChat,
              userId: user.id
            })
          })
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()
  }, [activeChat, user?.id])

  // Load owner profile and listings when chat is selected
  useEffect(() => {
    const loadOwnerData = async () => {
      if (!currentChat?.participantId) return
      
      setLoadingOwnerData(true)
      try {
        // Load owner profile from user-profile-service
        try {
          const { userProfileService } = await import('@/lib/user-profile-service')
          const profileData = await userProfileService.getPublicProfile(currentChat.participantId)
          if (profileData) {
            setOwnerProfile({
              id: currentChat.participantId,
              name: (profileData as any).full_name || (profileData as any).name || currentChat.participantName,
              avatar: (profileData as any).avatar_url || (profileData as any).avatar || currentChat.participantAvatar,
              rating: (profileData as any).rating?.average || (profileData as any).rating || currentChat.participantRating || 0,
              verified: (profileData as any).verified || currentChat.participantVerified || false,
              phone: (profileData as any).phone,
              email: (profileData as any).email,
              location: (profileData as any).location,
              bio: (profileData as any).bio,
              accountType: (profileData as any).account_type || 'owner',
              totalListings: (profileData as any).stats?.totalListings || (profileData as any).total_listings,
              totalBookings: (profileData as any).stats?.totalBookings || (profileData as any).total_bookings
            })
          }
        } catch (profileError) {
          // Only log non-empty errors (not just missing profiles)
          if (profileError && (typeof profileError === 'object' && Object.keys(profileError).length > 0)) {
            console.error('Error loading owner profile:', profileError)
          }
          // Fallback to chat data - this is fine if profile doesn't exist yet
          setOwnerProfile({
            id: currentChat.participantId,
            name: currentChat.participantName,
            avatar: currentChat.participantAvatar,
            rating: currentChat.participantRating || 0,
            verified: currentChat.participantVerified || false,
            phone: currentChat.participantPhone,
            accountType: 'owner'
          })
        }

        // Load owner listings from Supabase
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data: listings, error } = await supabase
            .from('listings')
            .select('id, title, price, images, category, location, status')
            .eq('user_id', currentChat.participantId)
            .eq('status', 'published')
            .limit(6)
            .order('created_at', { ascending: false })

          if (!error && listings) {
            setOwnerListings(listings.map((listing: any) => ({
              id: listing.id,
              title: listing.title,
              price: listing.price || 0,
              image: listing.images?.[0] || '/placeholder.svg',
              category: listing.category || 'general',
              location: listing.location,
              status: listing.status
            })))
          }
        } catch (error) {
          console.error('Error loading owner listings:', error)
        }
      } catch (error) {
        console.error('Error loading owner data:', error)
      } finally {
        setLoadingOwnerData(false)
      }
    }

    loadOwnerData()
  }, [currentChat?.participantId, currentChat?.participantName, currentChat?.participantAvatar])

  // Handle URL parameters for pre-filling chat
  useEffect(() => {
    const ownerParam = searchParams?.get('owner')
    const listingParam = searchParams?.get('listing')
    const listingImageParam = searchParams?.get('listingImage')
    const bookingParam = searchParams?.get('booking')
        const ownerIdParam = searchParams?.get('ownerId')

    // Need either ownerId or owner name to proceed
    if ((ownerIdParam || ownerParam) && user?.id && isLoaded) {
      const createOrFindChat = async () => {
        let targetOwnerId = ownerIdParam

        // If no ownerId, try to find it by owner name
        if (!targetOwnerId && ownerParam) {
          try {
            // Try to find owner by name in Supabase listings
            const { supabase } = await import('@/lib/supabase')
            
            // First try by listing title if we have it
            if (listingParam) {
              const { data: listingByTitle } = await supabase
              .from('listings')
                .select('user_id')
                .ilike('title', `%${listingParam}%`)
              .limit(1)
                .maybeSingle()

              if (listingByTitle?.user_id) {
                targetOwnerId = listingByTitle.user_id
              }
            }
            
            // If still not found, try by contact info name
            if (!targetOwnerId) {
              const { data: allListings } = await supabase
                .from('listings')
                .select('user_id, contact_info')
                .limit(50)

              if (allListings) {
                const matchingListing = allListings.find((listing: any) => {
                  const contactName = listing.contact_info?.name || ''
                  return contactName.toLowerCase().includes(ownerParam.toLowerCase())
                })
                
                if (matchingListing?.user_id) {
                  targetOwnerId = matchingListing.user_id
                }
              }
            }
          } catch (error) {
            console.error('Error finding owner ID:', error)
            // Continue without ownerId - will use owner name as fallback
          }
        }

        // Check if chat already exists
        const existingChat = targetOwnerId 
          ? chatSessions.find(chat => chat.participantId === targetOwnerId)
          : null

        if (existingChat) {
          setActiveChat(existingChat.id)
          setCurrentChat(existingChat)
          
          // Send initial greeting message if no messages exist
          if (messages.length === 0) {
            setTimeout(async () => {
              try {
                const greetingResponse = await fetch('/api/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'send',
                    userId: user.id,
                    chatSessionId: existingChat.id,
                    receiverId: existingChat.participantId,
                    content: `Hi! I'm interested in ${listingParam || 'your listing'}. Can we chat?`,
                    type: 'text',
                    listingId: listingParam
                  })
                })

                if (greetingResponse.ok) {
                  // Send notification to owner
                  await fetch('/api/notifications/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: existingChat.participantId,
                      type: 'message',
                      title: 'New Message',
                      message: `${user.firstName || 'Someone'} started a conversation about ${listingParam || 'a listing'}`,
                      link: `/messages?session=${existingChat.id}`
                    })
                  }).catch(err => console.error('Notification error:', err))
                }
              } catch (error) {
                console.error('Error sending greeting:', error)
              }
            }, 500)
          }
        } else if (targetOwnerId) {
        // Create new chat session
          try {
            const response = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create-session',
                userId: user.id,
                participantId: targetOwnerId,
                listingData: listingParam ? {
                  title: listingParam,
                  image: listingImageParam || '/placeholder.svg',
                  bookingId: bookingParam
                } : undefined
              })
            })

            if (response.ok) {
              const data = await response.json()
              const sessionId = data.sessionId

              // Send notification to owner about new conversation
              try {
                await fetch('/api/notifications/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: targetOwnerId,
                    type: 'message',
                    title: 'New Conversation Started',
                    message: `${user.firstName || user.username || 'Someone'} wants to chat about ${listingParam || 'your listing'}`,
                    link: `/messages?session=${sessionId}`
                  })
                }).catch(err => console.error('Notification error:', err))
              } catch (notifError) {
                console.error('Error sending notification:', notifError)
              }

              // Reload chat sessions to get the new one
              const sessionsResponse = await fetch(`/api/messages?action=sessions&userId=${user.id}`)
              if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json()
                const newSessions: ChatSession[] = sessionsData.sessions?.map((session: any) => ({
                  id: session.id,
                  participantId: session.participantId,
                  participantName: session.participantName || ownerParam || 'Owner',
                  participantAvatar: session.participantAvatar || '/placeholder-user.jpg',
                  participantPhone: session.participantPhone,
                  participantRating: session.participantRating || 0,
                  participantVerified: session.participantVerified || false,
                  unreadCount: session.unreadCount || 0,
                  listingTitle: session.listingTitle || listingParam,
                  listingImage: session.listingImage || listingImageParam,
                  bookingId: session.bookingId || bookingParam,
                  createdAt: new Date(session.createdAt),
                  updatedAt: new Date(session.updatedAt)
                })) || []
                
                setChatSessions(newSessions)
                
                const newChat = newSessions.find(s => s.id === sessionId || s.participantId === targetOwnerId)
                if (newChat) {
        setActiveChat(newChat.id)
        setCurrentChat(newChat)

                  // Auto-send greeting message
                  setTimeout(async () => {
                    try {
                      const greetingResponse = await fetch('/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'send',
                          userId: user.id,
                          chatSessionId: newChat.id,
                          receiverId: newChat.participantId,
                          content: `Hi! I'm interested in ${listingParam || 'your listing'}. Can we chat?`,
                          type: 'text',
                          listingId: listingParam
                        })
                      })
                      
                      if (greetingResponse.ok) {
        toast({
                          title: "Conversation started!",
                          description: "Your message has been sent to the owner.",
                        })
                        
                        // Reload messages from database after sending
                        const messagesResp = await fetch(`/api/messages?action=messages&sessionId=${newChat.id}`)
                        if (messagesResp.ok) {
                          const msgsData = await messagesResp.json()
                          const loadedMsgs: Message[] = (msgsData.messages || []).map((msg: any) => ({
                            id: msg.id,
                            senderId: msg.senderId,
                            receiverId: msg.receiverId,
                            content: msg.content,
                            timestamp: new Date(msg.timestamp),
                            read: msg.read || false,
                            type: msg.type || 'text',
                            bookingId: msg.bookingId,
                            listingId: msg.listingId
                          }))
                          setMessages(loadedMsgs)
                        }
                      } else {
                        const errorData = await greetingResponse.json().catch(() => ({ error: 'Failed to send greeting' }))
                        console.error('Failed to send greeting:', errorData)
                      }
                    } catch (error) {
                      console.error('Error sending greeting:', error)
                    }
                  }, 500)
                }
              }
            } else {
              const errorData = await response.json().catch(() => ({ error: 'Failed to create chat session' }))
              throw new Error(errorData.error || 'Failed to create chat session')
            }
          } catch (error) {
            console.error('Error creating chat session:', error)
            toast({
              title: "Error starting conversation",
              description: "Could not create chat session. Please try again.",
              variant: "destructive",
            })
          }
        }
      }

      // Wait for chat sessions to load before creating/finding
      // Use a ref to prevent multiple calls
      if (!loadingChats) {
        createOrFindChat().catch(error => {
          console.error('Error in createOrFindChat:', error)
          toast({
            title: "Error",
            description: "Failed to start conversation. Please try again.",
            variant: "destructive",
          })
        })
      }
    }
  }, [searchParams, chatSessions.length, user?.id, isLoaded, loadingChats])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChat || !user?.id || !activeChat) return

    setSendingMessage(true)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          userId: user.id,
          chatSessionId: activeChat,
        receiverId: currentChat.participantId,
        content: messageInput.trim(),
          type: 'text',
          listingId: currentChat.listingTitle ? currentChat.listingTitle : undefined,
          bookingId: currentChat.bookingId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const sentMessageContent = messageInput.trim()
        setMessageInput("")

        // Reload messages from database to get the actual saved message
        const messagesResponse = await fetch(`/api/messages?action=messages&sessionId=${activeChat}`)
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          const loadedMessages: Message[] = (messagesData.messages || []).map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            read: msg.read || false,
            type: msg.type || 'text',
            bookingId: msg.bookingId,
            listingId: msg.listingId
          }))
          setMessages(loadedMessages)
          
          // Update chat session with last message
          const lastMsg = loadedMessages[loadedMessages.length - 1]
          if (lastMsg) {
      setChatSessions(prev => prev.map(chat => 
        chat.id === activeChat 
                ? { ...chat, lastMessage: lastMsg, updatedAt: new Date(), unreadCount: 0 }
          : chat
      ))
          }
        }

        // Send notification to receiver
        try {
          await fetch('/api/notifications/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentChat.participantId,
              type: 'message',
              title: 'New Message',
              message: `${user.firstName || user.username || 'Someone'}: ${sentMessageContent.substring(0, 50)}${sentMessageContent.length > 50 ? '...' : ''}`,
              link: `/messages?session=${activeChat}`
            })
          }).catch(err => console.error('Notification error:', err))
        } catch (notifError) {
          console.error('Error sending notification:', notifError)
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send message' }))
        throw new Error(errorData.error || 'Failed to send message')
      }
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleChatSelect = (chatId: string) => {
    const chat = chatSessions.find(c => c.id === chatId)
    if (chat) {
      setActiveChat(chatId)
      setCurrentChat(chat)
      
      // Mark messages as read
      setChatSessions(prev => prev.map(c => 
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ))
    }
  }

  const handleCallOwner = (phoneNumber: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${phoneNumber.replace(/\D/g, '')}`
    }
    toast({
      title: "Opening phone dialer",
      description: `Calling ${currentChat?.participantName}...`,
    })
  }

  const filteredChats = chatSessions.filter(chat => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
                         chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    switch (filterStatus) {
      case "unread":
        return matchesSearch && (chat.unreadCount || 0) > 0
      case "bookings":
        return matchesSearch && !!chat.bookingId
      default:
        return matchesSearch
    }
  })

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (!isLoaded) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-4 md:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="flex-shrink-0 h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                Connect with owners and manage your conversations
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="px-3 md:px-4 py-2 text-sm md:text-base flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
              {chatSessions.reduce((sum, chat) => sum + chat.unreadCount, 0)} unread
            </Badge>
        </div>

        {/* Main Grid Layout - Mobile-first responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-[calc(100vh-200px)] md:h-[calc(100vh-240px)] lg:h-[calc(100vh-260px)]">
          {/* Chat List Sidebar */}
          <div className={`lg:col-span-3 space-y-4 ${activeChat ? 'hidden lg:block' : 'block'}`}>
            {/* Search and Filter */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-base h-11 md:h-12"
                    />
                  </div>
                  
                  {/* Filter Buttons Grid - Responsive */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="default"
                      onClick={() => setFilterStatus("all")}
                      className="h-11 md:h-12 text-sm md:text-base font-medium"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "unread" ? "default" : "outline"}
                      size="default"
                      onClick={() => setFilterStatus("unread")}
                      className="h-11 md:h-12 text-sm md:text-base font-medium"
                    >
                      Unread
                    </Button>
                    <Button
                      variant={filterStatus === "bookings" ? "default" : "outline"}
                      size="default"
                      onClick={() => setFilterStatus("bookings")}
                      className="h-11 md:h-12 text-sm md:text-base font-medium"
                    >
                      Bookings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Sessions */}
            <div className="space-y-3 md:space-y-4 max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-380px)] lg:max-h-[calc(100vh-400px)] overflow-y-auto">
              {loadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
                </Card>
              ) : (
                filteredChats.map((chat) => (
                <Card
                  key={chat.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    activeChat === chat.id 
                        ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-start gap-3 md:gap-4">
                        <Avatar className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 ring-2 ring-white">
                        <AvatarImage src={chat.participantAvatar} alt={chat.participantName} />
                        <AvatarFallback className="text-base md:text-lg font-semibold">{chat.participantName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 truncate">
                            {chat.participantName}
                          </h3>
                          {chat.participantVerified && (
                              <Verified className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                          )}
                          {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs md:text-sm px-2 py-0.5 flex-shrink-0 min-w-[24px]">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {chat.listingTitle && (
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate mb-1.5">
                            {chat.listingTitle}
                          </p>
                        )}
                        
                        {chat.lastMessage && (
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-500 truncate mb-2">
                            {chat.lastMessage.content}
                          </p>
                        )}
                        
                          <div className="flex items-center justify-between mt-2 gap-3">
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-xs md:text-sm text-gray-500 font-medium">
                                {chat.participantRating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                            <span className="text-xs md:text-sm text-gray-500 truncate font-medium">
                            {formatTime(chat.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`${showOwnerSidebar && currentChat ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
            {currentChat ? (
              <Card className="h-full flex flex-col shadow-xl border-0">
                {/* Mobile Back Button */}
                <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => setActiveChat(null)}
                    className="flex items-center gap-2 h-11 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-base font-medium">Back to Conversations</span>
                  </Button>
                </div>

                {/* Chat Header */}
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <Avatar className="h-12 w-12 md:h-14 md:w-14 ring-2 ring-white flex-shrink-0">
                        <AvatarImage src={currentChat.participantAvatar} alt={currentChat.participantName} />
                        <AvatarFallback className="text-base md:text-lg font-semibold">{currentChat.participantName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base md:text-lg lg:text-xl text-gray-900 dark:text-gray-100 truncate">
                            {currentChat.participantName}
                          </h3>
                          {currentChat.participantVerified && (
                            <Badge variant="secondary" className="text-xs md:text-sm px-2 py-0.5 flex-shrink-0">
                              <Verified className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                          <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                          <span className="truncate font-medium">{currentChat.participantRating?.toFixed(1) || '0.0'} Rating</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/profile/${currentChat.participantId}`} target="_blank" rel="noopener noreferrer">
                      <Button
                          size="default"
                          variant="outline"
                          className="h-10 md:h-11 px-3 md:px-4 text-sm md:text-base font-medium"
                        >
                          <User className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        size="default"
                        variant="outline"
                        onClick={() => handleCallOwner(currentChat.participantPhone || '+254700000000')}
                        className="h-10 md:h-11 px-3 md:px-4 text-sm md:text-base font-medium"
                      >
                        <Phone className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                        Call
                      </Button>
                      <Button size="default" variant="outline" className="h-10 md:h-11 w-10 md:w-11 p-0">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {currentChat.listingTitle && (
                    <div className="mt-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={currentChat.listingImage || '/placeholder.svg'}
                          alt={currentChat.listingTitle}
                            fill
                            className="object-cover"
                        />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 truncate">
                            {currentChat.listingTitle}
                          </h4>
                          {currentChat.bookingId && (
                            <Badge variant="outline" className="text-xs md:text-sm mt-2">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              Active Booking
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Start the conversation
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Send a message to {currentChat.participantName}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                          className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 md:px-5 py-3 md:py-4 shadow-sm ${
                          message.senderId === user?.id
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                          <p className="text-sm md:text-base break-words leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-end gap-2 mt-2 md:mt-3">
                          <span className="text-xs md:text-sm opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderId === user?.id && (
                              <div>
                              {message.read ? (
                                <CheckCheck className="h-4 w-4 text-blue-300" />
                              ) : (
                                <Check className="h-4 w-4 text-blue-300" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative z-50">
                  <div className="flex gap-3 md:gap-4">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={sendingMessage}
                      className="flex-1 relative z-50 text-base h-12 md:h-14"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                      size="default"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 relative z-50 h-12 md:h-14 w-12 md:w-14 p-0"
                    >
                      {sendingMessage ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center shadow-xl border-0">
                <CardContent className="text-center p-12">
                  <MessageCircle className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Owner Profile & Listings Sidebar */}
          {currentChat && showOwnerSidebar && (
            <div className="hidden lg:block lg:col-span-4">
              <Card className="h-full overflow-y-auto shadow-xl border-0">
                <CardHeader className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl">Owner Profile</CardTitle>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => setShowOwnerSidebar(false)}
                      className="h-10 w-10 p-0"
                    >
                      ×
                    </Button>
        </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                  {loadingOwnerData ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
                  ) : (
                    <>
                      {/* Owner Profile Card */}
                      <div className="text-center">
                        <Avatar className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-3 md:mb-4 ring-4 ring-blue-100 dark:ring-blue-900">
                          <AvatarImage 
                            src={ownerProfile?.avatar || currentChat.participantAvatar} 
                            alt={ownerProfile?.name || currentChat.participantName} 
                          />
                          <AvatarFallback className="text-xl md:text-2xl font-bold">
                            {(ownerProfile?.name || currentChat.participantName).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                            {ownerProfile?.name || currentChat.participantName}
                          </h3>
                          {(ownerProfile?.verified || currentChat.participantVerified) && (
                            <Verified className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                          )}
    </div>
                        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                            {(ownerProfile?.rating || currentChat.participantRating || 0).toFixed(1)} Rating
                          </span>
                        </div>
                        {ownerProfile?.bio && (
                          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 px-2">
                            {ownerProfile.bio}
                          </p>
                        )}
                        <Link href={`/profile/${currentChat.participantId}`}>
                          <Button className="w-full h-11 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm md:text-base font-medium">
                            <User className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            View Full Profile
                          </Button>
                        </Link>
                      </div>

                      <Separator />

                      {/* Owner Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <ShoppingBag className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {ownerProfile?.totalListings || ownerListings.length || 0}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Listings</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {ownerProfile?.totalBookings || 0}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Bookings</p>
                        </div>
                      </div>

                      {/* Owner Contact */}
                      {ownerProfile && (ownerProfile.phone || ownerProfile.email || ownerProfile.location) && (
                        <>
                          <Separator />
                          <div className="space-y-3 md:space-y-4">
                            <h4 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">Contact Info</h4>
                            {ownerProfile.phone && (
                              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                <span className="break-all">{ownerProfile.phone}</span>
                              </div>
                            )}
                            {ownerProfile.email && (
                              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                <MessageCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                <span className="break-all truncate">{ownerProfile.email}</span>
                              </div>
                            )}
                            {ownerProfile.location && (
                              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                <span className="break-words">{ownerProfile.location}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Owner's Listings */}
                      {ownerListings.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                              <h4 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">
                                Similar Products
                              </h4>
                              <Link href={`/profile/${currentChat.participantId}?tab=listings`}>
                                <Button variant="ghost" size="default" className="h-9 md:h-10 text-xs md:text-sm">
                                  View All
                                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                              {ownerListings.map((listing) => (
                                <Link key={listing.id} href={`/items/${listing.id}`}>
                                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                      <div className="flex gap-3 md:gap-4">
                                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                                          <Image
                                            src={listing.image}
                                            alt={listing.title}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 truncate mb-1.5">
                                            {listing.title}
                                          </h5>
                                          <p className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 mb-2">
                                            KSh {listing.price.toLocaleString('en-KE')}
                                          </p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="text-xs md:text-sm">
                                              {listing.category}
                                            </Badge>
                                            {listing.rating && (
                                              <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                                                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                                  {listing.rating.toFixed(1)}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Show Owner Sidebar Button (when hidden) */}
          {currentChat && !showOwnerSidebar && (
            <div className="hidden lg:block lg:col-span-4">
              <Card className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                <CardContent className="text-center p-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <Button
                    variant="outline"
                    onClick={() => setShowOwnerSidebar(true)}
                    className="mt-4"
                  >
                    Show Owner Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}