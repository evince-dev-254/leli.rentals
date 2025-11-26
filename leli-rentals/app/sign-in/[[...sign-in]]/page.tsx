'use client'

import { SignIn } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function SignInPage() {
  const [particles, setParticles] = useState<Array<{
    left: number
    top: number
    width: number
    height: number
    background: string
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    // Generate particles only on client side
    const newParticles = [...Array(30)].map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: 2 + Math.random() * 4,
      height: 2 + Math.random() * 4,
      background: i % 2 === 0 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(217, 119, 6, 0.25)',
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 15,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-amber-100 dark:from-purple-950 dark:via-gray-900 dark:to-amber-950 relative overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/40 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-300/30 dark:bg-amber-900/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-950/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              background: particle.background,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] animate-grid-flow"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        {/* Logo/Brand with glow effect */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block relative">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-amber-600 to-purple-700 dark:from-purple-300 dark:via-amber-300 dark:to-purple-400 bg-clip-text text-transparent mb-3 animate-gradient-shift drop-shadow-[0_0_20px_rgba(88,28,135,0.4)]">
              Welcome Back
            </h1>
            <div className="absolute -inset-4 bg-purple-300/30 dark:bg-purple-900/15 blur-2xl rounded-full -z-10 animate-pulse"></div>
          </div>
          <p className="text-purple-800/80 dark:text-purple-200/70 text-lg mt-2">
            Log in to continue to <span className="text-amber-600 dark:text-amber-400 font-semibold">Leli Rentals</span>
          </p>
        </div>

        {/* Clerk Sign In Component with custom card */}
        <div className="transform transition-all duration-500 hover:scale-[1.02] animate-slide-up">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gradient-to-br dark:from-gray-950/95 dark:via-purple-950/90 dark:to-gray-900/85 border border-purple-200 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-700/40 transition-all duration-300",
                headerTitle: "text-purple-900 dark:text-purple-200",
                headerSubtitle: "text-purple-700 dark:text-purple-300/60",
                socialButtonsBlockButton: "bg-gray-50 dark:bg-gray-900/60 border-purple-200 dark:border-purple-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/70 text-purple-900 dark:text-purple-200 backdrop-blur-sm",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-amber-600 dark:from-purple-700 dark:to-amber-700 hover:from-purple-700 hover:to-amber-700 dark:hover:from-purple-600 dark:hover:to-amber-600 shadow-lg hover:shadow-purple-500/50 dark:hover:shadow-purple-900/50 transition-all duration-300",
                formFieldInput: "bg-gray-50 dark:bg-gray-950/70 border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-100 placeholder:text-purple-400 dark:placeholder:text-purple-400/40 focus:border-purple-500 dark:focus:border-purple-600",
                footerActionLink: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
                formFieldLabel: "text-purple-700 dark:text-purple-300",
                identityPreviewText: "text-purple-900 dark:text-purple-200",
                formFieldInputShowPasswordButton: "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200",
                identityPreviewEditButton: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
                formResendCodeLink: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
                otpCodeFieldInput: "bg-gray-50 dark:bg-gray-950/70 border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-100 focus:border-purple-500 dark:focus:border-purple-600",
                formFieldWarningText: "text-amber-600 dark:text-amber-400",
                formFieldSuccessText: "text-green-600 dark:text-green-400",
                formFieldErrorText: "text-red-600 dark:text-red-400",
                formFieldInfoText: "text-purple-700 dark:text-purple-300",
                identityPreviewEditButtonIcon: "text-purple-600 dark:text-purple-400",
                formHeaderTitle: "text-purple-900 dark:text-purple-200",
                formHeaderSubtitle: "text-purple-700 dark:text-purple-300",
                dividerLine: "bg-purple-200 dark:bg-purple-800",
                dividerText: "text-purple-600 dark:text-purple-400",
                formFieldHintText: "text-purple-600 dark:text-purple-300",
                alertText: "text-purple-900 dark:text-purple-100",
                alert: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/40",
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            // use new prop name instead of deprecated `afterSignInUrl`
            fallbackRedirectUrl="/"
            redirectUrl="/"
          />
        </div>

        {/* Decorative elements with glow */}
        <div className="mt-8 text-center space-y-4 animate-fade-in-delayed">
          <div className="flex items-center justify-center gap-3 text-sm text-purple-700 dark:text-purple-300/60">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-800 to-transparent"></div>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800/30">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Login
            </span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent via-purple-300 dark:via-purple-800 to-transparent"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translate(10px, -20px) rotate(90deg);
            opacity: 0.6;
          }
          50% {
            transform: translate(-10px, -40px) rotate(180deg);
            opacity: 0.3;
          }
          75% {
            transform: translate(20px, -20px) rotate(270deg);
            opacity: 0.6;
          }
        }

        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes grid-flow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1.2s ease-out 0.4s both;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }

        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

