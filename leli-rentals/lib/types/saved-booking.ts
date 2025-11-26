// Shared interface for saved bookings
export interface SavedBooking {
  id: string
  userId: string
  listingId: string
  listingTitle: string
  listingImage: string
  listingPrice: number
  listingLocation: string
  listingCategory: string
  savedAt: Date
  notes?: string
  tags?: string[]
}
