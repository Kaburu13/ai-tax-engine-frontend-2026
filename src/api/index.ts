// src/api/index.ts
// API Integration Layer - Unified Exports
// This file provides a single import point for all API functionality

// ============================================================================
// CORE EXPORTS
// ============================================================================

export { default as axiosClient, API_BASE_URL, API_TIMEOUT } from './axios_client'

// Helper functions
export {
  getErrorMessage,
  isNetworkError,
  isValidationError,
  getValidationErrors,
  createFormData,
  createFormDataConfig,
} from './axios_client'

// ============================================================================
// API MODULES
// ============================================================================

export { default as workbookAPI } from './workbook_api'
export { default as processingAPI } from './processing_api'
export { default as reportAPI } from './report_api'

// Individual exports for convenience
export * from './workbook_api'
export * from './processing_api'
export * from './report_api'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type * from './types'

// ============================================================================
// UNIFIED API OBJECT
// ============================================================================

import workbookAPI from './workbook_api'
import processingAPI from './processing_api'
import reportAPI from './report_api'

/**
 * Unified API object containing all API modules
 * 
 * Usage:
 * ```tsx
 * import { api } from '@/api'
 * 
 * const workbooks = await api.workbook.getWorkbooks()
 * const status = await api.processing.getProcessingStatus(id)
 * const report = await api.report.generateReport(request)
 * ```
 */
export const api = {
  workbook: workbookAPI,
  processing: processingAPI,
  report: reportAPI,
}

export default api

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Direct module import
 * ```tsx
 * import { workbookAPI } from '@/api'
 * const workbooks = await workbookAPI.getWorkbooks()
 * ```
 * 
 * Example 2: Unified api object
 * ```tsx
 * import { api } from '@/api'
 * const workbooks = await api.workbook.getWorkbooks()
 * ```
 * 
 * Example 3: Individual function import
 * ```tsx
 * import { getWorkbooks, uploadWorkbook } from '@/api'
 * const workbooks = await getWorkbooks()
 * ```
 * 
 * Example 4: With React Query
 * ```tsx
 * import { useQuery } from '@tanstack/react-query'
 * import { workbookAPI } from '@/api'
 * 
 * function MyComponent() {
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['workbooks'],
 *     queryFn: () => workbookAPI.getWorkbooks(),
 *   })
 * }
 * ```
 * 
 * Example 5: Error handling
 * ```tsx
 * import { uploadWorkbook, getErrorMessage } from '@/api'
 * 
 * try {
 *   await uploadWorkbook(data, onProgress)
 * } catch (error) {
 *   const message = getErrorMessage(error)
 *   toast.error(message)
 * }
 * ```
 */