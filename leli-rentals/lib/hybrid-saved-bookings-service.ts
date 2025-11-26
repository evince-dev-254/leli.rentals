// Saved bookings service - Uses local storage
import { savedBookingsService } from './saved-bookings-service'
import { SavedBooking } from './types/saved-booking'

class HybridSavedBookingsService {
  // Get all saved bookings for a user
  async getUserSavedBookings(userId: string): Promise<SavedBooking[]> {
    return await savedBookingsService.getUserSavedBookings(userId)
  }

  // Save a booking from a listing
  async saveBooking(userId: string, listing: any, notes?: string, tags?: string[]): Promise<SavedBooking> {
    return await savedBookingsService.saveBooking(userId, listing, notes, tags)
  }

  // Remove a saved booking
  async removeSavedBooking(userId: string, listingId: string): Promise<void> {
    return await savedBookingsService.removeSavedBooking(userId, listingId)
  }

  // Check if a listing is saved
  async isListingSaved(userId: string, listingId: string): Promise<boolean> {
    return await savedBookingsService.isListingSaved(userId, listingId)
  }

  // Update saved booking notes/tags
  async updateSavedBooking(userId: string, listingId: string, updates: { notes?: string; tags?: string[] }): Promise<void> {
    return await savedBookingsService.updateSavedBooking(userId, listingId, updates)
  }

  // Get saved bookings by category
  async getSavedBookingsByCategory(userId: string, category: string): Promise<SavedBooking[]> {
    return await savedBookingsService.getSavedBookingsByCategory(userId, category)
  }

  // Search saved bookings
  async searchSavedBookings(userId: string, query: string): Promise<SavedBooking[]> {
    return await savedBookingsService.searchSavedBookings(userId, query)
  }

  // Get saved bookings statistics
  async getSavedBookingsStats(userId: string): Promise<{
    total: number
    byCategory: Record<string, number>
    byLocation: Record<string, number>
    recentCount: number
  }> {
    return await savedBookingsService.getSavedBookingsStats(userId)
  }
}

export const hybridSavedBookingsService = new HybridSavedBookingsService()
export default hybridSavedBookingsService
