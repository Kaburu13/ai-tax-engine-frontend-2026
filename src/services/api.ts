// src/services/api.ts
import axios from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// Django mounted at /api/v1/ and Vite proxy forwards /api → http://localhost:8000
// ─────────────────────────────────────────────────────────────────────────────
// New: get sheets for a workbook with optional filters (the page currently filters client-side,
// but this is handy if you later want server-side filtering)
export async function getWorkbookSheetsFiltered(
  workbookId: string,
  params?: { year_type?: "current" | "prior" | "unknown"; classification?: string }
): Promise<Sheet[]> {
  const res = await api.get<Sheet[] | Paginated<Sheet>>(`/workbooks/sheets/`, {
    params: { workbook: workbookId, ...params },
  });
  const data: any = res.data;
  return Array.isArray(data) ? data : data.results ?? [];
}

// Optional: list reports if your app exposes them
export async function listReports(): Promise<any[]> {
  const res = await api.get<any>("/reports/");
  const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return data;
}

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: false,
})

export default api

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type Paginated<T> = {
  results: T[]
  count?: number
  next?: string | null
  previous?: string | null
}

export type WorkbookStatus =
  | 'uploaded'
  | 'uploading'
  | 'classifying'
  | 'classified'
  | 'processing'
  | 'completed'
  | 'failed'

export type Workbook = {
  id: string
  filename: string
  file_size_bytes?: number
  status?: WorkbookStatus
  company_name?: string | null
  company_pin?: string | null
  current_tax_year?: number | null
  prior_tax_year?: number | null
  total_sheets?: number
  classified_sheets?: number
  created_at?: string
  updated_at?: string
  error_message?: string | null
}

export type Sheet = {
  id: string
  workbook: string
  sheet_name: string
  sheet_index: number
  has_data?: boolean | null
  classification_type: string | null
  classification_display: string | null
  confidence_percentage: number | null
  year_type: 'current' | 'prior' | 'unknown' | null
  detected_year: number | null
  classification_meta?: {
    manual?: boolean
    reasons?: string[]
    [k: string]: any
  } | null
  is_processed?: boolean
  processing_error?: string | null
  created_at?: string
  updated_at?: string
}

// src/services/api.ts
export async function processWorkbook(workbookId: string) {
  const res = await fetch(`/api/v1/workbooks/${workbookId}/process/`, { method: 'POST' });
  if (!res.ok && res.status !== 207) throw new Error(await res.text()); // 200 or 207 are OK
  return res.json();
}

// Optional report row if the reports app is installed
export type Report = {
  id: string
  workbook: string
  title: string
  file: string // storage path
  url?: string | null // if backend returns a resolved URL
  created_at?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Centralized UI choices (keep in sync with backend)
// ─────────────────────────────────────────────────────────────────────────────
export const CLASSIFICATION_OPTIONS: { value: string; label: string }[] = [
  { value: 'trial_balance',         label: 'Trial Balance' },
  { value: 'tax_computation',       label: 'Tax Computation' },
  { value: 'investment_allowances', label: 'Investment Allowances' },
  { value: 'deferred_tax',          label: 'Deferred Tax' },
  { value: 'provisions',            label: 'Provisions' },
  { value: 'proof_of_tax',          label: 'Proof of Tax' },
  { value: 'depreciation_recon',    label: 'Depreciation Recon' },
  { value: 'excess_pension',        label: 'Excess Pension' },
  { value: 'unclassified',          label: 'Unclassified' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Workbook API
// ─────────────────────────────────────────────────────────────────────────────
export const workbookAPI = {
  async upload(file: File, currentYear?: number | null): Promise<Workbook> {
    const fd = new FormData()
    fd.append('file', file)
    if (currentYear != null) fd.append('current_year', String(currentYear))
    const res = await api.post<Workbook>('/workbooks/upload/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async listPaginated(params?: Record<string, any>): Promise<Paginated<Workbook>> {
    const res = await api.get<Paginated<Workbook>>('/workbooks/', { params })
    const data: any = res.data
    if (Array.isArray(data)) return { results: data }
    return data
  },

  async list(params?: Record<string, any>): Promise<Workbook[]> {
    const pg = await workbookAPI.listPaginated(params)
    return pg.results
  },

  async get(id: string): Promise<Workbook> {
    const res = await api.get<Workbook>(`/workbooks/${id}/`)
    return res.data
  },

  // NOTE: correct endpoint is the list with a query param, not /{id}/sheets/
  async getSheets(workbookId: string): Promise<Sheet[]> {
    const res = await api.get<Sheet[] | Paginated<Sheet>>('/workbooks/sheets/', {
      params: { workbook: workbookId },
    })
    const data: any = res.data
    return Array.isArray(data) ? data : (data.results ?? [])
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workbooks/${id}/`)
  },

  // Start processing this workbook (returns 200 or 207 on partial)
  async process(id: string): Promise<any> {
    const res = await api.post(`/workbooks/${id}/process/`, {})
    return res.data
  },

  // Processing queue (for the /processing screen)
  async processingQueue(): Promise<{ count: number; workbooks: Workbook[] }> {
    const res = await api.get<{ count: number; workbooks: Workbook[] }>(
      '/workbooks/processing-queue/'
    )
    return res.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Sheet API
// ─────────────────────────────────────────────────────────────────────────────
export const sheetAPI = {
  // Classification (reclassify control)
  async updateClassification(id: string, classification_type: string): Promise<Sheet> {
    const res = await api.patch<Sheet>(`/workbooks/sheets/${id}/`, { classification_type })
    return res.data
  },

  // Generic patch if you need other fields
  async patch(
    id: string,
    payload: Partial<
      Pick<
        Sheet,
        'classification_type' | 'classification_display' | 'classification_meta' | 'is_processed'
      >
    >
  ): Promise<Sheet> {
    const res = await api.patch<Sheet>(`/workbooks/sheets/${id}/`, payload)
    return res.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Reports API (optional, if you enabled the reports app/views)
// ─────────────────────────────────────────────────────────────────────────────
export const reportsAPI = {
  async list(): Promise<Report[]> {
    const res = await api.get<Report[]>('/reports/')
    return res.data
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Backwards-compat shim (legacy imports from older code paths)
// ─────────────────────────────────────────────────────────────────────────────
export const legacy = {
  workbookAPI: {
    upload: workbookAPI.upload,
    list: workbookAPI.list,
    getById: workbookAPI.get,
    getSheets: (workbookId: string) => workbookAPI.getSheets(workbookId),
    downloadReport: async (_id: string) => {
      throw new Error('downloadReport not implemented.')
    },
  },
}
