"use client"

import { LucideIcon } from "lucide-react"
import { User, BarChart3 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
  icon?: LucideIcon
  fullScreen?: boolean
  variant?: "default" | "owner" | "renter" | "admin" | "profile"
  showHeader?: boolean
}

const iconMap = {
  default: User,
  owner: User,
  renter: User,
  admin: BarChart3,
  profile: User,
}

const gradientMap = {
  default: {
    bg: "from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    orb: "from-blue-500 via-purple-500 to-amber-500",
    ring: "from-blue-500 via-purple-500 to-amber-500",
    center: "from-blue-500 to-purple-500",
    text: "from-blue-600 via-purple-600 to-amber-600",
    dots: ["bg-blue-500", "bg-purple-500", "bg-amber-500"]
  },
  owner: {
    bg: "from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    orb: "from-green-500 via-emerald-500 to-teal-500",
    ring: "from-green-500 via-emerald-500 to-teal-500",
    center: "from-green-500 to-emerald-500",
    text: "from-green-600 via-emerald-600 to-teal-600",
    dots: ["bg-green-500", "bg-emerald-500", "bg-teal-500"]
  },
  renter: {
    bg: "from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    orb: "from-purple-500 via-pink-500 to-rose-500",
    ring: "from-purple-500 via-pink-500 to-rose-500",
    center: "from-purple-500 to-pink-500",
    text: "from-purple-600 via-pink-600 to-rose-600",
    dots: ["bg-purple-500", "bg-pink-500", "bg-rose-500"]
  },
  admin: {
    bg: "from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    orb: "from-indigo-500 via-blue-500 to-cyan-500",
    ring: "from-indigo-500 via-blue-500 to-cyan-500",
    center: "from-indigo-500 to-blue-500",
    text: "from-indigo-600 via-blue-600 to-cyan-600",
    dots: ["bg-indigo-500", "bg-blue-500", "bg-cyan-500"]
  },
  profile: {
    bg: "from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    orb: "from-blue-500 via-purple-500 to-amber-500",
    ring: "from-blue-500 via-purple-500 to-amber-500",
    center: "from-blue-500 to-purple-500",
    text: "from-blue-600 via-purple-600 to-amber-600",
    dots: ["bg-blue-500", "bg-purple-500", "bg-amber-500"]
  }
}

export function LoadingSpinner({
  message = "Loading...",
  icon,
  fullScreen = true,
  variant = "default",
  showHeader = false
}: LoadingSpinnerProps) {
  const Icon = icon || iconMap[variant]
  const gradients = gradientMap[variant]

  const spinnerContent = (
    <div className="text-center space-y-6">
      <div className="relative">
        {/* Animated gradient orb */}
        <div className="absolute inset-0 animate-pulse">
          <div className={`w-32 h-32 bg-gradient-to-r ${gradients.orb} rounded-full blur-2xl opacity-50 mx-auto`}></div>
        </div>
        {/* Spinning icon container */}
        <div className="relative w-24 h-24 mx-auto">
          <div className={`absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r ${gradients.ring} bg-clip-border animate-spin`}>
            <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${gradients.bg}`}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 bg-gradient-to-r ${gradients.center} rounded-full flex items-center justify-center animate-pulse`}>
              <Icon className="h-8 w-8 text-white animate-bounce" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <p className={`text-gray-600 dark:text-gray-400 text-lg animate-pulse`}>
          {message}
        </p>
        <div className="flex justify-center gap-1 pt-2">
          {gradients.dots.map((dotColor, index) => (
            <div
              key={index}
              className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`}
              style={{ animationDelay: `${index * 150}ms` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${gradients.bg} flex items-center justify-center`}>
        {showHeader && typeof window !== 'undefined' && (
          // Dynamic import to avoid SSR issues with Header
          <div className="absolute top-0 left-0 right-0">
            {/* Header will be rendered by parent if needed */}
          </div>
        )}
        {spinnerContent}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinnerContent}
    </div>
  )
}

