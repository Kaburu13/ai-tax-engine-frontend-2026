// src/pages/upload_page.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/page_layout';
import { workbookAPI } from '@/types/api.types';
import { UploadCloud, FileCheck2, Loader2, Trash2 } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = (f: File | null) => {
    setError(null);
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setError(null);
    setUploading(true);
    try {
      const wb = await workbookAPI.upload(file);
      // success → go to detail page for this workbook
      navigate(`/workbooks/${wb.id}`);
    } catch (e: any) {
      // important: stay on the page; show error; do not navigate
      setError(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Workbook</h1>
        <p className="text-sm text-gray-500">Upload your Excel workbook for processing</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        {!file ? (
          <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-50">
            <input
              type="file"
              accept=".xlsx,.xlsm"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
           <UploadCloud size={28} className="mb-2 text-gray-500" />
            <div className="text-sm text-gray-600">Click to select a workbook (.xlsx / .xlsm)</div>
          </label>
        ) : (
          <div className="rounded-md border bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-green-100">
                  <FileCheck2 className="text-green-700" size={18} />
                </span>
                <div>
                  <div className="font-medium text-gray-900">{file.name}</div>
                  <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                onClick={() => onFile(null)}
                disabled={uploading}
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <div>What happens next?</div>
            <ol className="mt-1 list-inside list-decimal space-y-0.5">
              <li>File is uploaded to server</li>
              <li>Sheets are automatically classified</li>
              <li>Tax computations are processed</li>
              <li>Results become available for review</li>
            </ol>
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white ${
              !file || uploading ? 'bg-kpmg-blue/60' : 'bg-kpmg-blue hover:bg-kpmg-blue-dark'
            }`}
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : null}
            Upload and Process
          </button>
        </div>
      </div>
    </div>
  );
}
