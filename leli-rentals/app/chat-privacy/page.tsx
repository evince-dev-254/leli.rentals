import React from "react"

export default function ChatPrivacyPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1>Chat & Support Privacy Policy</h1>
      <p>Last updated: September 15, 2025</p>

      <h2>Overview</h2>
      <p>
        This policy explains what data is collected and how it is used when you contact our support using the chat widget ("Support (Maggie)") or when you click "Contact Us" which opens WhatsApp. The chat widget simply opens WhatsApp with a prefilled message and does not itself store messages on our servers.
      </p>

      <h2>Data We Collect</h2>
      <ul>
        <li><strong>Prefilled message and URL:</strong> When you click to contact us, we include the current page URL and a short message in the query string to WhatsApp. This data is sent directly to WhatsApp and not saved by us.</li>
        <li><strong>Device and browser metadata:</strong> Basic metadata such as user agent and referrer may be visible to WhatsApp when opening the share link. We do not collect additional analytics beyond what is described in our main privacy policy.</li>
        <li><strong>Phone number:</strong> The WhatsApp conversation happens between you and our support phone (+254112081866). We do not store your phone number unless you explicitly provide it to support during the conversation.</li>
      </ul>

      <h2>How We Use the Data</h2>
      <p>
        The prefilled message and URL help our support team understand your context and serve you faster. Messages exchanged on WhatsApp are governed by WhatsApp's privacy practices. We may copy conversation contents into our internal support tools for quality, training, and service improvement with your consent.
      </p>

      <h2>Third Parties</h2>
      <p>
        When you open WhatsApp, message content and metadata are subject to WhatsApp's privacy policy and terms. We recommend reviewing WhatsApp's policies: https://www.whatsapp.com/legal.
      </p>

      <h2>Retention</h2>
      <p>
        We retain any conversation transcripts only with your consent or when required for legal or operational reasons. If you provide personal data during the conversation and later request deletion, contact support and we will follow applicable laws.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access, correction, or deletion of personal data we've retained from the support conversation. To do so contact us via the support WhatsApp or the email address listed in our main privacy policy.
      </p>

      <h2>Contact</h2>
      <p>
        Support WhatsApp: <a href="https://wa.me/254112081866">+254112081866</a>
      </p>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">If you have questions about this policy or wish to exercise your rights, please contact support.</p>
    </main>
  )
}
