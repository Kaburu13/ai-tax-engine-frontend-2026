// src/api/processing_api.ts
import axiosClient from './axios_client'
import type {
  ProcessingStatus,
  ProcessingLog,
  ProcessWorkbookRequest,
  ProcessingLogParams,
  PaginatedResponse,
  TaxComputation,
  Provision,
  InvestmentAllowance,
  DeferredTax,
} from './types'

// ============================================================================
// PROCESSING CONTROL ENDPOINTS
// ============================================================================

/**
 * Start processing a workbook
 */
export async function startProcessing(
  workbookId: number,
  request?: ProcessWorkbookRequest
): Promise<ProcessingStatus> {
  const response = await axiosClient.post<ProcessingStatus>(
    `/workbooks/${workbookId}/process/`,
    request || {}
  )
  return response.data
}

/**
 * Cancel/stop processing a workbook
 */
export async function stopProcessing(workbookId: number): Promise<void> {
  await axiosClient.post(`/workbooks/${workbookId}/stop-processing/`)
}

/**
 * Retry processing a failed workbook
 */
export async function retryProcessing(workbookId: number): Promise<ProcessingStatus> {
  const response = await axiosClient.post<ProcessingStatus>(
    `/workbooks/${workbookId}/retry-processing/`
  )
  return response.data
}

// ============================================================================
// PROCESSING STATUS ENDPOINTS
// ============================================================================

/**
 * Get processing status for a workbook
 */
export async function getProcessingStatus(workbookId: number): Promise<ProcessingStatus> {
  const response = await axiosClient.get<ProcessingStatus>(
    `/workbooks/${workbookId}/status/`
  )
  return response.data
}

/**
 * Get processing status for multiple workbooks
 */
export async function getBatchProcessingStatus(
  workbookIds: number[]
): Promise<ProcessingStatus[]> {
  const response = await axiosClient.post<ProcessingStatus[]>(
    '/processing/batch-status/',
    { workbook_ids: workbookIds }
  )
  return response.data
}

/**
 * Poll processing status (with automatic retry logic)
 */
export async function pollProcessingStatus(
  workbookId: number,
  onStatusChange?: (status: ProcessingStatus) => void,
  intervalMs: number = 2000,
  maxAttempts: number = 150 // 5 minutes max
): Promise<ProcessingStatus> {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getProcessingStatus(workbookId)
        
        if (onStatusChange) {
          onStatusChange(status)
        }

        // Stop polling if completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          resolve(status)
          return
        }

        // Continue polling if still processing
        if (status.status === 'processing' && attempts < maxAttempts) {
          attempts++
          setTimeout(poll, intervalMs)
        } else if (attempts >= maxAttempts) {
          reject(new Error('Polling timeout - processing took too long'))
        }
      } catch (error) {
        reject(error)
      }
    }

    poll()
  })
}

// ============================================================================
// PROCESSING LOGS ENDPOINTS
// ============================================================================

/**
 * Get processing logs for a workbook
 */
export async function getProcessingLogs(
  workbookId: number,
  params?: ProcessingLogParams
): Promise<PaginatedResponse<ProcessingLog>> {
  const response = await axiosClient.get<PaginatedResponse<ProcessingLog>>(
    `/workbooks/${workbookId}/logs/`,
    { params }
  )
  return response.data
}

/**
 * Get latest processing logs for a workbook
 */
export async function getLatestLogs(
  workbookId: number,
  limit: number = 50
): Promise<ProcessingLog[]> {
  const response = await axiosClient.get<ProcessingLog[]>(
    `/workbooks/${workbookId}/logs/latest/`,
    { params: { limit } }
  )
  return response.data
}

/**
 * Get processing logs by level (ERROR, WARNING, etc.)
 */
export async function getLogsByLevel(
  workbookId: number,
  level: string
): Promise<ProcessingLog[]> {
  const response = await axiosClient.get<ProcessingLog[]>(
    `/workbooks/${workbookId}/logs/`,
    { params: { level } }
  )
  return response.data
}

/**
 * Stream processing logs (Server-Sent Events)
 */
export function streamProcessingLogs(
  workbookId: number,
  onLog: (log: ProcessingLog) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(
    `${axiosClient.defaults.baseURL}/workbooks/${workbookId}/logs/stream/`
  )

  eventSource.onmessage = (event) => {
    try {
      const log = JSON.parse(event.data) as ProcessingLog
      onLog(log)
    } catch (error) {
      console.error('Failed to parse log:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('EventSource error:', error)
    if (onError) {
      onError(new Error('Log streaming connection error'))
    }
    eventSource.close()
  }

  // Return cleanup function
  return () => {
    eventSource.close()
  }
}

// ============================================================================
// TAX COMPUTATION ENDPOINTS
// ============================================================================

/**
 * Get tax computation for a workbook
 */
export async function getTaxComputation(workbookId: number): Promise<TaxComputation> {
  const response = await axiosClient.get<TaxComputation>(
    `/workbooks/${workbookId}/tax-computation/`
  )
  return response.data
}

/**
 * Get provisions for a tax computation
 */
export async function getProvisions(taxComputationId: number): Promise<Provision[]> {
  const response = await axiosClient.get<Provision[]>(
    `/tax-computations/${taxComputationId}/provisions/`
  )
  return response.data
}

/**
 * Get investment allowances for a tax computation
 */
export async function getInvestmentAllowances(
  taxComputationId: number
): Promise<InvestmentAllowance[]> {
  const response = await axiosClient.get<InvestmentAllowance[]>(
    `/tax-computations/${taxComputationId}/investment-allowances/`
  )
  return response.data
}

/**
 * Get deferred tax for a tax computation
 */
export async function getDeferredTax(
  taxComputationId: number
): Promise<DeferredTax[]> {
  const response = await axiosClient.get<DeferredTax[]>(
    `/tax-computations/${taxComputationId}/deferred-tax/`
  )
  return response.data
}

/**
 * Recalculate tax computation
 */
export async function recalculateTaxComputation(
  taxComputationId: number
): Promise<TaxComputation> {
  const response = await axiosClient.post<TaxComputation>(
    `/tax-computations/${taxComputationId}/recalculate/`
  )
  return response.data
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Get processing queue status
 */
export async function getProcessingQueue(): Promise<ProcessingStatus[]> {
  const response = await axiosClient.get<ProcessingStatus[]>('/processing/queue/')
  return response.data
}

/**
 * Get queue position for a workbook
 */
export async function getQueuePosition(workbookId: number): Promise<number> {
  const response = await axiosClient.get<{ position: number }>(
    `/workbooks/${workbookId}/queue-position/`
  )
  return response.data.position
}

// ============================================================================
// PROCESSING API OBJECT (for easier imports)
// ============================================================================

const processingAPI = {
  // Control
  startProcessing,
  stopProcessing,
  retryProcessing,
  
  // Status
  getProcessingStatus,
  getBatchProcessingStatus,
  pollProcessingStatus,
  getQueuePosition,
  getProcessingQueue,
  
  // Logs
  getProcessingLogs,
  getLatestLogs,
  getLogsByLevel,
  streamProcessingLogs,
  
  // Tax computation
  getTaxComputation,
  getProvisions,
  getInvestmentAllowances,
  getDeferredTax,
  recalculateTaxComputation,
}

export default processingAPI