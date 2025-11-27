// Fetch-based API with named exports AND a default `api` object.
// – Includes processing endpoints (workbook + per-sheet) and queue.
// – Safe error handling (throws Error with status text).

export const API_PREFIX = '/api/v1';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    // credentials: 'include', // uncomment if you rely on Django CSRF/session cookies
    ...init,
  });
  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch {}
    throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ''}`);
  }
  // Some endpoints may return 202 with empty body; guard that:
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

/* ───────── Types ───────── */

export type UUID = string;

export interface Sheet {
  id: UUID;
  workbook: UUID;
  sheet_name: string;
  sheet_index: number;
  classification_type: string | null;
  classification_confidence: number;         // 0..100 expected from API
  classification_method: string | null;
  classification_display: string;            // server-provided pretty label
  confidence_percentage: number;             // optional compatibility field
  is_classified: boolean;
  year_type: 'current'|'prior'|'unknown';
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
  status: 'pending'|'uploading'|'uploaded'|'classifying'|'classified'|'processing'|'completed'|'failed';
  mode: 'validation'|'generation'|null;
  sheets_count: number;
  classified_sheets_count: number;
  current_tax_year: number | null;
  prior_tax_year: number | null;
  company_name: string | null;
  company_pin: string | null;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  processing_duration: number | null;      // read-only; set by server
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

export interface QueueItem {
  id: UUID;
  original_filename: string;
  status: Workbook['status'];
  created_at: string;
}

/* ───────── APIs ───────── */

export const workbookAPI = {
  async upload(file: File): Promise<Workbook> {
    const fd = new FormData();
    fd.append('file', file);
    return http<Workbook>(`${API_PREFIX}/workbooks/upload/`, { method: 'POST', body: fd });
  },

  // IMPORTANT: only accept URLSearchParams to avoid `?[object Object]`
  async listPaginated(params: URLSearchParams = new URLSearchParams()): Promise<Paged<Workbook>> {
    const qs = params.toString();
    return http<Paged<Workbook>>(`${API_PREFIX}/workbooks/${qs ? `?${qs}` : ''}`);
  },

  async get(id: UUID): Promise<Workbook> {
    return http<Workbook>(`${API_PREFIX}/workbooks/${id}/`)
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

  /**
   * Trigger processing for the whole workbook (backend: POST /process/)
   * Handles both sync (200 with `{status,result}`) and async/accepted (202 with `{status}`).
   */

async process(id: UUID): Promise<{ status: 'processing'|'completed'|'failed'; result?: any }> {
  return http<{ status: 'processing'|'completed'|'failed'; result?: any }>(
    `${API_PREFIX}/workbooks/${id}/process/`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
}
,
  /** Processing queue snapshot (backend: GET /processing-queue/) */
  async getProcessingQueue(): Promise<{ count: number; workbooks: QueueItem[] }> {
    return http<{ count: number; workbooks: QueueItem[] }>(`${API_PREFIX}/workbooks/processing-queue/`);
  },

  /** Dashboard stats (backend: GET /stats/) */
  async getStats(): Promise<Record<string, any>> {
    return http<Record<string, any>>(`${API_PREFIX}/workbooks/stats/`);
  },
};

export const sheetAPI = {
  /** Normalize both array and {results: []} backends to Sheet[] */
  async getByWorkbook(workbookId: UUID): Promise<Sheet[]> {
    const url = `${API_PREFIX}/workbooks/sheets/?${new URLSearchParams({ workbook: workbookId })}`;
    const data = await http<any>(url);
    return Array.isArray(data) ? data : (data?.results ?? []);
  },

  async get(id: UUID): Promise<Sheet> {
    return http<Sheet>(`${API_PREFIX}/workbooks/sheets/${id}/`);
  },

  async patch(
    id: UUID,
    body: Partial<Pick<Sheet,'classification_type'|'classification_meta'|'year_type'|'detected_year'>>
  ): Promise<void> {
    await http<void>(`${API_PREFIX}/workbooks/sheets/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  /** Trigger processing for a single sheet (backend: POST /sheets/{id}/process/) */
  async process(id: UUID): Promise<{ status: 'processing'|'completed'|'failed'; result?: any }> {
    return http<{ status: 'processing'|'completed'|'failed'; result?: any }>(
      `${API_PREFIX}/workbooks/sheets/${id}/process/`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );
  },
};

/* ───────── Utilities (named exports) ───────── */

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
    getClassificationLabel,
  },
};

export default api;
