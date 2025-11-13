// src/types/api.types.ts
// Fetch-based API with named exports AND a default `api` object.
// Compatible with old pages (api.utils.*) and new pages (named imports).

export const API_PREFIX = '/api/v1';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch {}
    throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ''}`);
  }
  return res.json() as Promise<T>;
}

/* ───────── Types ───────── */

export type UUID = string;

export interface Sheet {
  id: UUID;
  workbook: UUID;
  sheet_name: string;
  sheet_index: number;
  classification_type: string | null;
  classification_confidence: number; // 0..1
  classification_method: string | null;
  classification_display: string;
  confidence_percentage: number;     // 0..100 (derived in API/serializer)
  is_classified: boolean;
  year_type: 'current' | 'prior' | 'unknown' | 'current_year' | 'prior_year' | null;
  detected_year: number | null;
  row_count: number;
  column_count: number;
  has_formulas: boolean;
  has_data: boolean;
  extracted_data: any;
  classification_meta?: Record<string, any> | null;
  is_processed: boolean;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workbook {
  id: UUID;
  file?: string;
  original_filename: string;
  file_size: number;
  status:
    | 'pending'
    | 'uploading'
    | 'uploaded'
    | 'classifying'
    | 'classified'
    | 'processing'
    | 'completed'
    | 'failed';
  mode: 'validation' | 'generation' | null;
  sheets_count: number;
  classified_sheets_count: number;
  current_tax_year: number | null;
  prior_tax_year: number | null;
  company_name: string | null;
  company_pin: string | null;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  processing_duration: number | null;
  is_processing: boolean;
  has_current_year_data?: boolean;
  has_prior_year_data?: boolean;
  sheets?: Sheet[];
  created_at: string;
  updated_at: string;
}

export interface Paged<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Dashboard/tiles */
export interface WorkbookStats {
  total_workbooks: number;
  processing_workbooks: number;
  completed_workbooks: number;
  failed_workbooks: number;
  total_sheets: number;
  classified_sheets: number;
  average_processing_time: number;
  classification_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
}

/** Queue snapshot */
export interface ProcessingQueue {
  count: number;
  workbooks: Array<{
    id: UUID;
    original_filename: string;
    status: Workbook['status'];
    created_at: string;
  }>;
}

/* ───────── APIs ───────── */

export const workbookAPI = {
  async upload(file: File): Promise<Workbook> {
    const fd = new FormData();
    fd.append('file', file);
    return http<Workbook>(`${API_PREFIX}/workbooks/upload/`, { method: 'POST', body: fd });
  },
async process(id: UUID): Promise<{ success: boolean; workbook: Workbook }> {
  return http<{ success: boolean; workbook: Workbook }>(
    `${API_PREFIX}/workbooks/process/${id}/`,
    { method: 'POST' }
  );
},

  /** Non-paginated list when backend supports it */
  async list(params: URLSearchParams = new URLSearchParams()): Promise<Workbook[]> {
    const qs = params.toString();
    return http<Workbook[]>(`${API_PREFIX}/workbooks/${qs ? `?${qs}` : ''}`);
  },

  async listPaginated(
    params: URLSearchParams = new URLSearchParams()
  ): Promise<Paged<Workbook>> {
    const qs = params.toString();
    return http<Paged<Workbook>>(`${API_PREFIX}/workbooks/${qs ? `?${qs}` : ''}`);
  },

  async get(id: UUID): Promise<Workbook> {
    return http<Workbook>(`${API_PREFIX}/workbooks/${id}/`);
  },

  async retry(id: UUID): Promise<Workbook> {
    return http<Workbook>(`${API_PREFIX}/workbooks/${id}/retry/`, { method: 'POST' });
  },

  async delete(id: UUID): Promise<{ success: boolean; id: UUID; message?: string }> {
    return http<{ success: boolean; id: UUID; message?: string }>(
      `${API_PREFIX}/workbooks/${id}/delete/`,
      { method: 'DELETE' }
    );
  },

  async bulkDelete(workbook_ids: UUID[]): Promise<{ success: boolean; count: number }> {
    return http<{ success: boolean; count: number }>(
      `${API_PREFIX}/workbooks/bulk-delete/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workbook_ids }),
      }
    );
  },

  async getStats(): Promise<WorkbookStats> {
    return http<WorkbookStats>(`${API_PREFIX}/workbooks/stats/`);
  },

  async getProcessingQueue(): Promise<ProcessingQueue> {
    return http<ProcessingQueue>(`${API_PREFIX}/workbooks/processing-queue/`);
  },

  /** Blob download helper (if backend exposes /download/) */
  async downloadBlob(id: UUID): Promise<Blob> {
    const res = await fetch(`${API_PREFIX}/workbooks/${id}/download/`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.blob();
  },
};

export const sheetAPI = {
  /** Always return plain Sheet[] (normalize both array and {results}) */
  async getByWorkbook(workbookId: UUID): Promise<Sheet[]> {
    const url = `${API_PREFIX}/workbooks/sheets/?${new URLSearchParams({
      workbook: workbookId,
    }).toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      let detail = '';
      try { detail = JSON.stringify(await res.json()); } catch {}
      throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ''}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.results ?? []);
  },

  async get(id: UUID): Promise<Sheet> {
    return http<Sheet>(`${API_PREFIX}/workbooks/sheets/${id}/`);
  },

  async patch(
    id: UUID,
    body: Partial<
      Pick<Sheet, 'classification_type' | 'classification_meta' | 'year_type' | 'detected_year'>
    >
  ): Promise<void> {
    const res = await fetch(`${API_PREFIX}/workbooks/sheets/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let detail = '';
      try { detail = JSON.stringify(await res.json()); } catch {}
      throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ''}`);
    }
  },
};

/* ───────── Utilities (named + default.utils for back-compat) ───────── */

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const n = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
  return `${n} ${units[i]}`;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString();
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'N/A';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDate(iso);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'gray',
    uploading: 'blue',
    uploaded: 'blue',
    classifying: 'yellow',
    processing: 'purple',
    classified: 'green',
    completed: 'green',
    failed: 'red',
  };
  return map[status] ?? 'gray';
}

export function getConfidenceColor(conf: number): string {
  if (conf >= 80) return 'green';
  if (conf >= 60) return 'yellow';
  if (conf >= 40) return 'orange';
  return 'red';
}

export function getClassificationLabel(classificationType: string | null): string {
  if (!classificationType) return 'Not Classified';
  const labels: Record<string, string> = {
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
  return labels[classificationType] || classificationType;
}

/* ───────── Default (back-compat) ───────── */

const api = {
  workbooks: workbookAPI,
  sheets: sheetAPI,
  utils: {
    formatFileSize,
    formatDuration,
    formatDate,
    formatRelativeTime,
    getStatusColor,
    getConfidenceColor,
    getClassificationLabel,
  },
};

export default api;
