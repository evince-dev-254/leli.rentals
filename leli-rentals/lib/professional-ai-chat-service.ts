// Firebase removed - db import removed

// Professional AI Chat Service for Leli Rentals
// Features inspired by Airbnb, Booking.com, and other professional rental platforms

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai' | 'agent'
  content: string
  timestamp: Date
  type: 'text' | 'quick-reply' | 'action' | 'system'
  role: string
  metadata?: {
    confidence?: number
    category?: string
    suggestedActions?: string[]
    quickReplies?: string[]
    isEscalated?: boolean
    userIntent?: string
    contextData?: any
    shouldEscalate?: boolean
    feedback?: 'positive' | 'negative'
    feedbackTimestamp?: Date
  }
}

export interface ChatSession {
  id: string
  userId?: string
  messages: ChatMessage[]
  status: 'active' | 'closed' | 'escalated'
  createdAt: Date
  updatedAt: Date
  context: {
    currentPage?: string
    userBookings?: any[]
    userListings?: any[]
    searchQuery?: string
    selectedCategory?: string
  }
  metadata: {
    userAgent?: string
    deviceType?: 'mobile' | 'desktop' | 'tablet'
    referrer?: string
    sessionStartTime?: Date
    totalMessages?: number
    satisfactionScore?: number
    escalationReason?: string
  }
}

export interface AIResponse {
  message: string
  confidence: number
  category: string
  suggestedActions: string[]
  quickReplies: string[]
  shouldEscalate: boolean
  contextUpdates?: any
  followUpQuestions?: string[]
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  category: string
  priority: number
}

class ProfessionalAIChatService {
  private readonly API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions'

  // Quick actions available to users
  public readonly quickActions: QuickAction[] = [
    {
      id: 'book_item',
      label: 'Find & Book Items',
      icon: '🔍',
      action: 'Help me find and book an item',
      category: 'booking',
      priority: 1
    },
    {
      id: 'list_item',
      label: 'List My Item',
      icon: '📦',
      action: 'I want to list an item for rent',
      category: 'listing',
      priority: 2
    },
    {
      id: 'manage_bookings',
      label: 'My Bookings',
      icon: '📋',
      action: 'Show me my bookings',
      category: 'account',
      priority: 3
    },
    {
      id: 'pricing_help',
      label: 'Pricing Help',
      icon: '💰',
      action: 'Help me with pricing my item',
      category: 'listing',
      priority: 4
    },
    {
      id: 'verification',
      label: 'Account Verification',
      icon: '✓',
      action: 'Help me verify my account',
      category: 'account',
      priority: 5
    },
    {
      id: 'payment_help',
      label: 'Payment Issues',
      icon: '💳',
      action: 'I need help with payments',
      category: 'support',
      priority: 6
    },
    {
      id: 'account_help',
      label: 'Account Help',
      icon: '👤',
      action: 'Help with my account',
      category: 'account',
      priority: 7
    },
    {
      id: 'live_support',
      label: 'Talk to Human',
      icon: '💬',
      action: 'I need to speak with a support agent',
      category: 'support',
      priority: 8
    }
  ]

  // Generate AI response with professional context
  async generateResponse(
    userMessage: string,
    session: ChatSession,
    context?: any
  ): Promise<AIResponse> {
    try {
      // Analyze user intent and context
      const analysis = await this.analyzeUserIntent(userMessage, session, context)

      // Check if we should escalate to human support
      if (this.shouldEscalateToHuman(userMessage, session, analysis)) {
        return this.createEscalationResponse(userMessage, analysis)
      }

      // Generate contextual response
      const response = await this.generateContextualResponse(userMessage, analysis, session)

      // Update session context
      await this.updateSessionContext(session.id, response.contextUpdates)

      return response
    } catch (error) {
      console.error('AI Response generation failed:', error)
      return this.generateFallbackResponse(userMessage)
    }
  }

