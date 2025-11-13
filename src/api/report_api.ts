// src/api/report_api.ts
import axiosClient from './axios_client'
import type {
  Report,
  GenerateReportRequest,
  ReportType,
  DashboardStats,
} from './types'

// ============================================================================
// REPORT GENERATION ENDPOINTS
// ============================================================================

/**
 * Generate a report for a workbook
 */
export async function generateReport(
  request: GenerateReportRequest
): Promise<Report> {
  const response = await axiosClient.post<Report>('/reports/generate/', request)
  return response.data
}

/**
 * Generate full tax computation report
 */
export async function generateFullReport(
  workbookId: number,
  includeNotes: boolean = true,
  includeWorkings: boolean = true
): Promise<Report> {
  return generateReport({
    workbook_id: workbookId,
    report_type: 'full_computation',
    include_notes: includeNotes,
    include_workings: includeWorkings,
  })
}

/**
 * Generate summary report
 */
export async function generateSummaryReport(workbookId: number): Promise<Report> {
  return generateReport({
    workbook_id: workbookId,
    report_type: 'summary',
  })
}

/**
 * Generate provisions report
 */
export async function generateProvisionsReport(workbookId: number): Promise<Report> {
  return generateReport({
    workbook_id: workbookId,
    report_type: 'provisions',
  })
}

/**
 * Generate investment allowance report
 */
export async function generateInvestmentAllowanceReport(
  workbookId: number
): Promise<Report> {
  return generateReport({
    workbook_id: workbookId,
    report_type: 'investment_allowance',
  })
}

/**
 * Generate deferred tax report
 */
export async function generateDeferredTaxReport(workbookId: number): Promise<Report> {
  return generateReport({
    workbook_id: workbookId,
    report_type: 'deferred_tax',
  })
}

// ============================================================================
// REPORT DOWNLOAD ENDPOINTS
// ============================================================================

/**
 * Download a generated report
 */
export async function downloadReport(reportId: number): Promise<Blob> {
  const response = await axiosClient.get(`/reports/${reportId}/download/`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Download report and trigger browser download
 */
export async function downloadReportToFile(
  reportId: number,
  filename?: string
): Promise<void> {
  const blob = await downloadReport(reportId)
  
  // Create download link
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `report_${reportId}.xlsx`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Get report download URL
 */
export function getReportDownloadUrl(reportId: number): string {
  return `${axiosClient.defaults.baseURL}/reports/${reportId}/download/`
}

// ============================================================================
// REPORT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all reports for a workbook
 */
export async function getWorkbookReports(workbookId: number): Promise<Report[]> {
  const response = await axiosClient.get<Report[]>(
    `/workbooks/${workbookId}/reports/`
  )
  return response.data
}

/**
 * Get a specific report
 */
export async function getReport(reportId: number): Promise<Report> {
  const response = await axiosClient.get<Report>(`/reports/${reportId}/`)
  return response.data
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: number): Promise<void> {
  await axiosClient.delete(`/reports/${reportId}/`)
}

/**
 * Get latest report of a specific type
 */
export async function getLatestReport(
  workbookId: number,
  reportType: ReportType
): Promise<Report | null> {
  const response = await axiosClient.get<Report | null>(
    `/workbooks/${workbookId}/reports/latest/`,
    { params: { report_type: reportType } }
  )
  return response.data
}

// ============================================================================
// BATCH REPORT OPERATIONS
// ============================================================================

/**
 * Generate reports for multiple workbooks
 */
export async function generateBatchReports(
  workbookIds: number[],
  reportType: ReportType
): Promise<Report[]> {
  const response = await axiosClient.post<Report[]>('/reports/batch-generate/', {
    workbook_ids: workbookIds,
    report_type: reportType,
  })
  return response.data
}

/**
 * Download multiple reports as a zip file
 */
export async function downloadBatchReports(reportIds: number[]): Promise<Blob> {
  const response = await axiosClient.post(
    '/reports/batch-download/',
    { report_ids: reportIds },
    { responseType: 'blob' }
  )
  return response.data
}

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

/**
 * Export workbook data to Excel
 */
export async function exportWorkbookToExcel(workbookId: number): Promise<Blob> {
  const response = await axiosClient.get(
    `/workbooks/${workbookId}/export/excel/`,
    { responseType: 'blob' }
  )
  return response.data
}

/**
 * Export workbook data to PDF
 */
export async function exportWorkbookToPDF(workbookId: number): Promise<Blob> {
  const response = await axiosClient.get(
    `/workbooks/${workbookId}/export/pdf/`,
    { responseType: 'blob' }
  )
  return response.data
}

/**
 * Export workbook data to JSON
 */
export async function exportWorkbookToJSON(workbookId: number): Promise<any> {
  const response = await axiosClient.get(`/workbooks/${workbookId}/export/json/`)
  return response.data
}

// ============================================================================
// STATISTICS AND DASHBOARD
// ============================================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await axiosClient.get<DashboardStats>('/dashboard/stats/')
  return response.data
}

/**
 * Get processing statistics
 */
export async function getProcessingStats(): Promise<any> {
  const response = await axiosClient.get('/dashboard/processing-stats/')
  return response.data
}

/**
 * Get report generation statistics
 */
export async function getReportStats(): Promise<any> {
  const response = await axiosClient.get('/dashboard/report-stats/')
  return response.data
}

// ============================================================================
// PREVIEW ENDPOINTS
// ============================================================================

/**
 * Get report preview data (without generating full report)
 */
export async function getReportPreview(
  workbookId: number,
  reportType: ReportType
): Promise<any> {
  const response = await axiosClient.get(
    `/workbooks/${workbookId}/reports/preview/`,
    { params: { report_type: reportType } }
  )
  return response.data
}

/**
 * Get tax computation summary for preview
 */
export async function getTaxComputationSummary(workbookId: number): Promise<any> {
  const response = await axiosClient.get(
    `/workbooks/${workbookId}/tax-summary/`
  )
  return response.data
}

// ============================================================================
// REPORT API OBJECT (for easier imports)
// ============================================================================

const reportAPI = {
  // Generate reports
  generateReport,
  generateFullReport,
  generateSummaryReport,
  generateProvisionsReport,
  generateInvestmentAllowanceReport,
  generateDeferredTaxReport,
  generateBatchReports,
  
  // Download reports
  downloadReport,
  downloadReportToFile,
  downloadBatchReports,
  getReportDownloadUrl,
  
  // Manage reports
  getWorkbookReports,
  getReport,
  getLatestReport,
  deleteReport,
  
  // Export
  exportWorkbookToExcel,
  exportWorkbookToPDF,
  exportWorkbookToJSON,
  
  // Statistics
  getDashboardStats,
  getProcessingStats,
  getReportStats,
  
  // Preview
  getReportPreview,
  getTaxComputationSummary,
}

export default reportAPI