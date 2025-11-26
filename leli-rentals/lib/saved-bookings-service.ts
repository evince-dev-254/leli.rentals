// Service for managing saved bookings from listings
import { SavedBooking } from './types/saved-booking'

class SavedBookingsService {
  private readonly STORAGE_KEY = 'leli_saved_bookings'

  // Get all saved bookings for a user
  async getUserSavedBookings(userId: string): Promise<SavedBooking[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return []
      
      const allSavedBookings: SavedBooking[] = JSON.parse(saved)
      return allSavedBookings.filter(booking => booking.userId === userId)
    } catch (error) {
      console.error('Error loading saved bookings:', error)
      return []
    }
  }

  // Save a booking from a listing
  async saveBooking(userId: string, listing: any, notes?: string, tags?: string[]): Promise<SavedBooking> {
    try {
      const savedBooking: SavedBooking = {
        id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.image || listing.images?.[0] || '/placeholder.svg',
        listingPrice: listing.price,
        listingLocation: listing.location,
        listingCategory: listing.category,
        savedAt: new Date(),
        notes,
        tags: tags || []
      }

      const existing = localStorage.getItem(this.STORAGE_KEY)
      const allSavedBookings: SavedBooking[] = existing ? JSON.parse(existing) : []
      
      // Check if already saved
      const alreadySaved = allSavedBookings.find(
        booking => booking.userId === userId && booking.listingId === listing.id
      )
      
      if (alreadySaved) {
        throw new Error('This listing is already saved')
      }

      allSavedBookings.push(savedBooking)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSavedBookings))
      
      return savedBooking
    } catch (error) {
      console.error('Error saving booking:', error)
      throw error
    }
  }

  // Remove a saved booking
  async removeSavedBooking(userId: string, listingId: string): Promise<void> {
    try {
      const existing = localStorage.getItem(this.STORAGE_KEY)
      if (!existing) return
      
      const allSavedBookings: SavedBooking[] = JSON.parse(existing)
      const filtered = allSavedBookings.filter(
        booking => !(booking.userId === userId && booking.listingId === listingId)
      )
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error removing saved booking:', error)
      throw error
    }
  }

  // Check if a listing is saved
  async isListingSaved(userId: string, listingId: string): Promise<boolean> {
    try {
      const savedBookings = await this.getUserSavedBookings(userId)
      return savedBookings.some(booking => booking.listingId === listingId)
    } catch (error) {
      console.error('Error checking if listing is saved:', error)
      return false
    }
  }

  // Update saved booking notes/tags
  async updateSavedBooking(userId: string, listingId: string, updates: { notes?: string; tags?: string[] }): Promise<void> {
    try {
      const existing = localStorage.getItem(this.STORAGE_KEY)
      if (!existing) return
      
      const allSavedBookings: SavedBooking[] = JSON.parse(existing)
      const bookingIndex = allSavedBookings.findIndex(
        booking => booking.userId === userId && booking.listingId === listingId
      )
      
      if (bookingIndex !== -1) {
        allSavedBookings[bookingIndex] = {
          ...allSavedBookings[bookingIndex],
          ...updates
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSavedBookings))
      }
    } catch (error) {
      console.error('Error updating saved booking:', error)
      throw error
    }
  }

  // Get saved bookings by category
  async getSavedBookingsByCategory(userId: string, category: string): Promise<SavedBooking[]> {
    try {
      const savedBookings = await this.getUserSavedBookings(userId)
      return savedBookings.filter(booking => booking.listingCategory === category)
    } catch (error) {
      console.error('Error getting saved bookings by category:', error)
      return []
    }
  }

  // Search saved bookings
  async searchSavedBookings(userId: string, query: string): Promise<SavedBooking[]> {
    try {
      const savedBookings = await this.getUserSavedBookings(userId)
      const lowercaseQuery = query.toLowerCase()
      
      return savedBookings.filter(booking =>
        booking.listingTitle.toLowerCase().includes(lowercaseQuery) ||
        booking.listingLocation.toLowerCase().includes(lowercaseQuery) ||
        booking.listingCategory.toLowerCase().includes(lowercaseQuery) ||
        booking.notes?.toLowerCase().includes(lowercaseQuery) ||
        booking.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    } catch (error) {
      console.error('Error searching saved bookings:', error)
      return []
    }
  }

  // Get saved bookings statistics
  async getSavedBookingsStats(userId: string): Promise<{
    total: number
    byCategory: Record<string, number>
    byLocation: Record<string, number>
    recentCount: number
  }> {
    try {
      const savedBookings = await this.getUserSavedBookings(userId)
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const byCategory: Record<string, number> = {}
      const byLocation: Record<string, number> = {}
      
      savedBookings.forEach(booking => {
        // Count by category
        byCategory[booking.listingCategory] = (byCategory[booking.listingCategory] || 0) + 1
        
        // Count by location
        byLocation[booking.listingLocation] = (byLocation[booking.listingLocation] || 0) + 1
      })
      
      const recentCount = savedBookings.filter(booking => 
        new Date(booking.savedAt) >= oneWeekAgo
      ).length
      
      return {
        total: savedBookings.length,
        byCategory,
        byLocation,
        recentCount
      }
    } catch (error) {
      console.error('Error getting saved bookings stats:', error)
      return {
        total: 0,
        byCategory: {},
        byLocation: {},
        recentCount: 0
      }
    }
  }
}

export const savedBookingsService = new SavedBookingsService()
export default savedBookingsService
