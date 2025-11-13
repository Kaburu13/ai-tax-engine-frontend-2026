// src/hooks/use_workbooks.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { workbookAPI } from '@/api'
import { getErrorMessage } from '@/api/axios_client'
import type {
  Workbook,
  WorkbookListParams,
  WorkbookCreateRequest,
  WorkbookUpdateRequest,
  PaginatedResponse,
  Sheet,
  UploadProgressCallback,
} from '@/api/types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const workbookKeys = {
  all: ['workbooks'] as const,
  lists: () => [...workbookKeys.all, 'list'] as const,
  list: (params?: WorkbookListParams) => [...workbookKeys.lists(), params] as const,
  details: () => [...workbookKeys.all, 'detail'] as const,
  detail: (id: number) => [...workbookKeys.details(), id] as const,
  sheets: (id: number) => [...workbookKeys.detail(id), 'sheets'] as const,
  stats: (id: number) => [...workbookKeys.detail(id), 'stats'] as const,
  recent: () => [...workbookKeys.all, 'recent'] as const,
  search: (query: string) => [...workbookKeys.all, 'search', query] as const,
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get list of workbooks with optional filtering and pagination
 */
export function useWorkbooks(
  params?: WorkbookListParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<Workbook>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workbookKeys.list(params),
    queryFn: () => workbookAPI.getWorkbooks(params),
    staleTime: 30000, // 30 seconds
    ...options,
  })
}

/**
 * Get a single workbook by ID
 */
export function useWorkbook(
  id: number | undefined,
  options?: Omit<UseQueryOptions<Workbook>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workbookKeys.detail(id!),
    queryFn: () => workbookAPI.getWorkbook(id!),
    enabled: id !== undefined,
    staleTime: 30000,
    ...options,
  })
}

/**
 * Get recent workbooks
 */
export function useRecentWorkbooks(
  limit: number = 10,
  options?: Omit<UseQueryOptions<Workbook[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workbookKeys.recent(),
    queryFn: () => workbookAPI.getRecentWorkbooks(limit),
    staleTime: 60000, // 1 minute
    ...options,
  })
}

/**
 * Search workbooks
 */
export function useSearchWorkbooks(
  query: string,
  options?: Omit<UseQueryOptions<Workbook[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workbookKeys.search(query),
    queryFn: () => workbookAPI.searchWorkbooks(query),
    enabled: query.length > 0,
    staleTime: 30000,
    ...options,
  })
}

/**
 * Get sheets for a workbook
 */
export function useWorkbookSheets(
  workbookId: number | undefined,
  options?: Omit<UseQueryOptions<Sheet[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workbookKeys.sheets(workbookId!),
    queryFn: () => workbookAPI.getWorkbookSheets(workbookId!),
    enabled: workbookId !== undefined,
    staleTime: 30000,
    ...options,
  })
}

/**
 * Get workbook statistics
 */
export function useWorkbookStats(
  workbookId: number | undefined,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workbookKeys.stats(workbookId!),
    queryFn: () => workbookAPI.getWorkbookStats(workbookId!),
    enabled: workbookId !== undefined,
    staleTime: 60000,
    ...options,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Upload a new workbook
 */
export function useUploadWorkbook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      onProgress,
    }: {
      data: WorkbookCreateRequest
      onProgress?: UploadProgressCallback
    }) => workbookAPI.uploadWorkbook(data, onProgress),
    onSuccess: (newWorkbook) => {
      // Invalidate workbook lists to refetch
      queryClient.invalidateQueries({ queryKey: workbookKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workbookKeys.recent() })
      
      // Add new workbook to cache
      queryClient.setQueryData(workbookKeys.detail(newWorkbook.id), newWorkbook)
    },
  })
}

/**
 * Update workbook metadata
 */
export function useUpdateWorkbook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkbookUpdateRequest }) =>
      workbookAPI.updateWorkbook(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: workbookKeys.detail(id) })

      // Snapshot previous value
      const previousWorkbook = queryClient.getQueryData<Workbook>(workbookKeys.detail(id))

      // Optimistically update
      if (previousWorkbook) {
        queryClient.setQueryData<Workbook>(workbookKeys.detail(id), {
          ...previousWorkbook,
          ...data,
        })
      }

      return { previousWorkbook }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousWorkbook) {
        queryClient.setQueryData(workbookKeys.detail(id), context.previousWorkbook)
      }
    },
    onSuccess: (updatedWorkbook) => {
      // Update cache with server data
      queryClient.setQueryData(workbookKeys.detail(updatedWorkbook.id), updatedWorkbook)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: workbookKeys.lists() })
    },
  })
}

/**
 * Delete a workbook
 */
export function useDeleteWorkbook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => workbookAPI.deleteWorkbook(id),
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: workbookKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: workbookKeys.lists() })

      // Snapshot
      const previousWorkbook = queryClient.getQueryData<Workbook>(workbookKeys.detail(id))
      const previousLists = queryClient.getQueriesData({ queryKey: workbookKeys.lists() })

      // Optimistically remove from lists
      queryClient.setQueriesData<PaginatedResponse<Workbook>>(
        { queryKey: workbookKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((wb) => wb.id !== id),
            count: old.count - 1,
          }
        }
      )

      return { previousWorkbook, previousLists }
    },
    onError: (err, id, context) => {
      // Rollback
      if (context?.previousWorkbook) {
        queryClient.setQueryData(workbookKeys.detail(id), context.previousWorkbook)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workbookKeys.detail(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: workbookKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workbookKeys.recent() })
    },
  })
}

/**
 * Bulk delete workbooks
 */
export function useBulkDeleteWorkbooks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => workbookAPI.bulkDeleteWorkbooks(ids),
    onSuccess: (_, ids) => {
      // Remove from cache
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: workbookKeys.detail(id) })
      })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: workbookKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workbookKeys.recent() })
    },
  })
}

/**
 * Check year continuity
 */
export function useCheckYearContinuity(workbookId: number) {
  return useQuery({
    queryKey: [...workbookKeys.detail(workbookId), 'continuity'],
    queryFn: () => workbookAPI.checkYearContinuity(workbookId),
    enabled: workbookId !== undefined,
    staleTime: 0, // Always fresh
  })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get error message from mutation error
 */
export function useWorkbookError(error: unknown): string | null {
  if (!error) return null
  return getErrorMessage(error)
}

/**
 * Prefetch workbook data
 */
export function usePrefetchWorkbook() {
  const queryClient = useQueryClient()

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: workbookKeys.detail(id),
      queryFn: () => workbookAPI.getWorkbook(id),
      staleTime: 30000,
    })
  }
}

/**
 * Prefetch workbook sheets
 */
export function usePrefetchWorkbookSheets() {
  const queryClient = useQueryClient()

  return (workbookId: number) => {
    queryClient.prefetchQuery({
      queryKey: workbookKeys.sheets(workbookId),
      queryFn: () => workbookAPI.getWorkbookSheets(workbookId),
      staleTime: 30000,
    })
  }
}