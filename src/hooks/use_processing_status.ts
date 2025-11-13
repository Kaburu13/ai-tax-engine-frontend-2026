// src/hooks/use_processing_status.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { processingAPI } from '@/api'
import { getErrorMessage } from '@/api/axios_client'
import type {
  ProcessingStatus,
  ProcessingLog,
  ProcessWorkbookRequest,
  PaginatedResponse,
  ProcessingLogParams,
} from '@/api/types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const processingKeys = {
  all: ['processing'] as const,
  status: (workbookId: number) => [...processingKeys.all, 'status', workbookId] as const,
  logs: (workbookId: number, params?: ProcessingLogParams) =>
    [...processingKeys.all, 'logs', workbookId, params] as const,
  latestLogs: (workbookId: number) =>
    [...processingKeys.all, 'logs', workbookId, 'latest'] as const,
  queue: () => [...processingKeys.all, 'queue'] as const,
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get processing status for a workbook
 */
export function useProcessingStatus(
  workbookId: number | undefined,
  options?: Omit<UseQueryOptions<ProcessingStatus>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: processingKeys.status(workbookId!),
    queryFn: () => processingAPI.getProcessingStatus(workbookId!),
    enabled: workbookId !== undefined,
    refetchInterval: (query) => {
      // Auto-refetch while processing
      const data = query.state.data
      if (data?.status === 'processing') {
        return 2000 // Poll every 2 seconds
      }
      return false // Don't refetch if not processing
    },
    staleTime: 0, // Always fresh for processing status
    ...options,
  })
}

/**
 * Get processing logs for a workbook
 */
export function useProcessingLogs(
  workbookId: number | undefined,
  params?: ProcessingLogParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<ProcessingLog>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: processingKeys.logs(workbookId!, params),
    queryFn: () => processingAPI.getProcessingLogs(workbookId!, params),
    enabled: workbookId !== undefined,
    staleTime: 5000, // 5 seconds
    ...options,
  })
}

/**
 * Get latest processing logs
 * Note: For real-time logs, use useProcessingLogStream instead
 */
export function useLatestLogs(
  workbookId: number | undefined,
  limit: number = 50,
  options?: Omit<UseQueryOptions<ProcessingLog[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: processingKeys.latestLogs(workbookId!),
    queryFn: () => processingAPI.getLatestLogs(workbookId!, limit),
    enabled: workbookId !== undefined,
    staleTime: 5000,
    // Logs can be manually refetched when needed
    // For real-time updates, use useProcessingLogStream
    ...options,
  })
}

/**
 * Get latest processing logs with auto-refresh while processing
 */
export function useLatestLogsWithAutoRefresh(
  workbookId: number | undefined,
  limit: number = 50,
  isProcessing: boolean = false
) {
  return useQuery({
    queryKey: processingKeys.latestLogs(workbookId!),
    queryFn: () => processingAPI.getLatestLogs(workbookId!, limit),
    enabled: workbookId !== undefined,
    staleTime: 5000,
    refetchInterval: isProcessing ? 3000 : false, // Poll every 3 seconds if processing
  })
}

/**
 * Get processing queue
 */
export function useProcessingQueue(
  options?: Omit<UseQueryOptions<ProcessingStatus[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: processingKeys.queue(),
    queryFn: () => processingAPI.getProcessingQueue(),
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0,
    ...options,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Start processing a workbook
 */
export function useStartProcessing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workbookId,
      request,
    }: {
      workbookId: number
      request?: ProcessWorkbookRequest
    }) => processingAPI.startProcessing(workbookId, request),
    onSuccess: (status, { workbookId }) => {
      // Update status in cache
      queryClient.setQueryData(processingKeys.status(workbookId), status)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: processingKeys.queue() })
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'detail', workbookId] })
    },
  })
}

/**
 * Stop processing a workbook
 */
export function useStopProcessing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workbookId: number) => processingAPI.stopProcessing(workbookId),
    onSuccess: (_, workbookId) => {
      // Invalidate status to refetch
      queryClient.invalidateQueries({ queryKey: processingKeys.status(workbookId) })
      queryClient.invalidateQueries({ queryKey: processingKeys.queue() })
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'detail', workbookId] })
    },
  })
}

