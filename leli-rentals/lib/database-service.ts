import { prisma } from './prisma'
import { databaseConfig } from './config'

// Database service that can work alongside Firebase
export class DatabaseService {
  // User operations
  static async createUser(userData: {
    id: string
    email: string
    name?: string
    avatar?: string
  }) {
    try {
      return await prisma.user.create({
        data: userData
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  static async getUserById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          listings: true,
          bookings: true,
          reviews: true
        }
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  static async updateUser(id: string, data: {
    name?: string
    avatar?: string
  }) {
    try {
      return await prisma.user.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Listing operations
  static async createListing(listingData: {
    title: string
    description: string
    price: number
    category: string
    location: string
    images: string[]
    features: string[]
    rules: string[]
    ownerId: string
  }) {
    try {
      return await prisma.listing.create({
        data: listingData,
        include: {
          owner: true
        }
      })
    } catch (error) {
      console.error('Error creating listing:', error)
      throw error
    }
  }

  static async getListings(filters?: {
    category?: string
    location?: string
    minPrice?: number
    maxPrice?: number
  }) {
    try {
      return await prisma.listing.findMany({
        where: {
          isActive: true,
          ...(filters?.category && { category: filters.category }),
          ...(filters?.location && { location: { contains: filters.location } }),
          ...(filters?.minPrice && { price: { gte: filters.minPrice } }),
          ...(filters?.maxPrice && { price: { lte: filters.maxPrice } })
        },
        include: {
          owner: true,
          reviews: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching listings:', error)
      throw error
    }
  }

  static async getListingById(id: string) {
    try {
      return await prisma.listing.findUnique({
        where: { id },
        include: {
          owner: true,
          reviews: {
            include: {
              user: true
            }
          },
          bookings: true
        }
      })
    } catch (error) {
      console.error('Error fetching listing:', error)
      throw error
    }
  }

  // Booking operations
  static async createBooking(bookingData: {
    listingId: string
    userId: string
    startDate: Date
    endDate: Date
    totalPrice: number
  }) {
    try {
      return await prisma.booking.create({
        data: bookingData,
        include: {
          listing: true,
          user: true
        }
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  static async getUserBookings(userId: string) {
    try {
      return await prisma.booking.findMany({
        where: { userId },
        include: {
          listing: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }
  }

  // Review operations
  static async createReview(reviewData: {
    listingId: string
    userId: string
    rating: number
    comment?: string
  }) {
    try {
      return await prisma.review.create({
        data: reviewData,
        include: {
          user: true,
          listing: true
        }
      })
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  static async getListingReviews(listingId: string) {
    try {
      return await prisma.review.findMany({
        where: { listingId },
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching listing reviews:', error)
      throw error
    }
  }
}
