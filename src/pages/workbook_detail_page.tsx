// src/pages/workbook_detail_page.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  workbookAPI,
  processWorkbook,
  sheetAPI,
  CLASSIFICATION_OPTIONS,
  type Sheet,
  type Workbook,
} from "../services/api";

type TabKey = "all" | "current" | "prior" | "unclassified";

const WorkbookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [wb, setWb] = useState<Workbook | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [processing, setProcessing] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    const [workbook, rawSheets] = await Promise.all([
      workbookAPI.get(id),
      workbookAPI.getSheets(id),
    ]);
    setWb(workbook);
    setSheets(rawSheets);
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        await reload();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, reload]);

  // ——————— Tab bucketing with fallbacks ———————
  const filtered = useMemo(() => {
    if (!sheets || !wb) return [];

    const cy = (wb as any).current_tax_year ?? null; // backend field name
    const py = (wb as any).prior_tax_year ?? null;

    const isCurrent = (s: Sheet) => {
      const yt = (s.year_type || "unknown").toLowerCase();
      if (yt === "current") return true;
      if (s.detected_year != null && cy != null) return Number(s.detected_year) === Number(cy);
      return false;
    };

    const isPrior = (s: Sheet) => {
      const yt = (s.year_type || "unknown").toLowerCase();
      if (yt === "prior") return true;
      if (s.detected_year != null && py != null) return Number(s.detected_year) === Number(py);
      return false;
    };

    switch (tab) {
      case "current":
        return sheets.filter(isCurrent);
      case "prior":
        return sheets.filter(isPrior);
      case "unclassified":
        return sheets.filter((s) => !s.classification_type);
      default:
        return sheets;
    }
  }, [sheets, wb, tab]);

  // ——————— Process button ———————
  const onProcessWorkbook = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      const res = await processWorkbook(id); // your API returns { started, mode, status, result? }
      // If we ran synchronously, take the user straight to Reports (they expect "a result").
      if (res?.mode === "sync") {
        // optional: force a refresh so status badges update when they come back
        await reload();
        navigate("/reports", {
          state: {
            fromProcessing: true,
            workbookId: id,
            report: res?.result?.report ?? null,
          },
        });
      } else {
        // async (Celery) – go to queue
        navigate("/processing", { state: { queuedId: id } });
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!wb) return <div className="p-6 text-red-600">Workbook not found.</div>;

  const fileSize =
    wb.file_size_bytes != null
      ? `${(wb.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
      : "—";

  return (
    <div className="p-6">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          ← Back
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Workbook Details</h1>
        <button
          onClick={onProcessWorkbook}
          disabled={processing || wb.status === "processing"}
          className={`px-4 py-2 rounded text-white ${
            processing || wb.status === "processing"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {processing || wb.status === "processing" ? "Processing…" : "Process Workbook"}
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4 space-x-2">
        <span>File size: {fileSize}</span>
        <span>•</span>
        <span>Sheets: {sheets.length}</span>
        <span>•</span>
        <span>Status: {wb.status ?? "—"}</span>
      </div>

      {/* Tabs */}
      <div className="mb-3 space-x-2">
        {(["all", "current", "prior", "unclassified"] as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1 rounded border ${
              tab === k ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white"
            }`}
          >
            {k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Sheet</th>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Classification</th>
              <th className="px-3 py-2 text-left">Confidence</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const processed = (s as any).is_processed ? true : false;
              const conf =
                s.confidence_percentage != null
                  ? `${s.confidence_percentage}%`
                  : "—";
              return (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.sheet_name}</td>
                  <td className="px-3 py-2">{s.detected_year ?? "—"}</td>
                  <td className="px-3 py-2">
                    {s.classification_display || s.classification_type || "Unclassified"}
                  </td>
                  <td className="px-3 py-2">{conf}</td>
                  <td className="px-3 py-2">
                    {processed ? (
                      <span className="px-2 py-1 text-green-700 bg-green-100 rounded">processed</span>
                    ) : (
                      <span className="px-2 py-1 text-gray-700 bg-gray-100 rounded">pending</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <SheetClassifierDropdown sheet={s} onChanged={reload} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  No sheets in this tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkbookDetailPage;

/* ──────────────────────────────────────────────────────────────────────────
   Small local component for reclassifying a sheet. After a change, we call
   `onChanged()` to refetch data so tabs and pills update instantly.
   ────────────────────────────────────────────────────────────────────────── */
const SheetClassifierDropdown: React.FC<{
  sheet: Sheet;
  onChanged: () => Promise<void>;
}> = ({ sheet, onChanged }) => {
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState<string>(sheet.classification_type ?? "unclassified");

  const onChange = async (v: string) => {
    setValue(v);
    try {
      setSaving(true);
      await sheetAPI.patch((sheet as any).id, { classification_type: v });
      await onChanged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={saving}
      className="border rounded px-2 py-1"
    >
      {CLASSIFICATION_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};
