"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  Mic,
  MicOff,
  X,
  Check,
  CheckCheck,
  Star,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Settings,
  Archive,
  Trash2,
  Flag,
  User
} from "lucide-react"
import { messagingService, Message, ChatSession } from "@/lib/messaging-service"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from '@/lib/notification-context'

interface MessagingAppProps {
  isOpen: boolean
  onToggle: () => void
  initialChatSessionId?: string
  initialParticipantId?: string
  listingData?: {
    title: string
    image: string
    bookingId?: string
  }
}

export default function MessagingApp({
  isOpen,
  onToggle,
  initialChatSessionId,
  initialParticipantId,
  listingData
}: MessagingAppProps) {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat sessions
  const loadChatSessions = useCallback(async () => {
    if (!user?.uid) return

    try {
      const response = await fetch(`/api/messages?action=sessions&userId=${user.id}`)
      if (!response.ok) throw new Error('Failed to load sessions')
      const data = await response.json()
      setChatSessions(data.sessions)

      // Auto-select initial session if provided
      if (initialChatSessionId) {
        const session = data.sessions.find((s: ChatSession) => s.id === initialChatSessionId)
        if (session) {
          setSelectedSession(session)
        }
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      })
    }
  }, [user?.uid, initialChatSessionId, toast])

  // Load messages for selected session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/messages?action=messages&sessionId=${sessionId}`)
      if (!response.ok) throw new Error('Failed to load messages')
      const data = await response.json()
      setMessages(data.messages)

      // Mark messages as read
      if (user?.uid) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark-read', sessionId, userId: user.id })
        })
        // Update unread count in sessions list
        setChatSessions(prev =>
          prev.map(session =>
            session.id === sessionId
              ? { ...session, unreadCount: 0 }
              : session
          )
        )
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [user?.uid])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedSession || !user?.uid) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          chatSessionId: selectedSession.id,
          receiverId: selectedSession.participantId,
          content: newMessage.trim(),
          type: 'text',
          bookingId: selectedSession.bookingId,
          userId: user.id
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      // Add message to local state
      const newMsg: Message = {
        id: data.messageId,
        senderId: user.id,
        receiverId: selectedSession.participantId,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false,
        type: 'text',
        bookingId: selectedSession.bookingId
      }

      setMessages(prev => [...prev, newMsg])
      setNewMessage("")

      // Update last message in sessions list
      setChatSessions(prev =>
        prev.map(session =>
          session.id === selectedSession.id
            ? {
                ...session,
                lastMessage: newMsg,
                updatedAt: new Date()
              }
            : session
        )
      )

      // Create a notification for the receiver
      addNotification({
        userId: selectedSession.participantId,
        type: 'message',
        title: `New message from ${user.fullName || 'a user'}`,
        message: newMessage.trim(),
        link: `/messages?session=${selectedSession.id}`
      })

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }, [newMessage, selectedSession, user?.uid, toast, addNotification])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedSession || !user?.uid) return

    // For now, just show a toast - file upload would need backend implementation
    toast({
      title: "File Upload",
      description: `File "${file.name}" would be uploaded here`,
    })
  }, [selectedSession, user?.uid, toast])

  // Start new chat
  const startNewChat = useCallback(async (participantId: string) => {
    if (!user?.uid) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-session',
          participantId,
          listingData,
          userId: user.id
        })
      })

      if (!response.ok) throw new Error('Failed to create session')
      const data = await response.json()
      const sessionId = data.sessionId

      // Check if session already exists in our list
      const existingSession = chatSessions.find(s => s.id === sessionId);
      if (existingSession) {
        setSelectedSession(existingSession);
      } else {
        // Reload chat sessions to get the new one
        await loadChatSessions()
        // Find and select the new session
        const newSession = chatSessions.find(s => s.id === sessionId);
        if (newSession) {
          setSelectedSession(newSession);
        }
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive"
      })
    }
  }, [user?.uid, listingData, toast, chatSessions, loadChatSessions])

  // Filter sessions based on search
  const filteredSessions = chatSessions.filter(session =>
    session.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load initial data
  useEffect(() => {
    if (isOpen && user?.uid) {
      loadChatSessions()
    }
  }, [isOpen, user?.uid, loadChatSessions])

  // Load messages when session changes
  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id)
    }
  }, [selectedSession, loadMessages])

  // Start new chat if initial participant provided
  useEffect(() => {
    if (initialParticipantId && user?.uid && isOpen) {
      startNewChat(initialParticipantId)
    }
  }, [initialParticipantId, user?.uid, isOpen, startNewChat])

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-40 bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-[600px] sm:h-[650px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4">
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedSession && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setSelectedSession(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-lg">
              {selectedSession ? selectedSession.participantName : "Messages"}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => {/* Settings */}}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Owner Profile Button - Show for renters chatting with owners */}
        {selectedSession && user && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
              onClick={() => {
                const participantId = selectedSession.participantId
                if (participantId) {
                  window.open(`/profile/${participantId}`, '_blank')
                }
              }}
            >
              <User className="h-3 w-3 mr-1" />
              View Owner Profile
            </Button>
          </div>
        )}

        {/* Listing info for selected session */}
        {selectedSession?.listingTitle && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-white/10 rounded-lg">
            <img
              src={selectedSession.listingImage || "/placeholder.jpg"}
              alt={selectedSession.listingTitle}
              className="w-8 h-8 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedSession.listingTitle}</p>
              {selectedSession.bookingId && (
                <p className="text-xs opacity-80">Booking #{selectedSession.bookingId}</p>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 flex">
        {/* Chat Sessions List */}
        {!selectedSession && (
          <div className="w-full flex flex-col">
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
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.participantAvatar} />
                        <AvatarFallback>
                          {session.participantName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {session.participantVerified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{session.participantName}</p>
                        <span className="text-xs text-muted-foreground">
                          {session.updatedAt.toLocaleDateString()}
                        </span>
                      </div>

                      {session.listingTitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {session.listingTitle}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground truncate">
                        {session.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>

                    {session.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {session.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}

                {filteredSessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting with owners about their listings!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Interface */}
        {selectedSession && (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {message.senderId !== user?.uid && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={selectedSession.participantAvatar} />
                          <AvatarFallback>
                            {selectedSession.participantName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`flex flex-col ${message.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-lg px-3 py-2 max-w-full break-words ${
                            message.senderId === user?.uid
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.senderId === user?.uid && (
                            <div className="flex">
                              {message.read ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                              ) : (
                                <Check className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {message.senderId === user?.uid && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                aria-label="Upload file"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
