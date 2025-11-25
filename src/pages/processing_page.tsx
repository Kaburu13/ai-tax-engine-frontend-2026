import React from 'react';
import { workbookAPI, formatRelativeTime } from '@/types/api.types';

export default function ProcessingPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState<
    { id: string; original_filename: string; status: string; created_at: string }[]
  >([]);

  async function load() {
    try {
      setError(null);
      const data = await workbookAPI.getProcessingQueue();
      setCount(data.count);
      setItems(data.workbooks);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load processing queue');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    const timer = setInterval(load, 4000); // poll
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="text-2xl font-semibold mb-2">Processing Queue</h1>
      <p className="text-sm text-gray-600 mb-6">Workbooks currently being processed</p>

      <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm mb-6">
        <span className="font-medium">{count} workbook(s) in queue</span>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 text-red-700 px-3 py-2">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">No workbooks processing</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Workbook</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-2">{it.original_filename}</td>
                  <td className="px-4 py-2 capitalize">{it.status}</td>
                  <td className="px-4 py-2">{formatRelativeTime(it.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
