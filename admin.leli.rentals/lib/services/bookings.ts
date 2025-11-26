import apiClient from '../api-client'

export interface Booking {
  id: string
  listing_id: string
  listing_title: string
  user_id: string
  customer_name: string
  status: string
  start_date?: string
  end_date?: string
  total_price?: number
  created_at?: string
}

export interface BookingsResponse {
  success: boolean
  bookings: Booking[]
}

export const bookingsService = {
  // Get all bookings
  async getAllBookings(): Promise<BookingsResponse> {
    const response = await apiClient.get<BookingsResponse>('/admin/bookings')
    return response.data
  },
}