  // Analyze user intent using NLP patterns
  private async analyzeUserIntent(
    message: string,
    session: ChatSession,
    context?: any
  ): Promise<any> {
    const message_lower = message.toLowerCase()

    // Intent patterns for rental marketplace
    const intentPatterns = {
      booking: {
        keywords: ['book', 'rent', 'reserve', 'hire', 'borrow', 'rental', 'reservation'],
        confidence: 0.9,
        actions: ['search_items', 'view_calendar', 'contact_owner']
      },
      listing: {
        keywords: ['list', 'sell', 'offer', 'rent out', 'create listing', 'add item'],
        confidence: 0.9,
        actions: ['create_listing', 'upload_photos', 'set_pricing']
      },
      account: {
        keywords: ['account', 'profile', 'login', 'password', 'verification', 'settings'],
        confidence: 0.8,
        actions: ['update_profile', 'verify_account', 'change_password']
      },
      billing: {
        keywords: ['payment', 'pay', 'money', 'fee', 'charge', 'refund', 'billing'],
        confidence: 0.9,
        actions: ['view_payments', 'update_payment_method', 'contact_support']
      },
      support: {
        keywords: ['help', 'support', 'problem', 'issue', 'question', 'how to'],
        confidence: 0.7,
        actions: ['search_faq', 'contact_support', 'live_chat']
      }
    }

    // Find matching intent
    let bestIntent = 'general'
    let maxConfidence = 0.5

    for (const [intent, config] of Object.entries(intentPatterns)) {
      const matches = config.keywords.filter(keyword =>
        message_lower.includes(keyword)
      ).length

      if (matches > 0) {
        const confidence = config.confidence * (matches / config.keywords.length)
        if (confidence > maxConfidence) {
          maxConfidence = confidence
          bestIntent = intent
        }
      }
    }

    return {
      intent: bestIntent,
      confidence: maxConfidence,
      context: this.extractContext(message_lower, session),
      suggestedActions: (intentPatterns as any)[bestIntent]?.actions || []
    }
  }

  // Extract context from message and session
  private extractContext(message: string, session: ChatSession): any {
    const context: any = {
      mentionedItems: [],
      mentionedCategories: [],
      timeReferences: [],
      locationReferences: [],
      priceReferences: []
    }

    // Extract categories mentioned
    const categories = ['vehicles', 'homes', 'electronics', 'equipment', 'sports', 'fashion']
    context.mentionedCategories = categories.filter(cat =>
      message.includes(cat.toLowerCase())
    )

    // Extract price references
    const priceMatch = message.match(/\$?\d+(?:\.\d{2})?|\d+\s*dollars?|\d+\s*kes/i)
    if (priceMatch) {
      context.priceReferences = [priceMatch[0]]
    }

    return context
  }

