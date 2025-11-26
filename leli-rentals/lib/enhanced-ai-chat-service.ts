/**
 * Enhanced AI Chat Service with Session Management & User Context
 * Provides personalized, helpful responses based on user's activity
 */

import { professionalAIChatService } from './professional-ai-chat-service'

export interface UserContext {
  userId?: string
  accountType?: 'renter' | 'owner'
  hasListings?: boolean
  hasBookings?: boolean
  isVerified?: boolean
  recentActivity?: string[]
}

export interface EnhancedChatSession {
  id: string
  userId?: string
  startTime: Date
  lastActivity: Date
  messageCount: number
  resolvedIssues: string[]
  userContext: UserContext
  conversationSummary: string
  satisfactionRating?: number
}

class EnhancedAIChatService {
  // Save conversation history
  saveConversationHistory(sessionId: string, messages: any[]): void {
    try {
      if (typeof window !== 'undefined') {
        const history = {
          sessionId,
          messages: messages.slice(-20), // Keep last 20 messages
          savedAt: new Date().toISOString()
        }
        localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(history))
        
        // Also save to history list
        this.addToHistoryList(sessionId, messages[messages.length - 1]?.timestamp)
      }
    } catch (error) {
      console.error('Error saving conversation history:', error)
    }
  }

  // Add session to history list
  private addToHistoryList(sessionId: string, lastMessage?: Date): void {
    try {
      if (typeof window !== 'undefined') {
        const historyList = this.getHistoryList()
        const existing = historyList.find(h => h.sessionId === sessionId)
        
        if (existing) {
          existing.lastActivity = new Date().toISOString()
        } else {
          historyList.unshift({
            sessionId,
            startTime: lastMessage || new Date().toISOString(),
            lastActivity: new Date().toISOString()
          })
        }
        
        // Keep only last 10 sessions
        const trimmed = historyList.slice(0, 10)
        localStorage.setItem('chat_history_list', JSON.stringify(trimmed))
      }
    } catch (error) {
      console.error('Error adding to history list:', error)
    }
  }

  // Get conversation history list
  getHistoryList(): any[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('chat_history_list')
        return stored ? JSON.parse(stored) : []
      }
    } catch (error) {
      console.error('Error getting history list:', error)
    }
    return []
  }

  // Load conversation history
  loadConversationHistory(sessionId: string): any[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`chat_history_${sessionId}`)
        if (stored) {
          const history = JSON.parse(stored)
          return history.messages || []
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
    }
    return []
  }

  // Get user-specific context for personalized responses
  async getUserContext(userId?: string): Promise<UserContext> {
    if (!userId) {
      return { recentActivity: [] }
    }

    try {
      // This can be enhanced to fetch from Supabase
      const context: UserContext = {
        userId,
        accountType: 'renter', // Get from user metadata
        hasListings: false,
        hasBookings: false,
        isVerified: false,
        recentActivity: []
      }

      // Try to load from localStorage for now
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`user_context_${userId}`)
        if (stored) {
          return { ...context, ...JSON.parse(stored) }
        }
      }

      return context
    } catch (error) {
      console.error('Error getting user context:', error)
      return { recentActivity: [] }
    }
  }

  // Generate personalized greeting
  generatePersonalizedGreeting(userContext: UserContext, userName?: string): string {
    const greeting = userName ? `Hi ${userName}!` : 'Hello!'
    
    const greetings = [
      `${greeting} 👋 I'm Leli, your AI assistant. How can I help you today?`,
      `${greeting} Welcome back! What can I assist you with?`,
      `${greeting} Great to see you! How may I help?`
    ]

    // Personalized based on context
    if (userContext.accountType === 'owner' && userContext.hasListings) {
      greetings.push(`${greeting} How's your rental business going? Need help with your listings?`)
    } else if (userContext.accountType === 'owner' && !userContext.hasListings) {
      greetings.push(`${greeting} Ready to list your first item and start earning?`)
    } else if (userContext.hasBookings) {
      greetings.push(`${greeting} Need help with your bookings?`)
    }

    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // Generate helpful suggestions based on user context
  getContextualSuggestions(userContext: UserContext): string[] {
    const suggestions: string[] = []

    if (userContext.accountType === 'owner') {
      if (!userContext.isVerified) {
        suggestions.push('Complete account verification')
      }
      if (!userContext.hasListings) {
        suggestions.push('Create your first listing')
      } else {
        suggestions.push('View your listing analytics')
        suggestions.push('Check recent bookings')
      }
    } else {
      suggestions.push('Browse popular items')
      suggestions.push('Search by category')
      if (userContext.hasBookings) {
        suggestions.push('View my bookings')
      }
    }

    suggestions.push('Payment & billing help')
    suggestions.push('Talk to human support')

    return suggestions.slice(0, 5)
  }

  // Enhanced FAQ with more topics
  searchEnhancedFAQ(query: string): any | null {
    const query_lower = query.toLowerCase()

    const enhancedFAQs = [
      // Booking FAQs
      {
        question: "How do I book an item?",
        answer: "Booking is easy! 1) Find the item you want, 2) Select your rental dates, 3) Review the total price, 4) Complete payment securely, 5) Get instant confirmation. You'll receive booking details via email and SMS.",
        keywords: ["book", "booking", "rent", "reserve", "hire"],
        category: "booking"
      },
      {
        question: "Can I extend my rental period?",
        answer: "Yes! Contact the owner through the app to extend your rental. If they approve, you'll be charged for the additional days. Extensions must be requested before your current rental ends.",
        keywords: ["extend", "extension", "longer", "more days"],
        category: "booking"
      },
      {
        question: "What happens if the owner cancels?",
        answer: "If an owner cancels your confirmed booking, you'll receive a full refund immediately. We'll also help you find a similar item and may offer a discount for the inconvenience.",
        keywords: ["owner cancel", "cancelled booking", "owner cancellation"],
        category: "booking"
      },

      // Listing FAQs
      {
        question: "How do I create a great listing?",
        answer: "For best results: 1) Take 5-10 clear, bright photos from multiple angles, 2) Write a detailed description including condition and features, 3) Set competitive pricing, 4) Specify availability clearly, 5) Respond quickly to inquiries.",
        keywords: ["great listing", "good listing", "listing tips", "how to list"],
        category: "listing"
      },
      {
        question: "When will my listing go live?",
        answer: "New listings are usually reviewed and approved within 24 hours. We check that photos are clear, descriptions are complete, and items meet our quality standards. You'll get a notification when approved.",
        keywords: ["listing live", "listing approved", "listing review", "when live"],
        category: "listing"
      },
      {
        question: "How do I handle bookings as an owner?",
        answer: "You'll receive notifications for new booking requests. Review the renter's profile, accept or decline within 24 hours, coordinate pickup/delivery, and confirm completion after the rental ends.",
        keywords: ["handle booking", "owner booking", "accept booking", "manage booking"],
        category: "listing"
      },

      // Verification FAQs
      {
        question: "Why do I need to verify my account?",
        answer: "Verification builds trust and safety. Verified users get: Priority in bookings, Higher earning potential, Access to premium features, Better search ranking. It takes just 5 minutes!",
        keywords: ["why verify", "verification required", "need verification"],
        category: "verification"
      },
      {
        question: "What documents do I need for verification?",
        answer: "You'll need: 1) Government-issued ID (passport, driver's license, or national ID), 2) Clear selfie for identity confirmation, 3) Phone number for SMS verification, 4) Valid payment method.",
        keywords: ["verification documents", "ID verification", "what documents", "verification requirements"],
        category: "verification"
      },

      // Payment FAQs
      {
        question: "Is my payment information secure?",
        answer: "Absolutely! We use bank-level encryption (SSL/TLS), never store full credit card details, comply with PCI DSS standards, and use secure payment partners (Stripe, PayPal). Your information is completely safe.",
        keywords: ["secure payment", "payment security", "safe payment", "encryption"],
        category: "payment"
      },
      {
        question: "When do owners get paid?",
        answer: "Owners receive payment 24 hours after the rental ends successfully. This ensures renters are satisfied. Payments go to your preferred method (bank account, mobile money, or PayPal).",
        keywords: ["owner payment", "get paid", "owner earnings", "payout"],
        category: "payment"
      },
      {
        question: "What if I have a dispute about charges?",
        answer: "Contact support immediately with details. We'll review the case, mediate between both parties, and ensure fair resolution. Most disputes are resolved within 2-3 business days.",
        keywords: ["dispute", "wrong charge", "incorrect charge", "charge problem"],
        category: "payment"
      },

      // Safety FAQs
      {
        question: "How do you ensure item safety?",
        answer: "We require: Item photos, Detailed descriptions, Owner verification, Renter verification, Damage protection insurance, Secure payment processing, and 24/7 support for any issues.",
        keywords: ["safety", "secure", "protection", "insurance", "safe"],
        category: "safety"
      },
      {
        question: "What if the item is different from photos?",
        answer: "Document the difference with photos/videos immediately. Contact support right away. You can refuse the rental and get a full refund if the item significantly differs from the listing.",
        keywords: ["different item", "not as described", "wrong item", "misrepresented"],
        category: "safety"
      },

      // Account FAQs
      {
        question: "How do I switch between renter and owner accounts?",
        answer: "Go to Profile > Switch Account Type. You can switch anytime! Note: Switching to owner requires ID verification. Your listings will be saved if you switch back.",
        keywords: ["switch account", "change account", "renter to owner", "owner to renter"],
        category: "account"
      },
      {
        question: "Can I have both renter and owner features?",
        answer: "Yes! Your account can be both. You can rent items from others while also listing your own items. Just make sure you're verified as an owner to create listings.",
        keywords: ["both accounts", "renter and owner", "dual account"],
        category: "account"
      },

      // Technical FAQs
      {
        question: "The app is not working properly",
        answer: "Try these steps: 1) Clear your browser cache, 2) Update to the latest version, 3) Check your internet connection, 4) Try logging out and back in. If issues persist, contact support with details.",
        keywords: ["not working", "app broken", "technical issue", "bug", "error"],
        category: "technical"
      },
      {
        question: "How do I enable notifications?",
        answer: "Go to Account Settings > Notifications. Enable push notifications, email alerts, and SMS updates. Stay informed about bookings, messages, and important updates.",
        keywords: ["notifications", "alerts", "enable notifications", "push notifications"],
        category: "technical"
      }
    ]

    // Find best matching FAQ
    let bestMatch: any = null
    let maxScore = 0

    for (const faq of enhancedFAQs) {
      let score = 0
      
      // Check if query matches keywords
      for (const keyword of faq.keywords) {
        if (query_lower.includes(keyword.toLowerCase())) {
          score += 2
        }
      }

      // Check if query matches question
      const questionWords = faq.question.toLowerCase().split(' ')
      for (const word of questionWords) {
        if (query_lower.includes(word) && word.length > 3) {
          score += 1
        }
      }

      if (score > maxScore) {
        maxScore = score
        bestMatch = faq
      }
    }

    return maxScore >= 2 ? bestMatch : null
  }

  // Generate conversation summary
  generateConversationSummary(messages: any[]): string {
    if (messages.length === 0) return "No conversation yet"
    
    const topics = new Set<string>()
    const issues = new Set<string>()

    for (const msg of messages) {
      if (msg.metadata?.category) {
        topics.add(msg.metadata.category)
      }
      // Extract keywords from user messages
      if (msg.sender === 'user') {
        const lower = msg.content.toLowerCase()
        if (lower.includes('problem') || lower.includes('issue')) issues.add('reported issue')
        if (lower.includes('help')) issues.add('requested help')
      }
    }

    let summary = `Discussed: ${Array.from(topics).join(', ') || 'general topics'}`
    if (issues.size > 0) {
      summary += `. User ${Array.from(issues).join(' and ')}`
    }

    return summary
  }

  // Export conversation for user
  exportConversation(sessionId: string): string {
    const history = this.loadConversationHistory(sessionId)
    if (history.length === 0) return "No conversation to export"

    let export_text = "=== Leli Rentals Chat Conversation ===\n\n"
    
    for (const msg of history) {
      const timestamp = new Date(msg.timestamp).toLocaleString()
      const sender = msg.sender === 'user' ? 'You' : 'Leli AI'
      export_text += `[${timestamp}] ${sender}:\n${msg.content}\n\n`
    }

    return export_text
  }

  // Clear old sessions (privacy)
  clearOldSessions(daysToKeep: number = 30): void {
    try {
      if (typeof window !== 'undefined') {
        const historyList = this.getHistoryList()
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

        const filtered = historyList.filter(h => {
          const lastActivity = new Date(h.lastActivity)
          const keep = lastActivity > cutoffDate
          
          // Delete old session data
          if (!keep) {
            localStorage.removeItem(`chat_history_${h.sessionId}`)
            localStorage.removeItem(`ai_chat_session_${h.sessionId}`)
          }
          
          return keep
        })

        localStorage.setItem('chat_history_list', JSON.stringify(filtered))
      }
    } catch (error) {
      console.error('Error clearing old sessions:', error)
    }
  }
}

export const enhancedAIChatService = new EnhancedAIChatService()

