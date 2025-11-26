"use client"

import { Share2, Copy, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  itemId: string
  itemTitle: string
  itemDescription?: string
  className?: string
  size?: "sm" | "default" | "lg"
}

export function ShareButton({ itemId, itemTitle, itemDescription, className, size = "sm" }: ShareButtonProps) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shareUrl = (typeof window !== "undefined" && window.location && window.location.origin)
    ? `${window.location.origin}/listings/${itemId}`
    : ''
  const shareText = `Check out this rental: ${itemTitle}`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itemTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled")
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "The rental link has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(itemTitle)}&body=${encodedText}%20${encodedUrl}`,
    }

    if (typeof window === 'undefined') return

    if (platform === "email") {
      window.location.href = urls[platform as keyof typeof urls]
    } else {
      window.open(urls[platform as keyof typeof urls], "_blank", "width=600,height=400")
    }
  }

  return (
    // Render dropdown only after mount to avoid SSR/client id mismatches from Radix
    mounted ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size={size}
            className={`${className} ${size === "sm" ? "h-8 w-8 p-0" : "gap-2"} bg-white/90 hover:bg-white transition-all`}
          >
            <Share2 className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} text-gray-600`} />
            {size !== "sm" && <span className="text-sm font-medium">Share</span>}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {navigator.share && (
            <>
              <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Share via...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleSocialShare("facebook")} className="cursor-pointer">
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleSocialShare("twitter")} className="cursor-pointer">
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleSocialShare("linkedin")} className="cursor-pointer">
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleSocialShare("email")} className="cursor-pointer">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      // Fallback button during SSR
      <Button
        variant="secondary"
        size={size}
        className={`${className} ${size === "sm" ? "h-8 w-8 p-0" : "gap-2"} bg-white/90 hover:bg-white transition-all`}
      >
        <Share2 className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} text-gray-600`} />
        {size !== "sm" && <span className="text-sm font-medium">Share</span>}
      </Button>
    )
  )
}
