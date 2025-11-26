import type { Metadata } from "next"
import { ReactNode } from "react"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"
import { ClientLayout } from "@/components/client-layout"
import { UIShell } from "@/lib/ui-shell"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Leli Rentals - Modern Tech-Inspired Rental Marketplace",
  description: "Discover the perfect rental for every occasion with our modern, user-friendly platform",
  icons: {
    icon: [
      { url: "/default.svg", type: "image/svg+xml" },
      { url: "/default.svg", sizes: "any" }
    ],
    apple: "/default.svg",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkJsUrl = process.env.NEXT_PUBLIC_CLERK_JS_URL
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      clerkJSUrl={clerkJsUrl}
      // Replace deprecated `afterSignInUrl`/`afterSignUpUrl` with new redirect props
      fallbackRedirectUrl="/get-started"
      signUpFallbackRedirectUrl="/get-started"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#2563eb', // Blue primary color
          colorBackground: '#ffffff',
          colorInputBackground: '#f9fafb',
          colorInputText: '#374151',
          colorText: '#374151',
          colorTextSecondary: '#6b7280',
          borderRadius: '1rem', // Rounded corners
          fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              backgroundColor: '#1e40af',
              transform: 'translateY(0)',
            },
          },
          card: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            borderRadius: '1.5rem',
            border: 'none',
          },
          headerTitle: {
            fontSize: '1.875rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          },
          headerSubtitle: {
            color: '#6b7280',
            fontSize: '0.875rem',
          },
          socialButtonsBlockButton: {
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#f9fafb',
              borderColor: '#d1d5db',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            },
          },
          formFieldInput: {
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            transition: 'all 0.2s ease',
            '&:focus': {
              borderColor: '#2563eb',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
              backgroundColor: '#ffffff',
            },
          },
          footerActionLink: {
            color: '#2563eb',
            fontWeight: '500',
            '&:hover': {
              color: '#1d4ed8',
              textDecoration: 'underline',
            },
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Prevent zoom on input focus for mobile devices
                if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                  const viewport = document.querySelector('meta[name=viewport]');
                  if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
                  }
                }
              `,
            }}
          />
        </head>
        <body className={`font-sans ${dmSans.variable} antialiased`}>
          <ClientLayout>
            <UIShell>{children}</UIShell>
          </ClientLayout>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
