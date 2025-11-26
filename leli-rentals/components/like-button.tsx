"use client"

import type React from "react"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface LikeButtonProps {
  itemId: string
  itemTitle?: string
  className?: string
  size?: "sm" | "default" | "lg"
}

export function LikeButton({ itemId, itemTitle, className, size = "sm" }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10)
  const { toast } = useToast()

  useEffect(() => {
    // Load liked state from localStorage (guard for SSR)
    if (typeof window !== 'undefined') {
      try {
        const likedItems = JSON.parse(localStorage.getItem("likedItems") || "[]")
        setIsLiked(likedItems.includes(itemId))
      } catch (e) {
        setIsLiked(false)
      }
    }
  }, [itemId])

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

  const likedItems = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("likedItems") || "[]") : []

    if (isLiked) {
      // Remove from liked items
      const updatedItems = likedItems.filter((id: string) => id !== itemId)
      if (typeof window !== 'undefined') {
        localStorage.setItem("likedItems", JSON.stringify(updatedItems))
      }
      setIsLiked(false)
      setLikeCount((prev) => prev - 1)

      toast({
        title: "Removed from favorites",
        description: itemTitle ? `${itemTitle} removed from your favorites` : "Item removed from favorites",
      })
    } else {
      // Add to liked items
      const updatedItems = [...likedItems, itemId]
      if (typeof window !== 'undefined') {
        localStorage.setItem("likedItems", JSON.stringify(updatedItems))
      }
      setIsLiked(true)
      setLikeCount((prev) => prev + 1)

      toast({
        title: "Added to favorites",
        description: itemTitle ? `${itemTitle} added to your favorites` : "Item added to favorites",
      })
    }
  }

  return (
    <Button
      variant="secondary"
      size={size}
      className={`${className} ${size === "sm" ? "h-8 w-8 p-0" : "gap-2"} bg-white/90 hover:bg-white transition-all`}
      onClick={handleLike}
    >
      <Heart
        className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} transition-colors ${
          isLiked ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
        }`}
      />
      {size !== "sm" && (
        <span className="text-sm font-medium">
          {isLiked ? "Liked" : "Like"} ({likeCount})
        </span>
      )}
    </Button>
  )
}
