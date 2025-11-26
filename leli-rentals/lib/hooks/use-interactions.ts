import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { simpleInteractionsService } from '@/lib/simple-interactions-service'

interface InteractionState {
  liked: boolean
  saved: boolean
  totalLikes: number
  totalSaves: number
  loading: boolean
}

interface UseInteractionsReturn {
  interactions: Record<string, InteractionState>
  toggleLike: (listingId: string) => Promise<void>
  toggleSave: (listingId: string) => Promise<void>
  trackView: (listingId: string, metadata?: { duration?: number; source?: string }) => Promise<void>
  trackShare: (listingId: string, platform: string, recipient?: string) => Promise<void>
  isLoading: boolean
}

export function useInteractions(): UseInteractionsReturn {
  const { user } = useUser()
  const [interactions, setInteractions] = useState<Record<string, InteractionState>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load user's interactions on mount
  useEffect(() => {
    // Always load interactions, even for demo users
    loadUserInteractions()
  }, [user])

  const loadUserInteractions = async () => {
    // Use demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    try {
      setIsLoading(true)
      const [likes, saves] = await Promise.all([
        simpleInteractionsService.getUserLikes(userId),
        simpleInteractionsService.getUserSaves(userId)
      ])

      // Initialize interactions state
      const newInteractions: Record<string, InteractionState> = {}
      
      // Set liked listings
      likes.forEach(listingId => {
        newInteractions[listingId] = {
          liked: true,
          saved: false,
          totalLikes: 0,
          totalSaves: 0,
          loading: false
        }
      })

      // Set saved listings
      saves.forEach(listingId => {
        if (newInteractions[listingId]) {
          newInteractions[listingId].saved = true
        } else {
          newInteractions[listingId] = {
            liked: false,
            saved: true,
            totalLikes: 0,
            totalSaves: 0,
            loading: false
          }
        }
      })

      setInteractions(newInteractions)
    } catch (error) {
      console.error('Error loading user interactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLike = useCallback(async (listingId: string) => {
    // Use demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    // Optimistic update
    setInteractions(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        liked: !prev[listingId]?.liked,
        loading: true
      }
    }))

    try {
      const result = await simpleInteractionsService.toggleLike(userId, listingId)
      
      setInteractions(prev => ({
        ...prev,
        [listingId]: {
          ...prev[listingId],
          liked: result.liked,
          totalLikes: result.totalLikes,
          loading: false
        }
      }))
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update
      setInteractions(prev => ({
        ...prev,
        [listingId]: {
          ...prev[listingId],
          liked: !prev[listingId]?.liked,
          loading: false
        }
      }))
    }
  }, [user])

  const toggleSave = useCallback(async (listingId: string) => {
    // Use demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    // Optimistic update
    setInteractions(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        saved: !prev[listingId]?.saved,
        loading: true
      }
    }))

    try {
      const result = await simpleInteractionsService.toggleSave(userId, listingId)
      
      setInteractions(prev => ({
        ...prev,
        [listingId]: {
          ...prev[listingId],
          saved: result.saved,
          totalSaves: result.totalSaves,
          loading: false
        }
      }))
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert optimistic update
      setInteractions(prev => ({
        ...prev,
        [listingId]: {
          ...prev[listingId],
          saved: !prev[listingId]?.saved,
          loading: false
        }
      }))
    }
  }, [user])

  const trackView = useCallback(async (listingId: string, metadata?: { duration?: number; source?: string }) => {
    // Use demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    try {
      await simpleInteractionsService.trackView(userId, listingId, metadata)
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }, [user])

  const trackShare = useCallback(async (listingId: string, platform: string, recipient?: string) => {
    // Use demo user ID if not signed in
    const userId = user?.id || 'demo_user'

    try {
      await simpleInteractionsService.trackShare(userId, listingId, platform, recipient)
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  }, [user])

  return {
    interactions,
    toggleLike,
    toggleSave,
    trackView,
    trackShare,
    isLoading
  }
}
