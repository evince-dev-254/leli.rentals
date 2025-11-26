import apiClient from '../api-client'

export const verificationService = {
  // Approve user verification
  async approveVerification(userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      `/admin/verifications/approve/${userId}`,
      { action: 'approve' }
    )
    return response.data
  },

  // Reject user verification
  async rejectVerification(userId: string, reason: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      `/admin/verifications/reject/${userId}`,
      { reason }
    )
    return response.data
  },
}

