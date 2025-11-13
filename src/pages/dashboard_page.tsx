import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkbooks } from '../hooks';
import { formatRelativeTime } from '@/types/api.types'; // or your util
import { Download, Trash2, Eye } from 'lucide-react';

const pill = (active: boolean) =>
  `px-3 py-1 rounded-full text-sm border ${
    active ? 'bg-[#00338D] text-white border-[#00338D]' : 'bg-white text-gray-700 hover:bg-gray-50'
  }`;

const statusBadge: Record<string, string> = {
  processing: 'bg-blue-100 text-blue-800',
  classifying: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  uploaded: 'bg-indigo-100 text-indigo-800',
  pending: 'bg-gray-100 text-gray-800',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useWorkbooks(); // expecting paginated or array

  const workbooks = (data?.results ?? data ?? []) as any[];

  const totals = {
    total: workbooks.length,
    processing: workbooks.filter(w => ['processing', 'classifying', 'uploading'].includes(w.status)).length,
    completed: workbooks.filter(w => w.status === 'completed').length,
    failed: workbooks.filter(w => w.status === 'failed').length,
  };

  const [tab, setTab] = React.useState<'all' | 'processing' | 'completed' | 'failed' | 'queue'>('all');
  const filtered =
    tab === 'all'
      ? workbooks
      : tab === 'processing'
      ? workbooks.filter(w => ['processing', 'classifying', 'uploading'].includes(w.status))
      : tab === 'completed'
      ? workbooks.filter(w => w.status === 'completed')
      : tab === 'failed'
      ? workbooks.filter(w => w.status === 'failed')
      : workbooks.filter(w => w.status === 'uploading' || w.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600">Monitor uploads, queue, and completed reports</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="rounded-lg bg-[#00338D] px-4 py-2 text-white hover:bg-[#00205B]"
        >
          Upload Workbook
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totals.total },
          { label: 'Processing', value: totals.processing },
          { label: 'Completed', value: totals.completed },
          { label: 'Failed', value: totals.failed },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">{m.label}</div>
            <div className="mt-2 text-3xl font-semibold">{m.value}</div>
            <div className="mt-2 h-2 w-full rounded bg-gray-100">
              <div
                className="h-2 rounded bg-gradient-to-r from-[#00338D] to-[#0066CC]"
                style={{
                  width:
                    totals.total === 0
                      ? '0%'
                      : `${Math.min(100, Math.round((m.value / totals.total) * 100))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button className={pill(tab === 'all')} onClick={() => setTab('all')}>All</button>
        <button className={pill(tab === 'processing')} onClick={() => setTab('processing')}>Processing</button>
        <button className={pill(tab === 'completed')} onClick={() => setTab('completed')}>Completed</button>
        <button className={pill(tab === 'failed')} onClick={() => setTab('failed')}>Failed</button>
        <button className={pill(tab === 'queue')} onClick={() => setTab('queue')}>Queue</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Workbook</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Sheets</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={6}>
                  No workbooks found.
                </td>
              </tr>
            ) : (
              filtered.map((w: any) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{w.file_name || w.original_filename}</td>
                  <td className="px-6 py-3">{w.company_name || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[w.status] || 'bg-gray-100 text-gray-800'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{w.sheets_count ?? 0}</td>
                  <td className="px-6 py-3 text-gray-600">{formatRelativeTime(w.created_at || w.uploaded_at)}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => (window.location.href = `/workbooks/${w.id}`)}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                        title="View"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      <button
                        onClick={() => alert('Download coming soon')}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                        title="Download report"
                      >
                        <Download className="h-4 w-4" /> Report
                      </button>
                      <button
                        onClick={() => alert('Delete coming soon')}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
