import apiClient from '../api-client'

export interface User {
  id: string
  firstName: string
  lastName: string
  emailAddresses: any[]
  phoneNumbers: any[]
  createdAt: number
  unsafeMetadata: any
  publicMetadata: any
}

export interface UsersListResponse {
  success: boolean
  users: User[]
  totalCount: number
}

export const usersService = {
  // Get all users
  async getAllUsers(): Promise<UsersListResponse> {
    const response = await apiClient.get<UsersListResponse>('/users/list')
    return response.data
  },

  // Search for a user by email
  async searchUser(emailAddress: string): Promise<{ user: User | null }> {
    const response = await apiClient.post<{ user: User | null }>('/admin/search-user', {
      emailAddress,
    })
    return response.data
  },
}
