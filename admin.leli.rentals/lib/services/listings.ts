import apiClient from '../api-client'

export interface Listing {
  id: string
  title: string
  category: string
  price: number
  status: string
  created_at: string
  user_id: string
  owner_name?: string
  views?: number
}

export interface ListingsResponse {
  success: boolean
  listings: Listing[]
}

export const listingsService = {
  // Get all listings
  async getAllListings(): Promise<ListingsResponse> {
    const response = await apiClient.get<ListingsResponse>('/admin/listings')
    return response.data
  },
}