/**
 * Retry processing a failed workbook
 */
export function useRetryProcessing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workbookId: number) => processingAPI.retryProcessing(workbookId),
    onSuccess: (status, workbookId) => {
      // Update status in cache
      queryClient.setQueryData(processingKeys.status(workbookId), status)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: processingKeys.queue() })
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'detail', workbookId] })
    },
  })
}

// ============================================================================
// ADVANCED HOOKS
// ============================================================================

/**
 * Poll processing status with callbacks
 */
export function useProcessingPoll(
  workbookId: number | undefined,
  onStatusChange?: (status: ProcessingStatus) => void
) {
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startPolling = useCallback(async () => {
    if (!workbookId) return

    setIsPolling(true)
    setError(null)

    try {
      await processingAPI.pollProcessingStatus(
        workbookId,
        (status) => {
          if (onStatusChange) {
            onStatusChange(status)
          }
        },
        2000, // Poll every 2 seconds
        150 // Max 5 minutes
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsPolling(false)
    }
  }, [workbookId, onStatusChange])

  return {
    isPolling,
    error,
    startPolling,
  }
}

/**
 * Stream processing logs in real-time using SSE
 */
export function useProcessingLogStream(workbookId: number | undefined) {
  const [logs, setLogs] = useState<ProcessingLog[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workbookId) return

    setIsStreaming(true)
    setError(null)

    const cleanup = processingAPI.streamProcessingLogs(
      workbookId,
      (log) => {
        setLogs((prev) => [...prev, log])
      },
      (err) => {
        setError(err.message)
        setIsStreaming(false)
      }
    )

    return () => {
      cleanup()
      setIsStreaming(false)
    }
  }, [workbookId])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    isStreaming,
    error,
    clearLogs,
  }
}

/**
 * Monitor processing with automatic status updates
 */
export function useProcessingMonitor(workbookId: number | undefined) {
  const { data: status, isLoading } = useProcessingStatus(workbookId)
  const isProcessing = status?.status === 'processing'
  
  // Use auto-refresh logs when processing
  const { data: latestLogs } = useLatestLogsWithAutoRefresh(
    workbookId,
    10,
    isProcessing
  )

  const isCompleted = status?.status === 'completed'
  const isFailed = status?.status === 'failed'
  const isPending = status?.status === 'pending'

  const progress = status?.progress || 0
  const currentStep = status?.current_step || ''
  const errorMessage = status?.error_message || null

  return {
    status,
    latestLogs,
    isLoading,
    isProcessing,
    isCompleted,
    isFailed,
    isPending,
    progress,
    currentStep,
    errorMessage,
  }
}

/**
 * Batch processing status for multiple workbooks
 */
export function useBatchProcessingStatus(workbookIds: number[]) {
  return useQuery({
    queryKey: [...processingKeys.all, 'batch', workbookIds],
    queryFn: () => processingAPI.getBatchProcessingStatus(workbookIds),
    enabled: workbookIds.length > 0,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0,
  })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get processing error message
 */
export function useProcessingError(error: unknown): string | null {
  if (!error) return null
  return getErrorMessage(error)
}

/**
 * Check if workbook is currently processing
 */
export function useIsProcessing(workbookId: number | undefined): boolean {
  const { data: status } = useProcessingStatus(workbookId, {
    enabled: workbookId !== undefined,
  })
  return status?.status === 'processing'
}

/**
 * Get processing progress percentage
 */
export function useProcessingProgress(workbookId: number | undefined): number {
  const { data: status } = useProcessingStatus(workbookId, {
    enabled: workbookId !== undefined,
  })
  return status?.progress || 0
}

/**
 * Get queue position for a workbook
 */
export function useQueuePosition(workbookId: number | undefined) {
  return useQuery({
    queryKey: [...processingKeys.status(workbookId!), 'queue-position'],
    queryFn: () => processingAPI.getQueuePosition(workbookId!),
    enabled: workbookId !== undefined,
    refetchInterval: 5000,
    staleTime: 0,
  })
}