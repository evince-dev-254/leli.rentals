import { query, transaction } from "./database"
import { notificationsService } from "./notifications-service"
import { verificationService } from "./verification-service"

export interface Booking {
  id?: string
  listingId: string
  userId: string
  ownerId: string
  listingTitle: string
  listingImage: string
  ownerName: string
  ownerAvatar: string
  ownerRating: number
  dates: {
    start: Date
    end: Date
    duration: number
  }
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  paymentDetails: any
  category: string
  location: string
  specialRequests: string
  cancellationPolicy: string
  createdAt?: Date
  updatedAt?: Date
}

export interface BookingFilters {
  userId?: string
  ownerId?: string
  status?: string
  listingId?: string
  paymentStatus?: string
}

class BookingsService {
  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
    try {
      let sql = `
        SELECT * FROM bookings 
        WHERE 1=1
      `
      const params: any[] = []
      let paramCount = 0

      if (filters?.userId) {
        paramCount++
        sql += ` AND user_id = $${paramCount}`
        params.push(filters.userId)
      }

      if (filters?.ownerId) {
        paramCount++
        sql += ` AND owner_id = $${paramCount}`
        params.push(filters.ownerId)
      }

      if (filters?.status) {
        paramCount++
        sql += ` AND status = $${paramCount}`
        params.push(filters.status)
      }

      if (filters?.listingId) {
        paramCount++
        sql += ` AND listing_id = $${paramCount}`
        params.push(filters.listingId)
      }

      if (filters?.paymentStatus) {
        paramCount++
        sql += ` AND payment_status = $${paramCount}`
        params.push(filters.paymentStatus)
      }

      sql += ` ORDER BY created_at DESC`

      const result = await query(sql, params)
      const bookings: Booking[] = result.rows.map((row: any) => ({
        id: row.id,
        listingId: row.listing_id,
        userId: row.user_id,
        ownerId: row.owner_id,
        listingTitle: row.listing_title,
        listingImage: row.listing_image,
        ownerName: row.owner_name,
        ownerAvatar: row.owner_avatar,
        ownerRating: row.owner_rating,
        dates: {
          start: row.start_date,
          end: row.end_date,
          duration: row.duration
        },
        totalPrice: row.total_price,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        paymentDetails: row.payment_details,
        category: row.category,
        location: row.location,
        specialRequests: row.special_requests,
        cancellationPolicy: row.cancellation_policy,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      return bookings
    } catch (error) {
      console.error('Error getting bookings:', error)
      throw new Error('Failed to get bookings')
    }
  }

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const result = await query(`
        SELECT * FROM bookings WHERE id = $1
      `, [id])

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        id: row.id,
        listingId: row.listing_id,
        userId: row.user_id,
        ownerId: row.owner_id,
        listingTitle: row.listing_title,
        listingImage: row.listing_image,
        ownerName: row.owner_name,
        ownerAvatar: row.owner_avatar,
        ownerRating: row.owner_rating,
        dates: {
          start: row.start_date,
          end: row.end_date,
          duration: row.duration
        },
        totalPrice: row.total_price,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        paymentDetails: row.payment_details,
        category: row.category,
        location: row.location,
        specialRequests: row.special_requests,
        cancellationPolicy: row.cancellation_policy,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    } catch (error) {
      console.error('Error getting booking by ID:', error)
      throw new Error('Failed to get booking')
    }
  }

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Apply verification benefits for the user
      const bookingWithBenefits = await verificationService.applyVerificationBenefits(booking.userId, booking)

