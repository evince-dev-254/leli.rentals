// Firebase removed - all imports removed

export interface UserInteraction {
  id?: string
  userId: string
  listingId: string
  interactionType: 'like' | 'save' | 'view' | 'share'
  timestamp: Date
  metadata?: {
    duration?: number
    source?: string
    platform?: string
    recipient?: string
    notes?: string
  }
}

export interface ListingStats {
  id?: string
  listingId: string
  totalViews: number
  totalLikes: number
  totalSaves: number
  totalShares: number
  uniqueViewers: number
  lastUpdated: Date
  viewsToday: number
  viewsThisWeek: number
  viewsThisMonth: number
  popularityScore: number
  trendingScore: number
}

export interface UserFavorite {
  id?: string
  userId: string
  listingId: string
  createdAt: Date
  notes?: string
  tags?: string[]
}

export interface ListingDetailsView {
  id?: string
  userId: string
  listingId: string
  viewedAt: Date
  sessionId: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
}

class InteractionsService {
  // Like/Unlike a listing
  async toggleLike(userId: string, listingId: string): Promise<{ liked: boolean; totalLikes: number }> {
    try {
      // Check if user already liked this listing
      const likesQuery = query(
        collection(db, 'user_interactions'),
        where('userId', '==', userId),
        where('listingId', '==', listingId),
        where('interactionType', '==', 'like')
      )
      
      const likesSnapshot = await getDocs(likesQuery)
      const existingLike = likesSnapshot.docs[0]
      
      if (existingLike) {
        // Unlike - remove the interaction
        await deleteDoc(doc(db, 'user_interactions', existingLike.id))
        
        // Update listing stats
        await this.updateListingStats(listingId, 'like', -1)
        
        return { liked: false, totalLikes: await this.getListingLikes(listingId) }
      } else {
        // Like - add the interaction
        await addDoc(collection(db, 'user_interactions'), {
          userId,
          listingId,
          interactionType: 'like',
          timestamp: serverTimestamp(),
          metadata: {}
        })
        
        // Update listing stats
        await this.updateListingStats(listingId, 'like', 1)
        
        return { liked: true, totalLikes: await this.getListingLikes(listingId) }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw new Error('Failed to toggle like')
    }
  }

  // Save/Unsave a listing
  async toggleSave(userId: string, listingId: string): Promise<{ saved: boolean; totalSaves: number }> {
    try {
      // Check if user already saved this listing
      const savesQuery = query(
        collection(db, 'user_interactions'),
        where('userId', '==', userId),
        where('listingId', '==', listingId),
        where('interactionType', '==', 'save')
      )
      
      const savesSnapshot = await getDocs(savesQuery)
      const existingSave = savesSnapshot.docs[0]
      
      if (existingSave) {
        // Unsave - remove the interaction
        await deleteDoc(doc(db, 'user_interactions', existingSave.id))
        
        // Update listing stats
        await this.updateListingStats(listingId, 'save', -1)
        
        return { saved: false, totalSaves: await this.getListingSaves(listingId) }
      } else {
        // Save - add the interaction
        await addDoc(collection(db, 'user_interactions'), {
          userId,
          listingId,
          interactionType: 'save',
          timestamp: serverTimestamp(),
          metadata: {}
        })
        
        // Update listing stats
        await this.updateListingStats(listingId, 'save', 1)
        
        return { saved: true, totalSaves: await this.getListingSaves(listingId) }
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      throw new Error('Failed to toggle save')
    }
  }

  // Track listing view
  async trackView(userId: string, listingId: string, metadata?: { duration?: number; source?: string }): Promise<void> {
    try {
      // Add view interaction
      await addDoc(collection(db, 'user_interactions'), {
        userId,
        listingId,
        interactionType: 'view',
        timestamp: serverTimestamp(),
        metadata: metadata || {}
      })
      
      // Update listing stats
      await this.updateListingStats(listingId, 'view', 1)
    } catch (error) {
      console.error('Error tracking view:', error)
      throw new Error('Failed to track view')
    }
  }

  // Track listing share
  async trackShare(userId: string, listingId: string, platform: string, recipient?: string): Promise<void> {
    try {
      // Add share interaction
      await addDoc(collection(db, 'user_interactions'), {
        userId,
        listingId,
        interactionType: 'share',
        timestamp: serverTimestamp(),
        metadata: {
          platform,
          recipient
        }
      })
      
      // Update listing stats
      await this.updateListingStats(listingId, 'share', 1)
    } catch (error) {
      console.error('Error tracking share:', error)
      throw new Error('Failed to track share')
    }
  }

  // Get user's liked listings
  async getUserLikes(userId: string): Promise<string[]> {
    try {
      const likesQuery = query(
        collection(db, 'user_interactions'),
        where('userId', '==', userId),
        where('interactionType', '==', 'like')
      )
      
      const snapshot = await getDocs(likesQuery)
      return snapshot.docs.map(doc => doc.data().listingId)
    } catch (error) {
      console.error('Error getting user likes:', error)
      return []
    }
  }

  // Get user's saved listings
  async getUserSaves(userId: string): Promise<string[]> {
    try {
      const savesQuery = query(
        collection(db, 'user_interactions'),
        where('userId', '==', userId),
        where('interactionType', '==', 'save')
      )
      
      const snapshot = await getDocs(savesQuery)
      return snapshot.docs.map(doc => doc.data().listingId)
    } catch (error) {
      console.error('Error getting user saves:', error)
      return []
    }
  }

  // Get listing statistics
  async getListingStats(listingId: string): Promise<ListingStats | null> {
    try {
      const statsQuery = query(
        collection(db, 'listing_stats'),
        where('listingId', '==', listingId)
      )
      
      const snapshot = await getDocs(statsQuery)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as ListingStats
    } catch (error) {
      console.error('Error getting listing stats:', error)
      return null
    }
  }

  // Get most popular listings
  async getPopularListings(limitCount: number = 10): Promise<ListingStats[]> {
    try {
      const popularQuery = query(
        collection(db, 'listing_stats'),
        orderBy('popularityScore', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(popularQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListingStats))
    } catch (error) {
      console.error('Error getting popular listings:', error)
      return []
    }
  }

  // Get trending listings
  async getTrendingListings(limitCount: number = 10): Promise<ListingStats[]> {
    try {
      const trendingQuery = query(
        collection(db, 'listing_stats'),
        orderBy('trendingScore', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(trendingQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListingStats))
    } catch (error) {
      console.error('Error getting trending listings:', error)
      return []
    }
  }

  // Private helper methods
  private async updateListingStats(listingId: string, type: 'like' | 'save' | 'view' | 'share', incrementValue: number): Promise<void> {
    try {
      const statsQuery = query(
        collection(db, 'listing_stats'),
        where('listingId', '==', listingId)
      )
      
      const snapshot = await getDocs(statsQuery)
      
      if (snapshot.empty) {
        // Create new stats document
        await addDoc(collection(db, 'listing_stats'), {
          listingId,
          totalViews: type === 'view' ? 1 : 0,
          totalLikes: type === 'like' ? 1 : 0,
          totalSaves: type === 'save' ? 1 : 0,
          totalShares: type === 'share' ? 1 : 0,
          uniqueViewers: type === 'view' ? 1 : 0,
          lastUpdated: serverTimestamp(),
          viewsToday: type === 'view' ? 1 : 0,
          viewsThisWeek: type === 'view' ? 1 : 0,
          viewsThisMonth: type === 'view' ? 1 : 0,
          popularityScore: 1,
          trendingScore: 1
        })
      } else {
        // Update existing stats document
        const docRef = doc(db, 'listing_stats', snapshot.docs[0].id)
        const updateData: any = {
          lastUpdated: serverTimestamp()
        }
        
        switch (type) {
          case 'like':
            updateData.totalLikes = increment(incrementValue)
            break
          case 'save':
            updateData.totalSaves = increment(incrementValue)
            break
          case 'view':
            updateData.totalViews = increment(incrementValue)
            updateData.viewsToday = increment(incrementValue)
            updateData.viewsThisWeek = increment(incrementValue)
            updateData.viewsThisMonth = increment(incrementValue)
            break
          case 'share':
            updateData.totalShares = increment(incrementValue)
            break
        }
        
        await updateDoc(docRef, updateData)
      }
    } catch (error) {
      console.error('Error updating listing stats:', error)
    }
  }

  private async getListingLikes(listingId: string): Promise<number> {
    try {
      const stats = await this.getListingStats(listingId)
      return stats?.totalLikes || 0
    } catch (error) {
      return 0
    }
  }

  private async getListingSaves(listingId: string): Promise<number> {
    try {
      const stats = await this.getListingStats(listingId)
      return stats?.totalSaves || 0
    } catch (error) {
      return 0
    }
  }
}

export const interactionsService = new InteractionsService()