  // Comprehensive FAQ and knowledge base
  private readonly faqDatabase = {
    booking: [
      {
        question: "How do I book an item?",
        answer: "To book an item: 1) Browse our listings, 2) Select your dates, 3) Review pricing, 4) Complete payment, 5) Receive confirmation. You'll get instant booking confirmation via email and SMS.",
        keywords: ["book", "reserve", "rent", "hire", "booking process"]
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and mobile money (M-Pesa, Airtel Money). All payments are processed securely.",
        keywords: ["payment", "pay", "credit card", "paypal", "mobile money", "mpesa"]
      },
      {
        question: "Can I cancel my booking?",
        answer: "Yes! Most listings offer flexible cancellation. You can cancel up to 24 hours before your rental period for a full refund. Check the specific cancellation policy for each listing.",
        keywords: ["cancel", "cancellation", "refund", "cancel booking"]
      },
      {
        question: "What if the item is damaged?",
        answer: "All rentals are covered by our comprehensive insurance. Report any damage immediately through the app. We'll handle the insurance claim process for you.",
        keywords: ["damage", "broken", "insurance", "claim", "problem"]
      }
    ],
    listing: [
      {
        question: "How do I list my item?",
        answer: "To list: 1) Create your account, 2) Click 'List Your Item', 3) Upload 5+ photos, 4) Add description and pricing, 5) Set availability, 6) Submit for review. We'll verify within 24 hours.",
        keywords: ["list", "create listing", "add item", "sell", "rent out"]
      },
      {
        question: "What can I list on Leli Rentals?",
        answer: "You can list vehicles, electronics, equipment, sports gear, fashion items, home goods, and more. Items must be in good condition and legally owned by you.",
        keywords: ["what can I list", "items", "categories", "allowed items"]
      },
      {
        question: "How much can I earn?",
        answer: "Earnings depend on your item's value and demand. Popular items can earn 20-50% of their value per rental. We take a 10% commission on successful bookings.",
        keywords: ["earn", "money", "income", "commission", "fees"]
      },
      {
        question: "How do I set my pricing?",
        answer: "Research similar items on our platform, consider your item's value and condition, and set competitive daily rates. You can adjust pricing anytime based on demand.",
        keywords: ["pricing", "price", "rates", "cost", "how much to charge"]
      }
    ],
    account: [
      {
        question: "How do I verify my account?",
        answer: "To verify: 1) Complete your profile, 2) Upload government ID, 3) Verify phone number, 4) Add payment method. Verified users get priority in bookings and can access premium features.",
        keywords: ["verify", "verification", "verified", "account verification", "ID"]
      },
      {
        question: "How do I update my profile?",
        answer: "Go to your profile settings, update your information, upload a profile photo, and save changes. Keep your contact information current for better booking success.",
        keywords: ["update profile", "edit profile", "change information", "profile settings"]
      },
      {
        question: "How do I change my password?",
        answer: "Go to Account Settings > Security > Change Password. Enter your current password and create a new secure password. We'll send a confirmation email.",
        keywords: ["change password", "reset password", "password", "security"]
      },
      {
        question: "How do I delete my account?",
        answer: "Contact our support team to delete your account. We'll cancel any active bookings and process final payments. Account deletion is permanent.",
        keywords: ["delete account", "close account", "remove account", "deactivate"]
      }
    ],
    billing: [
      {
        question: "When do I get paid?",
        answer: "Payments are processed 24 hours after the rental period ends. You'll receive your earnings (minus our 10% commission) via your preferred payment method.",
        keywords: ["payment", "paid", "earnings", "when do I get paid", "payout"]
      },
      {
        question: "How do I update my payment method?",
        answer: "Go to Account Settings > Billing & Payments > Payment Methods. Add, edit, or remove payment methods. All changes are secure and encrypted.",
        keywords: ["payment method", "update payment", "credit card", "billing"]
      },
      {
        question: "What are your fees?",
        answer: "We charge a 10% commission on successful bookings. There are no listing fees, no monthly fees, and no hidden charges. You only pay when you earn.",
        keywords: ["fees", "commission", "charges", "cost", "pricing"]
      },
      {
        question: "How do I get a refund?",
        answer: "Refunds are processed automatically for cancellations within the policy period. Contact support for special circumstances. Refunds take 3-5 business days.",
        keywords: ["refund", "money back", "cancel", "refund policy"]
      }
    ],
    support: [
      {
        question: "How do I contact support?",
        answer: "You can reach us via: 1) In-app chat (24/7), 2) Email: lelirentalsmail@gmail.com, 3) Phone: +254112081866, 4) WhatsApp: +254112081866",
        keywords: ["contact", "support", "help", "phone", "email", "chat"]
      },
      {
        question: "What if I have a problem with my rental?",
        answer: "Contact us immediately! We have 24/7 support for urgent issues. For non-urgent matters, use the in-app messaging system or email support.",
        keywords: ["problem", "issue", "help", "urgent", "emergency", "support"]
      },
      {
        question: "How do I report a user?",
        answer: "Use the 'Report User' button on their profile or contact support with details. We take all reports seriously and investigate promptly.",
        keywords: ["report", "user", "problem user", "inappropriate", "safety"]
      },
      {
        question: "Is my data secure?",
        answer: "Yes! We use bank-level encryption, secure payment processing, and comply with international data protection standards. Your privacy is our priority.",
        keywords: ["security", "privacy", "data", "safe", "encryption", "protection"]
      }
    ]
  }