      return await transaction(async (client) => {
        const result = await client.query(`
          INSERT INTO bookings (
            listing_id, user_id, owner_id, listing_title, listing_image,
            owner_name, owner_avatar, owner_rating, start_date, end_date,
            duration, total_price, status, payment_status, payment_method,
            payment_details, category, location, special_requests, cancellation_policy
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING id
        `, [
          bookingWithBenefits.listingId,
          bookingWithBenefits.userId,
          bookingWithBenefits.ownerId,
          bookingWithBenefits.listingTitle,
          bookingWithBenefits.listingImage,
          bookingWithBenefits.ownerName,
          bookingWithBenefits.ownerAvatar,
          bookingWithBenefits.ownerRating,
          bookingWithBenefits.dates.start,
          bookingWithBenefits.dates.end,
          bookingWithBenefits.dates.duration,
          bookingWithBenefits.totalPrice,
          bookingWithBenefits.status,
          bookingWithBenefits.paymentStatus,
          bookingWithBenefits.paymentMethod,
          JSON.stringify(bookingWithBenefits.paymentDetails || {}),
          bookingWithBenefits.category,
          bookingWithBenefits.location,
          bookingWithBenefits.specialRequests,
          bookingWithBenefits.cancellationPolicy
        ])

        const bookingId = result.rows[0].id

        // Create notification for the user
        try {
          await notificationsService.createBookingNotification(bookingWithBenefits.userId, {
            bookingId: bookingId,
            listingTitle: bookingWithBenefits.listingTitle,
            status: bookingWithBenefits.status,
            totalPrice: bookingWithBenefits.totalPrice,
            dates: {
              start: bookingWithBenefits.dates.start,
              end: bookingWithBenefits.dates.end
            }
          })
        } catch (notificationError) {
          console.error('Error creating booking notification:', notificationError)
          // Don't throw error for notification failure
        }

        return bookingId
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      throw new Error('Failed to create booking')
    }
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<void> {
    try {
      const updateFields: string[] = []
      const params: any[] = []
      let paramCount = 0

      if (updates.status !== undefined) {
        paramCount++
        updateFields.push(`status = $${paramCount}`)
        params.push(updates.status)
      }

      if (updates.paymentStatus !== undefined) {
        paramCount++
        updateFields.push(`payment_status = $${paramCount}`)
        params.push(updates.paymentStatus)
      }

      if (updates.paymentMethod !== undefined) {
        paramCount++
        updateFields.push(`payment_method = $${paramCount}`)
        params.push(updates.paymentMethod)
      }

      if (updates.paymentDetails !== undefined) {
        paramCount++
        updateFields.push(`payment_details = $${paramCount}`)
        params.push(JSON.stringify(updates.paymentDetails))
      }

      if (updates.specialRequests !== undefined) {
        paramCount++
        updateFields.push(`special_requests = $${paramCount}`)
        params.push(updates.specialRequests)
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update')
      }

      paramCount++
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
      params.push(id)

      const sql = `
        UPDATE bookings 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount}
      `

      await query(sql, params)
    } catch (error) {
      console.error('Error updating booking:', error)
      throw new Error('Failed to update booking')
    }
  }

  async deleteBooking(id: string): Promise<void> {
    try {
      await query(`
        DELETE FROM bookings WHERE id = $1
      `, [id])
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw new Error('Failed to delete booking')
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.getBookings({ userId })
  }

  async getOwnerBookings(ownerId: string): Promise<Booking[]> {
    return this.getBookings({ ownerId })
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return this.getBookings({ status })
  }

  async getBookingsByPaymentStatus(paymentStatus: string): Promise<Booking[]> {
    return this.getBookings({ paymentStatus })
  }

  async getBookingStats(userId?: string): Promise<{
    total: number
    pending: number
    confirmed: number
    cancelled: number
    completed: number
    totalRevenue: number
  }> {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END), 0) as total_revenue
        FROM bookings
        WHERE 1=1
      `
      const params: any[] = []

      if (userId) {
        sql += ` AND user_id = $1`
        params.push(userId)
      }

      const result = await query(sql, params)
      const row = result.rows[0]

      return {
        total: parseInt(row.total),
        pending: parseInt(row.pending),
        confirmed: parseInt(row.confirmed),
        cancelled: parseInt(row.cancelled),
        completed: parseInt(row.completed),
        totalRevenue: parseFloat(row.total_revenue)
      }
    } catch (error) {
      console.error('Error getting booking stats:', error)
      throw new Error('Failed to get booking stats')
    }
  }
}

export const bookingsService = new BookingsService()
export default bookingsService
