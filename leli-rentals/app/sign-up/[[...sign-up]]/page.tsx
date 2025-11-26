'use client'

import { SignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function SignUpPage() {
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
    const newParticles = [...Array(35)].map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: 2 + Math.random() * 4,
      height: 2 + Math.random() * 4,
      background: i % 2 === 0 ? 'rgba(217, 119, 6, 0.25)' : 'rgba(168, 85, 247, 0.3)',
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 15,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-white to-purple-100 dark:from-amber-950 dark:via-gray-900 dark:to-purple-950 relative overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-300/30 dark:bg-amber-900/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300/40 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-200/20 dark:bg-amber-950/10 rounded-full blur-3xl animate-spin-slow"></div>
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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-amber-700 dark:from-amber-300 dark:via-purple-300 dark:to-amber-400 bg-clip-text text-transparent mb-3 animate-gradient-shift drop-shadow-[0_0_20px_rgba(120,53,15,0.4)]">
              Join Leli Rentals
            </h1>
            <div className="absolute -inset-4 bg-amber-300/30 dark:bg-amber-900/15 blur-2xl rounded-full -z-10 animate-pulse"></div>
          </div>
          <p className="text-amber-800/80 dark:text-amber-200/70 text-lg mt-2">
            Create your account and start <span className="text-purple-600 dark:text-purple-400 font-semibold">renting today</span>
          </p>
        </div>

        {/* Clerk Sign Up Component with custom card */}
        <div className="transform transition-all duration-500 hover:scale-[1.02] animate-slide-up">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gradient-to-br dark:from-gray-950/95 dark:via-amber-950/90 dark:to-gray-900/85 border border-amber-200 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700/40 transition-all duration-300",
                headerTitle: "text-amber-900 dark:text-amber-200",
                headerSubtitle: "text-amber-700 dark:text-amber-300/60",
                socialButtonsBlockButton: "bg-gray-50 dark:bg-gray-900/60 border-amber-200 dark:border-amber-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/70 text-amber-900 dark:text-amber-200 backdrop-blur-sm",
                formButtonPrimary: "bg-gradient-to-r from-amber-600 to-purple-600 dark:from-amber-700 dark:to-purple-700 hover:from-amber-700 hover:to-purple-700 dark:hover:from-amber-600 dark:hover:to-purple-600 shadow-lg hover:shadow-amber-500/50 dark:hover:shadow-amber-900/50 transition-all duration-300",
                formFieldInput: "bg-gray-50 dark:bg-gray-950/70 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-400/40 focus:border-amber-500 dark:focus:border-amber-600",
                footerActionLink: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
                formFieldLabel: "text-amber-700 dark:text-amber-300",
                identityPreviewText: "text-amber-900 dark:text-amber-200",
                formFieldInputShowPasswordButton: "text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200",
                identityPreviewEditButton: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
                formResendCodeLink: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
                otpCodeFieldInput: "bg-gray-50 dark:bg-gray-950/70 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-100 focus:border-amber-500 dark:focus:border-amber-600",
                formFieldWarningText: "text-amber-600 dark:text-amber-400",
                formFieldSuccessText: "text-green-600 dark:text-green-400",
                formFieldErrorText: "text-red-600 dark:text-red-400",
                formFieldInfoText: "text-amber-700 dark:text-amber-300",
                identityPreviewEditButtonIcon: "text-amber-600 dark:text-amber-400",
                formHeaderTitle: "text-amber-900 dark:text-amber-200",
                formHeaderSubtitle: "text-amber-700 dark:text-amber-300",
                dividerLine: "bg-amber-200 dark:bg-amber-800",
                dividerText: "text-amber-600 dark:text-amber-400",
                formFieldHintText: "text-amber-600 dark:text-amber-300",
                alertText: "text-amber-900 dark:text-amber-100",
                alert: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/40",
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/get-started"
            redirectUrl="/get-started"
          />
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
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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