  // Generate contextual response with enhanced knowledge base
  private async generateContextualResponse(
    userMessage: string,
    analysis: any,
    session: ChatSession
  ): Promise<AIResponse> {
    // Try to find a matching FAQ entry first
    const faqMatch = this.findMatchingFAQ(userMessage, analysis.intent)
    
    if (faqMatch) {
      return {
        message: faqMatch.answer,
        confidence: 0.95,
        category: analysis.intent,
        suggestedActions: this.getSuggestedActionsForIntent(analysis.intent),
        quickReplies: this.getQuickRepliesForIntent(analysis.intent),
        shouldEscalate: false,
        contextUpdates: analysis.context
      }
    }

    // Fallback to general responses
    const responses = {
      booking: {
        message: "I'd be happy to help you find and book the perfect rental item! What type of item are you looking for?",
        quickReplies: ["Vehicles", "Electronics", "Equipment", "Sports gear"],
        suggestedActions: ["Browse categories", "View popular items", "Search by location"]
      },
      listing: {
        message: "Great! Listing your item on Leli Rentals is easy and can earn you extra income. Let's get started with creating your listing.",
        quickReplies: ["Create listing now", "Learn about fees", "See listing tips"],
        suggestedActions: ["Start listing", "Upload photos", "Set pricing"]
      },
      account: {
        message: "I can help you manage your Leli Rentals account. What would you like to do?",
        quickReplies: ["Update profile", "Verify account", "Change password"],
        suggestedActions: ["View profile", "Account settings", "Security options"]
      },
      billing: {
        message: "I understand you have a billing question. Let me help you with payments and transactions.",
        quickReplies: ["Payment methods", "Refund status", "Billing history"],
        suggestedActions: ["View payments", "Update payment method", "Contact billing support"]
      },
      support: {
        message: "I'm here to help! What can I assist you with today?",
        quickReplies: ["General help", "Technical issues", "Contact human support"],
        suggestedActions: ["Browse FAQ", "Search help articles", "Live chat"]
      },
      general: {
        message: "Hello! I'm Leli's AI assistant, here to help you with rentals, bookings, and account management. How can I assist you today?",
        quickReplies: ["Book an item", "List my item", "Account help", "General questions"],
        suggestedActions: ["Explore rentals", "View my bookings", "Account dashboard"]
      }
    }

    const responseConfig = (responses as any)[analysis.intent] || responses.general

    return {
      message: responseConfig.message,
      confidence: analysis.confidence,
      category: analysis.intent,
      suggestedActions: responseConfig.suggestedActions,
      quickReplies: responseConfig.quickReplies,
      shouldEscalate: false,
      contextUpdates: analysis.context
    }
  }

  // Find matching FAQ entry
  private findMatchingFAQ(userMessage: string, intent: string): any {
    const faqCategory = (this.faqDatabase as any)[intent]
    if (!faqCategory) return null

    const messageLower = userMessage.toLowerCase()
    
    for (const faq of faqCategory) {
      const keywordMatches = faq.keywords.filter((keyword: string) => 
        messageLower.includes(keyword.toLowerCase())
      ).length
      
      if (keywordMatches > 0) {
        return faq
      }
    }
    
    return null
  }

  // Get suggested actions for intent
  private getSuggestedActionsForIntent(intent: string): string[] {
    const actions = {
      booking: ["Browse categories", "View popular items", "Search by location", "Check availability"],
      listing: ["Start listing", "Upload photos", "Set pricing", "View listing tips"],
      account: ["View profile", "Account settings", "Security options", "Verification status"],
      billing: ["View payments", "Update payment method", "Billing history", "Refund status"],
      support: ["Browse FAQ", "Search help articles", "Contact support", "Report issue"],
      general: ["Explore rentals", "View my bookings", "Account dashboard", "Get started"]
    }
    
    return (actions as any)[intent] || actions.general
  }

  // Get quick replies for intent
  private getQuickRepliesForIntent(intent: string): string[] {
    const replies = {
      booking: ["Vehicles", "Electronics", "Equipment", "Sports gear", "💬 Chat on WhatsApp"],
      listing: ["Create listing now", "Learn about fees", "See listing tips", "What can I list?"],
      account: ["Update profile", "Verify account", "Change password", "Account settings"],
      billing: ["Payment methods", "Refund status", "Billing history", "When do I get paid?"],
      support: ["General help", "Technical issues", "Contact human support", "Report user"],
      general: ["Book an item", "List my item", "Account help", "General questions", "💬 Chat on WhatsApp"]
    }
    
    return (replies as any)[intent] || replies.general
  }

  // Check if conversation should escalate to human
  private shouldEscalateToHuman(
    message: string,
    session: ChatSession,
    analysis: any
  ): boolean {
    const escalationTriggers = [
      'urgent', 'emergency', 'asap', 'immediately', 'crisis',
      'angry', 'frustrated', 'terrible', 'worst', 'horrible',
      'complaint', 'dispute', 'damage', 'broken', 'stolen',
      'refund', 'money back', 'compensation', 'lawyer', 'legal'
    ]

    const hasEscalationTrigger = escalationTriggers.some(trigger =>
      message.toLowerCase().includes(trigger)
    )

    const lowConfidence = analysis.confidence < 0.6
    const longConversation = session.messages.length > 15
    const repeatedIssues = this.hasRepeatedIssues(session.messages)

    return hasEscalationTrigger || lowConfidence || longConversation || repeatedIssues
  }

  // Check for repeated issues in conversation
  private hasRepeatedIssues(messages: ChatMessage[]): boolean {
    const userMessages = messages.filter(msg => msg.sender === 'user')
    if (userMessages.length < 3) return false

    const recentMessages = userMessages.slice(-3)
    const messageTexts = recentMessages.map(msg => msg.content.toLowerCase())

    // Check if user is repeating similar questions
    for (let i = 0; i < messageTexts.length - 1; i++) {
      for (let j = i + 1; j < messageTexts.length; j++) {
        if (this.messagesAreSimilar(messageTexts[i], messageTexts[j])) {
          return true
        }
      }
    }

    return false
  }

  // Check if two messages are similar
  private messagesAreSimilar(msg1: string, msg2: string): boolean {
    const words1 = msg1.split(' ').filter(word => word.length > 3)
    const words2 = msg2.split(' ').filter(word => word.length > 3)

    const commonWords = words1.filter(word => words2.includes(word))
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.6
  }

  // Create escalation response
  private createEscalationResponse(userMessage: string, analysis: any): AIResponse {
    return {
      message: "I understand this is an important matter that needs personal attention. I'm connecting you with our human support team who can provide more detailed assistance. A specialist will be with you shortly.",
      confidence: 0.95,
      category: 'escalation',
      suggestedActions: ['Wait for human support', 'Prepare relevant details'],
      quickReplies: ['Continue waiting', 'Cancel escalation'],
      shouldEscalate: true
    }
  }

  // Fallback response when AI fails
  private generateFallbackResponse(userMessage: string): AIResponse {
    return {
      message: "I'm sorry, I'm having trouble processing your request right now. Let me connect you with our human support team who can help you better.",
      confidence: 0.3,
      category: 'error',
      suggestedActions: ['Contact human support', 'Try again later'],
      quickReplies: ['Connect to human', 'Try different question'],
      shouldEscalate: true
    }
  }

