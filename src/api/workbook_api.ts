// src/api/workbook_api.ts
import axiosClient, { createFormData, createFormDataConfig } from './axios_client'
import type {
  Workbook,
  WorkbookCreateRequest,
  WorkbookUpdateRequest,
  WorkbookListParams,
  PaginatedResponse,
  Sheet,
  UploadProgressCallback,
} from './types'

// ============================================================================
// WORKBOOK ENDPOINTS
// ============================================================================

/**
 * Get list of workbooks with optional filtering and pagination
 */
export async function getWorkbooks(
  params?: WorkbookListParams
): Promise<PaginatedResponse<Workbook>> {
  const response = await axiosClient.get<PaginatedResponse<Workbook>>('/workbooks/', {
    params,
  })
  return response.data
}

/**
 * Get a single workbook by ID
 */
export async function getWorkbook(id: number): Promise<Workbook> {
  const response = await axiosClient.get<Workbook>(`/workbooks/${id}/`)
  return response.data
}

/**
 * Upload a new workbook
 */
export async function uploadWorkbook(
  data: WorkbookCreateRequest,
  onUploadProgress?: UploadProgressCallback
): Promise<Workbook> {
  const formData = createFormData({
    file: data.file,
    client_name: data.client_name,
    period: data.period,
  })

  const progressCallback = onUploadProgress
    ? (progressEvent: any) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onUploadProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        })
      }
    : undefined

  const response = await axiosClient.post<Workbook>(
    '/workbooks/',
    formData,
    createFormDataConfig(progressCallback)
  )

  return response.data
}

/**
 * Update workbook metadata
 */
export async function updateWorkbook(
  id: number,
  data: WorkbookUpdateRequest
): Promise<Workbook> {
  const response = await axiosClient.patch<Workbook>(`/workbooks/${id}/`, data)
  return response.data
}

/**
 * Delete a workbook
 */
export async function deleteWorkbook(id: number): Promise<void> {
  await axiosClient.delete(`/workbooks/${id}/`)
}

/**
 * Get workbook statistics/summary
 */
export async function getWorkbookStats(id: number): Promise<any> {
  const response = await axiosClient.get(`/workbooks/${id}/stats/`)
  return response.data
}

// ============================================================================
// SHEET ENDPOINTS
// ============================================================================

/**
 * Get all sheets for a workbook
 */
export async function getWorkbookSheets(workbookId: number): Promise<Sheet[]> {
  const response = await axiosClient.get<Sheet[]>(`/workbooks/${workbookId}/sheets/`)
  return response.data
}

/**
 * Get a single sheet by ID
 */
export async function getSheet(sheetId: number): Promise<Sheet> {
  const response = await axiosClient.get<Sheet>(`/sheets/${sheetId}/`)
  return response.data
}

/**
 * Update sheet metadata
 */
export async function updateSheet(
  sheetId: number,
  data: Partial<Sheet>
): Promise<Sheet> {
  const response = await axiosClient.patch<Sheet>(`/sheets/${sheetId}/`, data)
  return response.data
}

/**
 * Get sheet data/content
 */
export async function getSheetData(sheetId: number): Promise<any> {
  const response = await axiosClient.get(`/sheets/${sheetId}/data/`)
  return response.data
}

// ============================================================================
// VALIDATION ENDPOINTS
// ============================================================================

/**
 * Validate workbook file before upload
 */
export async function validateWorkbookFile(file: File): Promise<any> {
  const formData = createFormData({ file })
  
  const response = await axiosClient.post(
    '/workbooks/validate/',
    formData,
    createFormDataConfig()
  )
  
  return response.data
}

/**
 * Check year continuity for a workbook
 */
export async function checkYearContinuity(id: number): Promise<any> {
  const response = await axiosClient.get(`/workbooks/${id}/check-continuity/`)
  return response.data
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Delete multiple workbooks
 */
export async function bulkDeleteWorkbooks(ids: number[]): Promise<void> {
  await axiosClient.post('/workbooks/bulk-delete/', { ids })
}

/**
 * Export workbooks data
 */
export async function exportWorkbooks(ids?: number[]): Promise<Blob> {
  const response = await axiosClient.post(
    '/workbooks/export/',
    { ids },
    {
      responseType: 'blob',
    }
  )
  return response.data
}

// ============================================================================
// SEARCH AND FILTER
// ============================================================================

/**
 * Search workbooks by client name or other criteria
 */
export async function searchWorkbooks(query: string): Promise<Workbook[]> {
  const response = await axiosClient.get<Workbook[]>('/workbooks/search/', {
    params: { q: query },
  })
  return response.data
}

/**
 * Get recent workbooks
 */
export async function getRecentWorkbooks(limit: number = 10): Promise<Workbook[]> {
  const response = await axiosClient.get<Workbook[]>('/workbooks/recent/', {
    params: { limit },
  })
  return response.data
}

// ============================================================================
// WORKBOOK API OBJECT (for easier imports)
// ============================================================================

const workbookAPI = {
  // List and retrieve
  getWorkbooks,
  getWorkbook,
  getRecentWorkbooks,
  searchWorkbooks,
  
  // Create and update
  uploadWorkbook,
  updateWorkbook,
  deleteWorkbook,
  bulkDeleteWorkbooks,
  
  // Sheets
  getWorkbookSheets,
  getSheet,
  updateSheet,
  getSheetData,
  
  // Validation
  validateWorkbookFile,
  checkYearContinuity,
  
  // Stats and export
  getWorkbookStats,
  exportWorkbooks,
}

export default workbookAPI