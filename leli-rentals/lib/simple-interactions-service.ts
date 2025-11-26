// Simple client-side interactions service using localStorage
// This provides immediate functionality while we can later upgrade to Firebase

interface UserInteraction {
  userId: string
  listingId: string
  interactionType: 'like' | 'save' | 'view' | 'share'
  timestamp: Date
  metadata?: any
}

interface InteractionState {
  liked: boolean
  saved: boolean
  totalLikes: number
  totalSaves: number
  loading: boolean
}

class SimpleInteractionsService {
  private getStorageKey(userId: string): string {
    return `leli_interactions_${userId}`
  }

  private getStatsKey(): string {
    return 'leli_listing_stats'
  }

  // Get user's interactions from localStorage
  private getUserInteractions(userId: string): UserInteraction[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error reading user interactions:', error)
      return []
    }
  }

  // Save user's interactions to localStorage
  private saveUserInteractions(userId: string, interactions: UserInteraction[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(interactions))
    } catch (error) {
      console.error('Error saving user interactions:', error)
    }
  }

  // Get listing stats from localStorage
  private getListingStatsData(): Record<string, { likes: number; saves: number; views: number; shares: number }> {
    try {
      const data = localStorage.getItem(this.getStatsKey())
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error reading listing stats:', error)
      return {}
    }
  }

  // Save listing stats to localStorage
  private saveListingStats(stats: Record<string, { likes: number; saves: number; views: number; shares: number }>): void {
    try {
      localStorage.setItem(this.getStatsKey(), JSON.stringify(stats))
    } catch (error) {
      console.error('Error saving listing stats:', error)
    }
  }

  // Like/Unlike a listing
  async toggleLike(userId: string, listingId: string): Promise<{ liked: boolean; totalLikes: number }> {
    const interactions = this.getUserInteractions(userId)
    const stats = this.getListingStatsData()
    
    // Check if user already liked this listing
    const existingLike = interactions.find(
      i => i.listingId === listingId && i.interactionType === 'like'
    )
    
    if (existingLike) {
      // Unlike - remove the interaction
      const newInteractions = interactions.filter(i => i !== existingLike)
      this.saveUserInteractions(userId, newInteractions)
      
      // Update stats
      stats[listingId] = stats[listingId] || { likes: 0, saves: 0, views: 0, shares: 0 }
      stats[listingId].likes = Math.max(0, stats[listingId].likes - 1)
      this.saveListingStats(stats)
      
      return { liked: false, totalLikes: stats[listingId].likes }
    } else {
      // Like - add the interaction
      const newInteraction: UserInteraction = {
        userId,
        listingId,
        interactionType: 'like',
        timestamp: new Date(),
        metadata: {}
      }
      
      const newInteractions = [...interactions, newInteraction]
      this.saveUserInteractions(userId, newInteractions)
      
      // Update stats
      stats[listingId] = stats[listingId] || { likes: 0, saves: 0, views: 0, shares: 0 }
      stats[listingId].likes += 1
      this.saveListingStats(stats)
      
      return { liked: true, totalLikes: stats[listingId].likes }
    }
  }

  // Save/Unsave a listing
  async toggleSave(userId: string, listingId: string): Promise<{ saved: boolean; totalSaves: number }> {
    const interactions = this.getUserInteractions(userId)
    const stats = this.getListingStatsData()
    
    // Check if user already saved this listing
    const existingSave = interactions.find(
      i => i.listingId === listingId && i.interactionType === 'save'
    )
    
    if (existingSave) {
      // Unsave - remove the interaction
      const newInteractions = interactions.filter(i => i !== existingSave)
      this.saveUserInteractions(userId, newInteractions)
      
      // Update stats
      stats[listingId] = stats[listingId] || { likes: 0, saves: 0, views: 0, shares: 0 }
      stats[listingId].saves = Math.max(0, stats[listingId].saves - 1)
      this.saveListingStats(stats)
      
      return { saved: false, totalSaves: stats[listingId].saves }
    } else {
      // Save - add the interaction
      const newInteraction: UserInteraction = {
        userId,
        listingId,
        interactionType: 'save',
        timestamp: new Date(),
        metadata: {}
      }
      
      const newInteractions = [...interactions, newInteraction]
      this.saveUserInteractions(userId, newInteractions)
      
      // Update stats
      stats[listingId] = stats[listingId] || { likes: 0, saves: 0, views: 0, shares: 0 }
      stats[listingId].saves += 1
      this.saveListingStats(stats)
      
      return { saved: true, totalSaves: stats[listingId].saves }
    }
  }

  // Track listing view
  async trackView(userId: string, listingId: string, metadata?: { duration?: number; source?: string }): Promise<void> {
    const interactions = this.getUserInteractions(userId)
    const stats = this.getListingStatsData()
    
    // Add view interaction
    const newInteraction: UserInteraction = {
      userId,
      listingId,
      interactionType: 'view',
      timestamp: new Date(),
      metadata: metadata || {}
    }
    
    const newInteractions = [...interactions, newInteraction]
    this.saveUserInteractions(userId, newInteractions)
    
    // Update stats
    stats[listingId] = stats[listingId] || { likes: 0, saves: 0, views: 0, shares: 0 }
    stats[listingId].views += 1
    this.saveListingStats(stats)
  }

  // Track listing share
  async trackShare(userId: string, listingId: string, platform: string, recipient?: string): Promise<void> {
    const interactions = this.getUserInteractions(userId)
    const stats = this.getListingStatsData()
    
    // Add share interaction
    const newInteraction: UserInteraction = {
      userId,
      listingId,
      interactionType: 'share',
      timestamp: new Date(),
      metadata: { platform, recipient }
    }
    
    const newInteractions = [...interactions, newInteraction]
    this.saveUserInteractions(userId, newInteractions)
    
    // Update stats
    stats[listingId] = stats[listingId] || { likes: 0, saves: 0, views: 0, shares: 0 }
    stats[listingId].shares += 1
    this.saveListingStats(stats)
  }

  // Get user's liked listings
  async getUserLikes(userId: string): Promise<string[]> {
    const interactions = this.getUserInteractions(userId)
    return interactions
      .filter(i => i.interactionType === 'like')
      .map(i => i.listingId)
  }

  // Get user's saved listings
  async getUserSaves(userId: string): Promise<string[]> {
    const interactions = this.getUserInteractions(userId)
    return interactions
      .filter(i => i.interactionType === 'save')
      .map(i => i.listingId)
  }

  // Get listing statistics
  async getListingStats(listingId: string): Promise<{ totalLikes: number; totalSaves: number; totalViews: number; totalShares: number } | null> {
    const stats = this.getListingStatsData()
    const listingStats = stats[listingId]
    
    if (!listingStats) return null
    
    return {
      totalLikes: listingStats.likes,
      totalSaves: listingStats.saves,
      totalViews: listingStats.views,
      totalShares: listingStats.shares
    }
  }
}

export const simpleInteractionsService = new SimpleInteractionsService()