  // Session management (using localStorage instead of Firebase)
  async createSession(userId?: string): Promise<string> {
    try {
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newSession: ChatSession = {
        id: sessionId,
        userId,
        messages: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        context: {},
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          deviceType: this.getDeviceType(),
          referrer: typeof window !== 'undefined' ? document.referrer : undefined,
          sessionStartTime: new Date(),
          totalMessages: 0
        }
      }

      // Store in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`ai_chat_session_${sessionId}`, JSON.stringify(newSession))
        } catch (e) {
          console.warn('LocalStorage not available, session will be in-memory only')
        }
      }

      return sessionId
    } catch (error) {
      console.error('Error creating chat session:', error)
      // Return a fallback session ID instead of throwing
      return `fallback_${Date.now()}`
    }
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      // Get from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`ai_chat_session_${sessionId}`)
        if (stored) {
          const session = JSON.parse(stored)
          // Convert date strings back to Date objects
          session.createdAt = new Date(session.createdAt)
          session.updatedAt = new Date(session.updatedAt)
          session.messages = session.messages?.map((msg: any) => ({
          ...msg,
            timestamp: new Date(msg.timestamp)
        })) || []
          return session
        }
      }
      return null
    } catch (error) {
      console.error('Error getting chat session:', error)
      return null
    }
  }

  async addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }

      const session = await this.getSession(sessionId)

      if (!session) throw new Error('Session not found')

      const updatedMessages = [...session.messages, newMessage]
      session.messages = updatedMessages
      session.updatedAt = new Date()
      if (session.metadata) {
        session.metadata.totalMessages = updatedMessages.length
      }

      // Save updated session to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ai_chat_session_${sessionId}`, JSON.stringify(session))
      }
    } catch (error) {
      console.error('Error adding message:', error)
      // Don't throw, just log the error
    }
  }

  async updateSessionContext(sessionId: string, contextUpdates: any): Promise<void> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return

      session.context = { ...session.context, ...contextUpdates }
      session.updatedAt = new Date()

      if (typeof window !== 'undefined') {
        localStorage.setItem(`ai_chat_session_${sessionId}`, JSON.stringify(session))
      }
    } catch (error) {
      console.error('Error updating session context:', error)
    }
  }

  async closeSession(sessionId: string, satisfactionScore?: number): Promise<void> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return

      session.status = 'closed'
      session.updatedAt = new Date()
      if (session.metadata && satisfactionScore) {
        session.metadata.satisfactionScore = satisfactionScore
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`ai_chat_session_${sessionId}`, JSON.stringify(session))
      }
    } catch (error) {
      console.error('Error closing session:', error)
    }
  }

  async submitFeedback(sessionId: string, messageId: string, feedback: 'positive' | 'negative'): Promise<void> {
    try {
      const session = await this.getSession(sessionId)

      if (!session) return

      // Find the message and update its feedback
      const messageIndex = session.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) return

      const updatedMessages = [...session.messages]
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        metadata: {
          ...updatedMessages[messageIndex].metadata,
          feedback,
          feedbackTimestamp: new Date()
        }
      }

      session.messages = updatedMessages
      session.updatedAt = new Date()

      if (typeof window !== 'undefined') {
        localStorage.setItem(`ai_chat_session_${sessionId}`, JSON.stringify(session))
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // Utility methods
  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop'

    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  // Get personalized quick actions based on user context
  getPersonalizedQuickActions(session: ChatSession): QuickAction[] {
    const actions = [...this.quickActions]

    // Prioritize based on user context
    if ((session.context.userBookings?.length || 0) > 0) {
      actions.find(a => a.id === 'manage_bookings')!.priority = 1
    }

    if ((session.context.userListings?.length || 0) > 0) {
      actions.find(a => a.id === 'list_item')!.priority = 1
    }

    return actions.sort((a, b) => a.priority - b.priority)
  }
}

export const professionalAIChatService = new ProfessionalAIChatService()
