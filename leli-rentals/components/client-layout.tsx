"use client"

import { Suspense, useState, ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AccountTypeReminder } from "@/components/account-type-reminder"
import { VerificationReminderBanner } from "@/components/verification-reminder-banner"
import ProfessionalAIChat from "@/components/professional-ai-chat"
import WhatsAppButton from "@/components/whatsapp-button"
import MessagingApp from "@/components/messaging-app"
import { NotificationProvider } from "@/lib/notification-context"

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <NotificationProvider>
        {/* Verification Reminder Banner - Top of page for owners */}
        <VerificationReminderBanner />
        
        {/* Account Type Reminder Banner - Top for skipped users */}
        <AccountTypeReminder variant="banner" />
        
        {children}
        <Toaster />

        {/* Global AI Chat - Available on all pages */}
        <ProfessionalAIChat
          isOpen={isAIChatOpen}
          onToggle={() => setIsAIChatOpen(!isAIChatOpen)}
        />
      </NotificationProvider>
    </ThemeProvider>
  )
}
