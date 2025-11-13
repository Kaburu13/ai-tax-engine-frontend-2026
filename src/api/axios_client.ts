// src/api/axios_client.ts

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { APIError } from './types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10)

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

axiosClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.headers['X-Request-Time'] = new Date().toISOString()

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  async (error: AxiosError<APIError>) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      })
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token')
          // You can dispatch a logout action here if using Redux/Zustand
          console.warn('🔒 Unauthorized - Token may be expired')
          break

        case 403:
          // Forbidden
          console.warn('🚫 Forbidden - Insufficient permissions')
          break

        case 404:
          // Not Found
          console.warn('🔍 Resource not found')
          break

        case 422:
          // Validation Error
          console.warn('⚠️ Validation error:', data)
          break

        case 500:
          // Server Error
          console.error('💥 Server error')
          break

        case 503:
          // Service Unavailable
          console.error('⏸️ Service unavailable')
          break

        default:
          console.error(`❌ Error ${status}:`, data)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('📡 No response received:', error.request)
    } else {
      // Something else happened
      console.error('⚠️ Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIError>
    
    // Try different error message formats from Django
    if (axiosError.response?.data) {
      const data = axiosError.response.data
      
      if (data.detail) return data.detail
      if (data.message) return data.message
      if (data.non_field_errors && data.non_field_errors.length > 0) {
        return data.non_field_errors[0]
      }
      if (data.errors) {
        const firstError = Object.values(data.errors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          return firstError[0]
        }
      }
    }

    // Network or timeout errors
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout - please try again'
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error - please check your connection'
    }

    // Fallback to error message
    return axiosError.message
  }

  // Non-Axios error
  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')
  }
  return false
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 422
  }
  return false
}

/**
 * Get validation errors from API response
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIError>
    if (axiosError.response?.data?.errors) {
      return axiosError.response.data.errors
    }
  }
  return {}
}

// ============================================================================
// FILE UPLOAD HELPERS
// ============================================================================

/**
 * Create multipart/form-data config for file uploads
 */
export function createFormDataConfig(
  onUploadProgress?: (progressEvent: any) => void
): AxiosRequestConfig {
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
    timeout: 300000, // 5 minutes for file uploads
  }
}

/**
 * Create FormData from object
 */
export function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    }
  })
  
  return formData
}

// ============================================================================
// EXPORTS
// ============================================================================

export default axiosClient
export { API_BASE_URL, API_TIMEOUT }