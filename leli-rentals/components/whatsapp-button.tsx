"use client"

import React from "react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

const WHATSAPP_NUMBER = "+254112081866"
const DEFAULT_MESSAGE = "Hi%20Leli%20Rentals%20AI%20Assistant!%20I%20need%20help%20with%20a%20rental%20listing."

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${DEFAULT_MESSAGE}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with AI Assistant on WhatsApp"
      title="Chat with AI Assistant on WhatsApp"
      className="fixed right-4 bottom-4 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  )
}
