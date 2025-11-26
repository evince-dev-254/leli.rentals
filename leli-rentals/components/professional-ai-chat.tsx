"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import { professionalAIChatService, ChatMessage, ChatSession, AIResponse } from "@/lib/professional-ai-chat-service"
import { enhancedAIChatService } from "@/lib/enhanced-ai-chat-service"
import { useUser } from "@clerk/nextjs"

interface ProfessionalAIChatProps {
  isOpen: boolean
  onToggle: () => void
}

export default function ProfessionalAIChat({ isOpen, onToggle }: ProfessionalAIChatProps) {
  const { user, isLoaded } = useUser()
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [suggestedActions, setSuggestedActions] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize session
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession()
    }
  }, [isOpen, session])

  const initializeSession = async () => {
    try {
      const sessionId = await professionalAIChatService.createSession(user?.id)
      
      // Load previous conversation history if exists
      const previousMessages = enhancedAIChatService.loadConversationHistory(sessionId)
      
      // Get user context for personalization
      const userContext = await enhancedAIChatService.getUserContext(user?.id)
      
      const contextData = {
        currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
        deviceType: typeof window !== 'undefined' ?
          (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'desktop',
        ...userContext
      }

      setSession({
        id: sessionId,
        userId: user?.id,
        messages: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        context: contextData,
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          deviceType: contextData.deviceType,
          sessionStartTime: new Date(),
          totalMessages: previousMessages.length
        }
      })

      // If there's previous conversation, load it
      if (previousMessages.length > 0) {
        setMessages(previousMessages)
        setShowWelcome(false)
      } else {
        // Generate personalized welcome message
        const personalizedGreeting = enhancedAIChatService.generatePersonalizedGreeting(
          userContext,
          user?.firstName
        )
        
        const contextualSuggestions = enhancedAIChatService.getContextualSuggestions(userContext)

        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          sender: 'ai',
          type: 'text',
          role: 'assistant',
          content: `${personalizedGreeting}

I can help you with:
${contextualSuggestions.map((s, i) => `${i === 0 ? '•' : '•'} ${s}`).join('\n')}

What can I help you with today?`,
          timestamp: new Date(),
          metadata: {
            quickReplies: contextualSuggestions.slice(0, 4)
          }
        }

        setMessages([welcomeMessage])
        setQuickReplies([...contextualSuggestions.slice(0, 4), '💬 Chat on WhatsApp'])
      }
    } catch (error) {
      console.error('Error initializing session:', error)
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !session) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      type: 'text',
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)
    setShowWelcome(false)

    try {
      // Add user message to session
      await professionalAIChatService.addMessage(session.id, userMessage)

      // Get AI response
      const response = await professionalAIChatService.generateResponse(
        content,
        { ...session, messages: [...messages, userMessage] },
        { user }
      )

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        type: 'text',
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          confidence: response.confidence,
          category: response.category,
          quickReplies: response.quickReplies,
          suggestedActions: response.suggestedActions,
          shouldEscalate: response.shouldEscalate
        }
      }

      setMessages(prev => [...prev, aiMessage])
      setQuickReplies(response.quickReplies || [])
      setSuggestedActions(response.suggestedActions || [])

      // Add AI message to session
      await professionalAIChatService.addMessage(session.id, aiMessage)

      // Save conversation history
      const updatedMessages = [...messages, userMessage, aiMessage]
      enhancedAIChatService.saveConversationHistory(session.id, updatedMessages)

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Enhanced error handling with different messages based on error type
      let errorContent = 'I apologize, but I\'m experiencing technical difficulties. Let me connect you with our human support team.'
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent = 'I\'m having trouble connecting to our servers. Please check your internet connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorContent = 'The request is taking longer than expected. Please try again in a moment.'
        } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
          errorContent = 'I need to verify your account to continue. Please make sure you\'re logged in and try again.'
        }
      }
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'ai',
        type: 'text',
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        metadata: { 
          shouldEscalate: true,
          errorType: 'technical',
          retryable: true
        }
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Add retry option for certain errors
      if (errorMessage.metadata?.retryable) {
        setQuickReplies(['Try again', 'Contact human support', '💬 Chat on WhatsApp'])
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    if (reply === '💬 Chat on WhatsApp') {
      handleWhatsAppDirect()
    } else {
      handleSendMessage(reply)
    }
    // Track interaction removed - method not implemented
  }

  const handleSuggestedAction = (action: string) => {
    // This would navigate to the relevant page or perform the action
    console.log('Suggested action:', action)
    // Track interaction removed - method not implemented
  }

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    if (session) {
      try {
        await professionalAIChatService.submitFeedback(session.id, messageId, feedback)
        
        // Show feedback confirmation
        const feedbackMessage = feedback === 'positive' ? 'Thank you for your positive feedback!' : 'Thank you for your feedback. We\'ll use it to improve our service.'
        
        // Add a temporary feedback confirmation message
        const feedbackConfirmation: ChatMessage = {
          id: `feedback_${Date.now()}`,
          sender: 'ai',
          type: 'text',
          role: 'assistant',
          content: feedbackMessage,
          timestamp: new Date(),
          metadata: { isFeedbackConfirmation: true }
        }
        
        setMessages(prev => [...prev, feedbackConfirmation])
        
        // Remove the feedback confirmation after 3 seconds
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== feedbackConfirmation.id))
        }, 3000)
        
      } catch (error) {
        console.error('Error submitting feedback:', error)
        // Don't show error to user for feedback failures
      }
    }
  }

  const handleEscalate = () => {
    // Open WhatsApp or email support
    const whatsappNumber = "+254112081866"
    const message = encodeURIComponent(`Hi, I need help with Leli Rentals. I was chatting with the AI assistant but need to speak with a human.`)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${message}`

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank')
    }

    // Track interaction removed - method not implemented
  }

  const handleWhatsAppDirect = () => {
    // Direct WhatsApp contact for AI assistant
    const whatsappNumber = "+254112081866"
    const message = encodeURIComponent(`Hi Leli AI Assistant! I'm contacting you directly via WhatsApp.`)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${message}`

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank')
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-pulse transition-all duration-300 hover:scale-110 z-50"
        size="icon"
        aria-label="Open AI Support Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-white to-blue-100 dark:from-purple-950 dark:via-gray-900 dark:to-blue-950 rounded-lg overflow-hidden pointer-events-none">
        {/* Background orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <Card className="relative h-full shadow-2xl flex flex-col border-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/logo-white.svg" alt="Leli AI" />
              <AvatarFallback className="bg-white/20">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Leli AI Assistant</span>
                <Sparkles className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs opacity-90">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-green-500/20"
              onClick={handleWhatsAppDirect}
              aria-label="Chat on WhatsApp"
              title="Chat with AI Assistant on WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onToggle}
              aria-label="Close Chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex flex-wrap gap-2">
            {quickReplies.slice(0, 4).map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-400 transition-all duration-200"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2`}
          >
            <div className="flex items-start gap-2 max-w-[85%]">
              {message.role === 'assistant' && (
                <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col">
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Leli AI</span>
                      {message.metadata?.confidence && (
                        <Badge variant="secondary" className="text-xs h-4 px-1 ml-1">
                          {Math.round(message.metadata.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  )}

                  <p className="leading-relaxed">{message.content}</p>

                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    {message.role === 'assistant' && message.metadata?.shouldEscalate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs bg-red-100 hover:bg-red-200 text-red-700"
                        onClick={handleEscalate}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Get Human Help
                      </Button>
                    )}
                  </div>
                </div>

                {message.role === 'assistant' && !message.metadata?.shouldEscalate && (
                  <div className="flex gap-1 mt-1 ml-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-green-100"
                      onClick={() => handleFeedback(message.id, 'positive')}
                    >
                      <ThumbsUp className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-100"
                      onClick={() => handleFeedback(message.id, 'negative')}
                    >
                      <ThumbsDown className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in-0">
            <div className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Bot className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                  <span className="text-xs text-gray-600">Leli is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Suggested Actions */}
      {suggestedActions.length > 0 && (
        <div className="p-3 bg-gray-50 border-t">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            Suggested Actions
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.slice(0, 3).map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                onClick={() => handleSuggestedAction(action)}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(newMessage)}
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage(newMessage)}
            size="icon"
            className="h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!newMessage.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {isTyping ? 'AI is responding...' : 'Press Enter to send'}
          </span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">AI Powered</span>
          </div>
        </div>
      </div>
    </Card>
    </div>
  )
}
