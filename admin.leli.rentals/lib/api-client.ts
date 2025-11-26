import axios, { AxiosInstance, AxiosError } from 'axios'

// All admin client requests go through the main app API
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MAIN_API_URL || 'http://localhost:3000/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': process.env.ADMIN_INTERNAL_TOKEN || '',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[Admin API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      })
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Network Error]', error.request)
    } else {
      // Something else happened
      console.error('[API Error]', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient

