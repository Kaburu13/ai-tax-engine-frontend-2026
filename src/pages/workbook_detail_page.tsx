import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  workbookAPI,
  sheetAPI,
  type Workbook,
  type Sheet,
  getClassificationLabel,
} from '@/types/api.types';

type Tab = 'all' | 'current' | 'prior' | 'unclassified';

export default function WorkbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [workbook, setWorkbook] = React.useState<Workbook | null>(null);
  const [sheets, setSheets] = React.useState<Sheet[]>([]);
  const [tab, setTab] = React.useState<Tab>('all');
  const [busy, setBusy] = React.useState(false);

  async function loadAll() {
    if (!id) return;
    try {
      setLoading(true);
      const [wb, sh] = await Promise.all([workbookAPI.get(id), sheetAPI.getByWorkbook(id)]);
      setWorkbook(wb);
      setSheets(sh);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load workbook');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadAll(); }, [id]);

  function filteredSheets() {
    switch (tab) {
      case 'current': return sheets.filter(s => s.year_type === 'current');
      case 'prior': return sheets.filter(s => s.year_type === 'prior');
      case 'unclassified': return sheets.filter(s => !s.classification_type);
      default: return sheets;
    }
  }

  async function processWorkbook() {
    if (!id) return;
    try {
      setBusy(true);
      await workbookAPI.process(id);
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to start processing');
    } finally {
      setBusy(false);
    }
  }

  async function processOne(sheetId: string) {
    try {
      setBusy(true);
      await sheetAPI.process(sheetId);
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to process sheet');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <button className="text-sm text-blue-600 mb-4" onClick={() => navigate(-1)}>← Back</button>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 text-red-700 px-3 py-2">{error}</div>
      ) : !workbook ? null : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Workbook Details</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm rounded px-2 py-1 border capitalize">{workbook.status}</span>
              <button
                onClick={processWorkbook}
                disabled={busy || !['classified','failed','completed'].includes(workbook.status)}
                className="rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50"
                title="Start processing all sheets"
              >
                {busy ? 'Working…' : 'Process Workbook'}
              </button>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-3">
            <InfoCard label="File size" value={`${(workbook.file_size/1024/1024).toFixed(2)} MB`} />
            <InfoCard label="Sheets" value={`${workbook.sheets_count} (Classified: ${workbook.classified_sheets_count})`} />
            <InfoCard label="Mode" value={workbook.mode ?? '—'} />
            <InfoCard label="Timing" value={workbook.processing_started_at ? 'Tracked' : 'Not processed'} />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-6">
            {(['all','current','prior','unclassified'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded text-sm border ${tab===t ? 'bg-gray-900 text-white' : 'bg-white'}`}
              >
                {t[0].toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          {/* Sheets Table */}
          <div className="mt-3 rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2">Sheet</th>
                  <th className="px-4 py-2">Year</th>
                  <th className="px-4 py-2">Classification</th>
                  <th className="px-4 py-2 w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSheets().length === 0 ? (
                  <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No sheets found.</td></tr>
                ) : filteredSheets().map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2">{s.sheet_name}</td>
                    <td className="px-4 py-2">{s.detected_year ?? (s.year_type==='current'?'Current':'—')}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5">
                          {getClassificationLabel(s.classification_type)}
                        </span>
                        {!!s.classification_confidence && (
                          <span className="text-xs text-gray-500">
                            {(s.classification_confidence).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="rounded bg-blue-600 text-white px-3 py-1 mr-2 disabled:opacity-50"
                        onClick={() => processOne(s.id)}
                        disabled={busy || !s.classification_type}
                        title={s.classification_type ? 'Process this sheet' : 'Classify first'}
                      >
                        Process
                      </button>
                      {/* optional: manual re-classify dropdown could live here */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base">{value}</div>
    </div>
  );
}
