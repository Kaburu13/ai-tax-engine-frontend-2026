// src/hooks/use_upload.ts
import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workbookAPI } from '@/api'
import { getErrorMessage, isNetworkError } from '@/api/axios_client'
import type { Workbook, WorkbookCreateRequest, UploadProgress } from '@/api/types'

// ============================================================================
// TYPES
// ============================================================================

interface UploadState {
  isUploading: boolean
  progress: number
  uploadedBytes: number
  totalBytes: number
  error: string | null
  workbook: Workbook | null
}

interface UseUploadOptions {
  onSuccess?: (workbook: Workbook) => void
  onError?: (error: string) => void
  onProgress?: (progress: UploadProgress) => void
  autoStartProcessing?: boolean
}

// ============================================================================
// MAIN UPLOAD HOOK
// ============================================================================

/**
 * Hook for uploading workbooks with progress tracking
 */
export function useUpload(options?: UseUploadOptions) {
  const queryClient = useQueryClient()

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    error: null,
    workbook: null,
  })

  const uploadMutation = useMutation({
    mutationFn: async (data: WorkbookCreateRequest) => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }))

      const workbook = await workbookAPI.uploadWorkbook(data, (progress) => {
        setUploadState((prev) => ({
          ...prev,
          progress: progress.percentage,
          uploadedBytes: progress.loaded,
          totalBytes: progress.total,
        }))

        if (options?.onProgress) {
          options.onProgress(progress)
        }
      })

      return workbook
    },
    onSuccess: (workbook) => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 100,
        workbook,
      }))

      // Invalidate workbook queries
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'recent'] })

      if (options?.onSuccess) {
        options.onSuccess(workbook)
      }
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }))

      if (options?.onError) {
        options.onError(errorMessage)
      }
    },
  })

  const upload = useCallback(
    (data: WorkbookCreateRequest) => {
      uploadMutation.mutate(data)
    },
    [uploadMutation]
  )

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      uploadedBytes: 0,
      totalBytes: 0,
      error: null,
      workbook: null,
    })
  }, [])

  return {
    upload,
    reset,
    ...uploadState,
    isSuccess: uploadMutation.isSuccess,
  }
}

// ============================================================================
// FILE VALIDATION HOOK
// ============================================================================

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate file before upload
 */
export function useFileValidation() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const validate = useCallback((file: File): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ]

    if (!allowedTypes.includes(file.type)) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!['xlsx', 'xls'].includes(extension || '')) {
        errors.push('Invalid file type. Please upload an Excel file (.xlsx or .xls)')
      }
    }

    // Check file size (max 50MB)
    const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '52428800', 10)
    if (file.size > maxSize) {
      errors.push(
        `File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`
      )
    }

    // Check minimum file size (1KB)
    if (file.size < 1024) {
      errors.push('File is too small. Please upload a valid workbook')
    }

    // Warnings
    if (file.size > 10 * 1024 * 1024) {
      // > 10MB
      warnings.push('Large file detected. Upload may take a while')
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
    }

    setValidationResult(result)
    return result
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  return {
    validate,
    validationResult,
    clearValidation,
  }
}

// ============================================================================
// MULTIPLE FILE UPLOAD HOOK
// ============================================================================

interface MultipleUploadState {
  files: Array<{
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'failed'
    workbook?: Workbook
    error?: string
  }>
  overallProgress: number
  isUploading: boolean
  completedCount: number
  failedCount: number
}

/**
 * Hook for uploading multiple workbooks
 */
export function useMultipleUpload() {
  const queryClient = useQueryClient()

  const [state, setState] = useState<MultipleUploadState>({
    files: [],
    overallProgress: 0,
    isUploading: false,
    completedCount: 0,
    failedCount: 0,
  })

  const uploadMultiple = useCallback(
    async (files: File[], clientName?: string) => {
      setState({
        files: files.map((file) => ({
          file,
          progress: 0,
          status: 'pending',
        })),
        overallProgress: 0,
        isUploading: true,
        completedCount: 0,
        failedCount: 0,
      })

      let completed = 0
      let failed = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update file status to uploading
        setState((prev) => ({
          ...prev,
          files: prev.files.map((f, idx) =>
            idx === i ? { ...f, status: 'uploading' as const } : f
          ),
        }))

        try {
          const workbook = await workbookAPI.uploadWorkbook(
            { file, client_name: clientName },
            (progress) => {
              // Update individual file progress
              setState((prev) => ({
                ...prev,
                files: prev.files.map((f, idx) =>
                  idx === i ? { ...f, progress: progress.percentage } : f
                ),
              }))
            }
          )

          completed++

          // Update file status to completed
          setState((prev) => ({
            ...prev,
            files: prev.files.map((f, idx) =>
              idx === i
                ? { ...f, status: 'completed' as const, workbook, progress: 100 }
                : f
            ),
            completedCount: completed,
            overallProgress: Math.round(((completed + failed) / files.length) * 100),
          }))
        } catch (error) {
          failed++

          // Update file status to failed
          setState((prev) => ({
            ...prev,
            files: prev.files.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: 'failed' as const,
                    error: getErrorMessage(error),
                  }
                : f
            ),
            failedCount: failed,
            overallProgress: Math.round(((completed + failed) / files.length) * 100),
          }))
        }
      }

      setState((prev) => ({
        ...prev,
        isUploading: false,
      }))

      // Invalidate queries after all uploads
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['workbooks', 'recent'] })
    },
    [queryClient]
  )

  const reset = useCallback(() => {
    setState({
      files: [],
      overallProgress: 0,
      isUploading: false,
      completedCount: 0,
      failedCount: 0,
    })
  }, [])

  return {
    uploadMultiple,
    reset,
    ...state,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Format upload progress for display
 */
export function useFormatProgress(progress: number): string {
  return `${Math.round(progress)}%`
}

/**
 * Format bytes for display
 */
export function useFormatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Calculate estimated time remaining
 */
export function useEstimatedTimeRemaining(
  uploadedBytes: number,
  totalBytes: number,
  startTime: number
): string {
  if (uploadedBytes === 0 || totalBytes === 0) return 'Calculating...'

  const elapsedTime = Date.now() - startTime
  const uploadSpeed = uploadedBytes / (elapsedTime / 1000) // bytes per second
  const remainingBytes = totalBytes - uploadedBytes
  const remainingSeconds = remainingBytes / uploadSpeed

  if (remainingSeconds < 60) {
    return `${Math.round(remainingSeconds)} seconds`
  } else if (remainingSeconds < 3600) {
    return `${Math.round(remainingSeconds / 60)} minutes`
  } else {
    return `${Math.round(remainingSeconds / 3600)} hours`
  }
}

/**
 * Check if error is due to network issues
 */
export function useIsNetworkError(error: unknown): boolean {
  return isNetworkError(error)
}

/**
 * Get user-friendly upload error message
 */
export function useUploadErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your internet connection and try again.'
  }

  const message = getErrorMessage(error)

  // Customize common error messages
  if (message.includes('timeout')) {
    return 'Upload timeout. The file may be too large or your connection is slow.'
  }

  if (message.includes('413') || message.includes('too large')) {
    return 'File is too large. Please upload a smaller file.'
  }

  if (message.includes('415') || message.includes('unsupported')) {
    return 'Unsupported file type. Please upload an Excel file (.xlsx or .xls).'
  }

  return message
}