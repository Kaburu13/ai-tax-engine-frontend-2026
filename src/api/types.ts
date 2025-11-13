// src/api/types.ts
// API Type Definitions
// This file contains all TypeScript types for API requests and responses

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface APIError {
  detail?: string
  message?: string
  errors?: Record<string, string[]>
  non_field_errors?: string[]
}

// ============================================================================
// WORKBOOK TYPES
// ============================================================================

export interface Workbook {
  id: number
  file_name: string
  file_path: string
  file_size: number
  uploaded_at: string
  client_name: string
  period: string
  status: WorkbookStatus
  current_year: number | null
  prior_year: number | null
  sector: string | null
  total_sheets: number
  processed_sheets: number
  error_message: string | null
  processing_started_at: string | null
  processing_completed_at: string | null
  processing_duration: number | null
}

export type WorkbookStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export interface WorkbookCreateRequest {
  file: File
  client_name?: string
  period?: string
}

export interface WorkbookUpdateRequest {
  client_name?: string
  period?: string
  sector?: string
}

export interface WorkbookListParams {
  page?: number
  page_size?: number
  status?: WorkbookStatus
  client_name?: string
  period?: string
  ordering?: string
}

// ============================================================================
// SHEET TYPES
// ============================================================================

export interface Sheet {
  id: number
  workbook: number
  sheet_name: string
  sheet_type: SheetType | null
  sheet_index: number
  row_count: number
  column_count: number
  has_data: boolean
  year: number | null
  is_prior_year: boolean
  linked_current_sheet: number | null
  detection_confidence: number
  processed: boolean
  error_message: string | null
}

export type SheetType =
  | 'tax_computation'
  | 'trial_balance'
  | 'trial_balance_py'
  | 'provision'
  | 'investment_allowance'
  | 'capital_allowance'
  | 'deferred_tax'
  | 'adjustments'
  | 'notes'
  | 'other'

export interface SheetListParams {
  workbook?: number
  sheet_type?: SheetType
  is_prior_year?: boolean
  processed?: boolean
}

// ============================================================================
// PROCESSING TYPES
// ============================================================================

export interface ProcessingStatus {
  workbook_id: number
  status: WorkbookStatus
  progress: number
  current_step: string
  total_steps: number
  completed_steps: number
  started_at: string | null
  completed_at: string | null
  duration: number | null
  error_message: string | null
}

export interface ProcessingLog {
  id: number
  workbook: number
  timestamp: string
  level: LogLevel
  step: string
  message: string
  details: Record<string, any> | null
}

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'

export interface ProcessWorkbookRequest {
  mode?: 'validation' | 'generation'
  force_reprocess?: boolean
}

export interface ProcessingLogParams {
  workbook?: number
  level?: LogLevel
  step?: string
  page?: number
  page_size?: number
}

// ============================================================================
// TAX COMPUTATION TYPES
// ============================================================================

export interface TaxComputation {
  id: number
  workbook: number
  year: number
  accounting_profit: number
  tax_adjustments: number
  taxable_income: number
  tax_rate: number
  tax_payable: number
  provisional_tax_paid: number
  balance_due: number
  effective_tax_rate: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Provision {
  id: number
  tax_computation: number
  description: string
  current_year: number
  prior_year: number
  movement: number
  tax_effect: number
  notes: string | null
}

export interface InvestmentAllowance {
  id: number
  tax_computation: number
  asset_description: string
  cost: number
  allowance_rate: number
  allowance_amount: number
  category: string
  notes: string | null
}

export interface DeferredTax {
  id: number
  tax_computation: number
  description: string
  temporary_difference: number
  tax_rate: number
  deferred_tax_amount: number
  movement: number
  category: 'asset' | 'liability'
  notes: string | null
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface Report {
  id: number
  workbook: number
  report_type: ReportType
  file_path: string
  file_size: number
  generated_at: string
  download_url: string
}

export type ReportType =
  | 'full_computation'
  | 'summary'
  | 'provisions'
  | 'investment_allowance'
  | 'deferred_tax'

export interface GenerateReportRequest {
  workbook_id: number
  report_type: ReportType
  include_notes?: boolean
  include_workings?: boolean
}

export interface DownloadReportParams {
  report_id: number
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface DashboardStats {
  total_workbooks: number
  pending_workbooks: number
  processing_workbooks: number
  completed_workbooks: number
  failed_workbooks: number
  total_processed_sheets: number
  average_processing_time: number
  recent_uploads: Workbook[]
  processing_queue: ProcessingStatus[]
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type UploadProgressCallback = (progress: UploadProgress) => void

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  is_valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}