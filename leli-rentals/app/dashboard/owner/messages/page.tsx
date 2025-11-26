"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useUser } from '@clerk/nextjs'
import { supabase } from "@/lib/supabase"
import {
  MessageCircle,
  Send,
  Phone,
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
  User,
  Mail
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
  renterId: string
  renterName: string
  renterAvatar: string
  renterPhone?: string
  renterEmail?: string
  renterRating?: number
  renterVerified?: boolean
  lastMessage?: Message
  unreadCount: number
  listingTitle?: string
  listingImage?: string
  listingId?: string
  bookingId?: string
  createdAt: Date
  updatedAt: Date
}

export default function OwnerMessagesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load chat sessions from database
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user?.id || !isLoaded) return
      
      setIsLoading(true)
      try {
        // Fetch chat sessions where current user is the owner (user_id field)
        const { data: sessions, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        // Transform and enrich with renter details
        const enrichedSessions: ChatSession[] = await Promise.all(
          (sessions || []).map(async (session: any) => {
            // Fetch renter details from session data
            // The participant_id is the renter
            const renterId = session.participant_id
            
            // Get renter details from session data
            let renterName = session.participant_name || 'Renter'
            let renterAvatar = session.participant_avatar || '/placeholder-user.jpg'
            let renterPhone = session.participant_phone
            let renterEmail = session.participant_email || null

            // Fetch listing details if available
            let listingTitle = session.listing_title || ''
            let listingImage = session.listing_image || '/placeholder.jpg'
            let listingId = session.listing_id || null
            
            // Try to fetch listing details if we have listing_id but not title
            if (session.listing_id && !listingTitle) {
              try {
                const { data: listing } = await supabase
                  .from('listings')
                  .select('title, images')
                  .eq('id', session.listing_id)
                  .maybeSingle()
                
                if (listing) {
                  listingTitle = listing.title || ''
                  listingImage = listing.images?.[0] || '/placeholder.jpg'
                }
              } catch (err) {
                console.error('Error fetching listing:', err)
              }
            }

            // Get last message
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('*')
              .eq('chat_session_id', session.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            // Count unread messages
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_session_id', session.id)
              .eq('receiver_id', user.id)
              .eq('read_status', false)

            const lastMessage = lastMsg ? {
              id: lastMsg.id,
              senderId: lastMsg.sender_id,
              receiverId: lastMsg.receiver_id,
              content: lastMsg.content,
              timestamp: new Date(lastMsg.created_at),
              read: lastMsg.read_status,
              type: lastMsg.message_type || 'text',
              bookingId: lastMsg.booking_id,
              listingId: lastMsg.listing_id
            } : undefined

            return {
              id: session.id,
              renterId: renterId || session.participant_id,
              renterName,
              renterAvatar,
              renterPhone,
              renterEmail,
              renterRating: session.participant_rating || 4.5,
              renterVerified: session.participant_verified || false,
              lastMessage,
              unreadCount: unreadCount || session.unread_count || 0,
              listingTitle,
              listingImage,
              listingId: listingId || session.listing_id,
              bookingId: session.booking_id,
              createdAt: new Date(session.created_at),
              updatedAt: new Date(session.updated_at || session.created_at)
            }
          })
        )

        setChatSessions(enrichedSessions)
      } catch (error) {
        console.error('Error loading chat sessions:', error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadChatSessions()
  }, [user?.id, isLoaded, toast])

  // Load messages for active chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat || !user?.id) return

      try {
        const { data: msgs, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_session_id', activeChat)
          .order('created_at', { ascending: true })

        if (error) throw error

        const transformedMessages: Message[] = (msgs || []).map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          read: msg.read_status,
          type: msg.message_type || 'text',
          bookingId: msg.booking_id,
          listingId: msg.listing_id
        }))

        setMessages(transformedMessages)

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read_status: true })
          .eq('chat_session_id', activeChat)
          .eq('receiver_id', user.id)
          .eq('read_status', false)

      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [activeChat, user?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat || !user?.id) return

    setSendingMessage(true)
    try {
      const activeSession = chatSessions.find(s => s.id === activeChat)
      if (!activeSession) return

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_session_id: activeChat,
          sender_id: user.id,
          receiver_id: activeSession.renterId,
          content: messageInput.trim(),
          message_type: 'text',
          read_status: false,
          listing_id: activeSession.listingId,
          booking_id: activeSession.bookingId
        })
        .select()
        .single()

      if (error) throw error

      // Update last message in session
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeChat)

      setMessageInput("")
      
      // Refresh messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', activeChat)
        .order('created_at', { ascending: true })

      if (msgs) {
        const transformedMessages: Message[] = msgs.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          read: msg.read_status,
          type: msg.message_type || 'text',
          bookingId: msg.booking_id,
          listingId: msg.listing_id
        }))
        setMessages(transformedMessages)
      }

      // Refresh chat sessions
      window.location.reload()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredSessions = chatSessions.filter(session =>
    session.renterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeSession = chatSessions.find(s => s.id === activeChat)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/owner')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages from Renters</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Communicate with renters who are interested in your listings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-250px)] sm:h-[calc(100vh-200px)]">
          {/* Chat Sessions List */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading messages...
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No messages yet
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setActiveChat(session.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        activeChat === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.renterAvatar} />
                          <AvatarFallback>{session.renterName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm truncate">{session.renterName}</p>
                            {session.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                {session.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {session.listingTitle && (
                            <p className="text-xs text-muted-foreground truncate mb-1">
                              {session.listingTitle}
                            </p>
                          )}
                          {session.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {session.lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.lastMessage 
                              ? new Date(session.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(session.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {activeSession ? (
              <>
                {/* Chat Header */}
                <CardContent className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeSession.renterAvatar} />
                      <AvatarFallback>{activeSession.renterName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{activeSession.renterName}</p>
                        {activeSession.renterVerified && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {activeSession.renterPhone && (
                          <>
                            <Phone className="h-3 w-3" />
                            <span>{activeSession.renterPhone}</span>
                          </>
                        )}
                        {activeSession.renterEmail && (
                          <>
                            <Mail className="h-3 w-3 ml-2" />
                            <span className="truncate">{activeSession.renterEmail}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {messages.map((message) => {
                    const isOwner = message.senderId === user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            isOwner
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            isOwner ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwner && (
                              message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <CardContent className="p-4 border-t bg-white dark:bg-gray-800">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

