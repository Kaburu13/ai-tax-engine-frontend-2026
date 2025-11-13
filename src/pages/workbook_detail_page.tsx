// src/pages/workbook_detail_page.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Clock, FileSpreadsheet, Loader2, RefreshCw, ShieldAlert, CheckCircle2, Pencil
} from 'lucide-react';
import PageLayout from '@/components/layout/page_layout';
import { workbookAPI, sheetAPI, type Workbook, type Sheet, type UUID } from '@/types/api.types';

type TabKey = 'all' | 'current' | 'prior' | 'unclassified';

const CLASS_LABELS: Record<string, string> = {
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

function pctColor(pct: number) {
  if (pct >= 85) return 'text-green-600';
  if (pct >= 60) return 'text-amber-600';
  if (pct > 0) return 'text-rose-600';
  return 'text-gray-400';
}

function statusPill(status: Workbook['status']) {
  const map: Record<Workbook['status'], string> = {
    pending: 'bg-gray-100 text-gray-700',
    uploading: 'bg-blue-100 text-blue-700',
    uploaded: 'bg-indigo-100 text-indigo-700',
    classifying: 'bg-amber-100 text-amber-700',
    classified: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-sky-100 text-sky-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-rose-100 text-rose-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export default function WorkbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [tab, setTab] = useState<TabKey>('all');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<UUID | null>(null);
  const [error, setError] = useState<string | null>(null);

  // fetch workbook + sheets
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!id) {
        setError('Missing workbook id');
        setLoading(false);
        return;
      }
      try {
        const w = await workbookAPI.get(id as UUID);
        if (cancel) return;
        setWorkbook(w);

        const arr = await sheetAPI.getByWorkbook(id as UUID); // ← normalized to Sheet[]
        if (cancel) return;
        setSheets(arr);
      } catch (e: any) {
        if (!cancel) setError(e.message ?? 'Failed to load workbook');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

const normalizedYearType = (v?: string | null) => {
  if (!v) return 'unknown';
  const t = v.toLowerCase();
  if (t === 'current_year') return 'current';
  if (t === 'prior_year') return 'prior';
  return (['current', 'prior'].includes(t) ? t : 'unknown') as 'current'|'prior'|'unknown';
};

const filtered = useMemo(() => {
  const items = sheets.map(s => ({ ...s, year_type: normalizedYearType(s.year_type) }));
  if (tab === 'current') return items.filter(s => s.year_type === 'current');
  if (tab === 'prior') return items.filter(s => s.year_type === 'prior');
  if (tab === 'unclassified') return items.filter(
    s => !s.classification_type || s.classification_type === 'unclassified'
  );
  return items;
}, [sheets, tab]);

  const handleManualAssign = async (sheet: Sheet, newType: string) => {
    try {
      setSavingId(sheet.id);
      await sheetAPI.patch(sheet.id, {
        classification_type: newType,
        classification_meta: {
          ...(sheet.classification_meta ?? {}),
          manual: true,
          reasons: ['user correction from detail page'],
        },
      });
      // update local state
      setSheets((prev) =>
        prev.map((s) =>
          s.id === sheet.id
            ? {
                ...s,
                classification_type: newType,
                classification_display: CLASS_LABELS[newType] ?? newType,
                classification_meta: {
                  ...(s.classification_meta ?? {}),
                  manual: true,
                },
                classification_confidence: Math.max(s.classification_confidence, 0.6),
              }
            : s
        )
      );
    } catch (e: any) {
      alert(e.message ?? 'Failed to update classification');
    } finally {
      setSavingId(null);
    }
  };

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const w = await workbookAPI.get(id as UUID);
      setWorkbook(w);
      const arr = await sheetAPI.getByWorkbook(id as UUID); // ← array
      setSheets(arr);
    } catch (e: any) {
      setError(e.message ?? 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-kpmg-blue hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workbook Details</h1>
          <p className="text-sm text-gray-500">Review sheet classification and processing status</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusPill(workbook?.status ?? 'pending')}`}>
            {workbook?.status ?? '—'}
          </span>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Header summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">File size</div>
            <FileSpreadsheet size={16} className="text-gray-400" />
          </div>
          <div className="mt-1 text-lg font-semibold">
            {workbook ? `${(workbook.file_size / 1024 / 1024).toFixed(2)} MB` : '—'}
          </div>
          <div className="text-xs text-gray-400">{workbook?.original_filename ?? ''}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Sheets</div>
            <BadgeCheck size={16} className="text-gray-400" />
          </div>
          <div className="mt-1 text-lg font-semibold">{workbook?.sheets_count ?? 0}</div>
          <div className="text-xs text-gray-400">
            Classified: {workbook?.classified_sheets_count ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Mode</div>
            <ShieldAlert size={16} className="text-gray-400" />
          </div>
          <div className="mt-1 text-lg font-semibold">
            {workbook?.mode ? workbook.mode : '—'}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Timing</div>
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="mt-1 text-lg font-semibold">
            {workbook?.processing_duration
              ? `${Math.round(workbook.processing_duration)}s`
              : '—'}
          </div>
          <div className="text-xs text-gray-400">
            {workbook?.processing_started_at ? 'Processed' : 'Not processed'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-2">
        {(['all', 'current', 'prior', 'unclassified'] as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === k ? 'bg-kpmg-blue text-white' : 'border bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {/* Sheets table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
          <div className="col-span-5">Sheet</div>
          <div className="col-span-3">Year</div>
          <div className="col-span-4 text-right">Classification</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">
            <Loader2 className="mr-2 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No sheets found.</div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-12 items-center border-t px-4 py-3 text-sm"
            >
              <div className="col-span-5 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
                  <FileSpreadsheet size={16} />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-900">
                    {s.sheet_name}
                  </div>
                  <div className="text-xs text-gray-500">#{s.sheet_index}</div>
                </div>
              </div>

              <div className="col-span-3">
                <div className="text-gray-900">
                  {s.year_type === 'unknown' ? '—' : s.year_type}
                </div>
                <div className="text-xs text-gray-500">
                  {s.detected_year ?? ''}
                </div>
              </div>

              <div className="col-span-4">
                <div className="flex items-center justify-end gap-3">
                  {/* Why hover */}
                  <div className="text-right">
                    <div className={`font-medium ${pctColor(s.confidence_percentage || 0)}`}>
                      {s.classification_display || 'Not Classified'}
                      {s.confidence_percentage ? ` (${s.confidence_percentage.toFixed(0)}%)` : ''}
                    </div>

                    {s.classification_meta && (s.classification_meta as any).reasons?.length ? (
                      <div className="group relative mt-0.5 inline-block">
                        <span className="cursor-help text-[11px] text-gray-400">Why?</span>
                        <div className="absolute right-0 z-10 hidden w-80 rounded-md border bg-white p-3 text-left shadow group-hover:block">
                          <p className="mb-2 text-xs font-semibold">Classification explanation</p>
                          <ul className="ml-4 list-disc space-y-1 text-xs">
                            {(s.classification_meta as any).reasons.slice(0, 5).map((r: string, i: number) => (
                              <li key={`${s.id}-r-${i}`}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Manual edit */}
                  <div className="relative">
                    <label className="sr-only" htmlFor={`sel-${s.id}`}>Edit classification</label>
                    <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
                      <Pencil size={14} className="text-gray-500" />
                      <select
                        id={`sel-${s.id}`}
                        className="bg-transparent text-sm outline-none"
                        disabled={!!savingId}
                        value={s.classification_type ?? 'unclassified'}
                        onChange={(e) => handleManualAssign(s, e.target.value)}
                      >
                        {Object.keys(CLASS_LABELS).map((k) => (
                          <option key={k} value={k}>
                            {CLASS_LABELS[k]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {savingId === s.id ? (
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  ) : s.is_processed ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer note if failed */}
      {workbook?.status === 'failed' && workbook.error_message && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Processing failed: {workbook.error_message}
        </div>
      )}
    </div>
  );
}
