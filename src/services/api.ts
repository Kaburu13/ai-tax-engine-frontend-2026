// src/services/api.ts
import axios from 'axios'

/**
 * Axios instance
 * Make sure your Django is mounted at /api/v1/ (tax_engine_project/urls.py)
 * and Vite proxy forwards /api -> http://localhost:8000
 */
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: false,
})

export default api

// ----------------- Helpers & Shapes -----------------
export type Paginated<T> = {
  results: T[]
  count?: number
  next?: string | null
  previous?: string | null
}

export type Workbook = {
  id: string
  filename: string
  file_size_bytes?: number
  status?: 'uploaded' | 'processing' | 'processed' | 'failed'
  current_year?: number | null
  prior_year?: number | null
  total_sheets?: number
  classified_sheets?: number
  created_at?: string
  updated_at?: string
}

export type Sheet = {
  id: string
  workbook: string
  sheet_name: string
  sheet_index: number
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
  is_classified?: boolean
  created_at?: string
  updated_at?: string
}

// ----------------- Workbook API -----------------
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

  async listPaginated(): Promise<Paginated<Workbook>> {
    const res = await api.get<Paginated<Workbook>>('/workbooks/')
    // DRF routers return {results,...} when paginated; if not paginated, normalize
    const data: any = res.data
    if (Array.isArray(data)) {
      return { results: data }
    }
    return data
  },

  async list(): Promise<Workbook[]> {
    const pg = await workbookAPI.listPaginated()
    return pg.results
  },

  async get(id: string | number): Promise<Workbook> {
    const res = await api.get<Workbook>(`/workbooks/${id}/`)
    return res.data
  },

  async getSheets(id: string | number): Promise<Sheet[]> {
    const res = await api.get<Sheet[] | Paginated<Sheet>>(`/workbooks/${id}/sheets/`)
    const data: any = res.data
    return Array.isArray(data) ? data : (data.results ?? [])
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(`/workbooks/${id}/`)
  },
}

// ----------------- Sheet API -----------------
export const sheetAPI = {
  async patch(
    id: number,
    payload: Partial<Pick<
      Sheet,
      'classification_type' | 'classification_display' | 'classification_meta' | 'is_classified'
    >>
  ): Promise<Sheet> {
    const res = await api.patch<Sheet>(`/workbooks/sheets/${id}/`, payload)
    return res.data
  },
}

// ----------------- Backwards-compat shim -----------------
/**
 * If older code imports `workbookAPI` from this file exactly as your shim did,
 * these exports keep that working.
 */
export const legacy = {
  workbookAPI: {
    upload: workbookAPI.upload,
    list: workbookAPI.list,
    getById: workbookAPI.get,
    getSheets: (workbookId: string) => workbookAPI.getSheets(workbookId),
    // placeholder to avoid runtime errors if someone calls it
    downloadReport: async (_id: string) => {
      throw new Error('downloadReport not implemented.')
    },
  },
}
