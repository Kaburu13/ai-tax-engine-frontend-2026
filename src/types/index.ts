/**
 * AI Tax Computation Engine - TypeScript Types
 * Complete type definitions for frontend
 * PRODUCTION-READY - NO ERRORS
 */
// src/types/index.ts
// ============================================================================
// WORKBOOK TYPES
// ============================================================================

export type WorkbookStatus =
  | 'pending'
  | 'uploading'
  | 'uploaded'
  | 'classifying'
  | 'classified'
  | 'processing'
  | 'completed'
  | 'failed';

export type ProcessingMode = 'validation' | 'generation';

export interface Workbook {
  // Primary fields
  id: string;

  // File information
  file: string;
  original_filename: string;
  file_size: number;

  // Processing information
  status: WorkbookStatus;
  mode: ProcessingMode | null;

  // Counts
  sheets_count: number;
  classified_sheets_count: number;

  // Tax years
  current_tax_year: number | null;
  prior_tax_year: number | null;

  // Company information
  company_name: string | null;
  company_pin: string | null;

  // Processing details
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;

  // Computed fields
  processing_duration: number | null;
  is_processing: boolean;
  has_current_year_data: boolean;
  has_prior_year_data: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Related data (only in detail view)
  sheets?: Sheet[];
}

export interface WorkbookList {
  // Basic workbook info for list view
  id: string;
  original_filename: string;
  file_size: number;
  status: WorkbookStatus;
  mode: ProcessingMode | null;
  sheets_count: number;
  classified_sheets_count: number;
  company_name: string | null;
  company_pin: string | null;
  current_tax_year: number | null;
  prior_tax_year: number | null;
  processing_duration: number | null;
  is_processing: boolean;
  created_at: string;
  updated_at: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
}

// ============================================================================
// SHEET TYPES
// ============================================================================

export type ClassificationType =
  | 'trial_balance'
  | 'tax_computation'
  | 'investment_allowances'
  | 'provisions'
  | 'deferred_tax'
  | 'proof_of_tax'
  | 'depreciation_recon'
  | 'excess_pension'
  | 'unclassified';

export type YearType = 'current' | 'prior' | 'unknown';

export interface Sheet {
  // Primary fields
  id: string;
  workbook: string;

  // Sheet information
  sheet_name: string;
  sheet_index: number;

  // Classification
  classification_type: ClassificationType | null;
  classification_confidence: number;
  classification_method: string | null;
  classification_display: string;
  confidence_percentage: number;
  is_classified: boolean;

  // Year detection
  year_type: YearType;
  detected_year: number | null;

  // Sheet analysis
  row_count: number;
  column_count: number;
  has_formulas: boolean;
  has_data: boolean;

  // Data extraction
  extracted_data: Record<string, any> | null;

  // Processing
  is_processed: boolean;
  processing_error: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SheetList {
  // Lightweight sheet info for lists
  id: string;
  sheet_name: string;
  sheet_index: number;
  classification_type: ClassificationType | null;
  classification_display: string;
  confidence_percentage: number;
  year_type: YearType;
  detected_year: number | null;
  is_processed: boolean;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadRequest {
  file: File;
}

// ==== UPLOAD TYPES (replace/ensure these exist) ====
export interface UploadResponse {
  id: string;
  original_filename: string;
  status: WorkbookStatus;
  created_at: string;
}
// ============================================================================
// PROCESSING TYPES
// ============================================================================

export interface ProcessingQueue {
  count: number;
  workbooks: WorkbookList[];
}

export interface WorkbookStats {
  // Counts
  total_workbooks: number;
  processing_workbooks: number;
  completed_workbooks: number;
  failed_workbooks: number;
  total_sheets: number;
  classified_sheets: number;
  average_processing_time: number;

  // Breakdowns
  classification_breakdown: Record<ClassificationType, number>;
  status_breakdown: Record<WorkbookStatus, number>;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiError {
  error: string;
  detail?: string;
  field_errors?: Record<string, string[]>;
}

export interface ApiSuccess {
  success: boolean;
  message: string;
}

export interface BulkDeleteRequest {
  workbook_ids: string[];
}

export interface BulkDeleteResponse {
  success: boolean;
  message: string;
  count: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  id: string;
}

export interface RetryResponse {
  // Returns updated workbook
  id: string;
  status: WorkbookStatus;
  error_message: string | null;
}

// ============================================================================
// QUERY PARAMS TYPES
// ============================================================================

export interface WorkbookListParams {
  status?: WorkbookStatus;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface SheetListParams {
  workbook?: string;
  classification?: ClassificationType;
  year_type?: YearType;
  page?: number;
  page_size?: number;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface UploadFormData {
  file: File | null;
}

export interface FilterFormData {
  status: WorkbookStatus | 'all';
  search: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface WorkbookCardProps {
  workbook: WorkbookList;
  onDelete?: (id: string) => void;
  onRetry?: (id: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
}

export interface SheetCardProps {
  sheet: SheetList;
}

export interface StatusBadgeProps {
  status: WorkbookStatus;
}

export interface ConfidenceBadgeProps {
  confidence: number;
}

export interface ProcessingStepsProps {
  currentStep: number;
  steps: ProcessingStep[];
}

export interface ProcessingStep {
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  status?: WorkbookStatus;
  search?: string;
  classification?: ClassificationType;
  year_type?: YearType;
}

// ============================================================================
// CLASSIFICATION DISPLAY TYPES
// ============================================================================

export const CLASSIFICATION_LABELS: Record<ClassificationType, string> = {
  trial_balance: 'Trial Balance',
  tax_computation: 'Tax Computation',
  investment_allowances: 'Investment Allowances',
  provisions: 'Provisions',
  deferred_tax: 'Deferred Tax',
  proof_of_tax: 'Proof of Tax',
  depreciation_recon: 'Depreciation Reconciliation',
  excess_pension: 'Excess Pension',
  unclassified: 'Unclassified',
};

export const STATUS_LABELS: Record<WorkbookStatus, string> = {
  pending: 'Pending',
  uploading: 'Uploading',
  uploaded: 'Uploaded',
  classifying: 'Classifying',
  classified: 'Classified',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export const STATUS_COLORS: Record<WorkbookStatus, string> = {
  pending: 'gray',
  uploading: 'blue',
  uploaded: 'blue',
  classifying: 'yellow',
  classified: 'green',
  processing: 'yellow',
  completed: 'green',
  failed: 'red',
};

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FileValidation {
  maxSize: number; // in bytes
  allowedExtensions: string[];
}

export const DEFAULT_FILE_VALIDATION: FileValidation = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedExtensions: ['.xlsx', '.xlsm'],
};

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseWorkbooksResult {
  workbooks: WorkbookList[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseWorkbookResult {
  workbook: Workbook | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Hook return type (replace your old UseUploadResult)
export interface UseUploadResult {
  upload: (file: File) => Promise<Workbook>;
  isUploading: boolean;
  error: string | null;
  progress: number;
  workbook: Workbook | null;
}

export interface UseDeleteResult {
  deleteWorkbook: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Main types already exported above
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isWorkbook(obj: any): obj is Workbook {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.original_filename === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isSheet(obj: any): obj is Sheet {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.sheet_name === 'string' &&
    typeof obj.sheet_index === 'number'
  );
}

export function isApiError(obj: any): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.error === 'string'
  );
}