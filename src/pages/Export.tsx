import React, { useEffect, useState } from "react";
import api from "@api/client";
import "../styles/app.css"

type ExportResp = { run_id: string; export_path: string };

export default function ExportPage() {
  const [runId, setRunId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<ExportResp | null>(null);

  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("run");
    if (fromHash) setRunId(fromHash);
  }, []);

  const exportExcel = async () => {
    setBusy(true); setErr(null); setOut(null);
    try {
      const { data } = await api.get<ExportResp>(`/runs/${runId}/export/excel`);
      setOut(data);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message || "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Export</h1>
      <div className="flex items-center gap-2">
        <input value={runId} onChange={(e)=>setRunId(e.target.value)} placeholder="Run ID" className="w-240" />
        <button onClick={exportExcel} disabled={!runId || busy}>{busy ? "Exporting…" : "Export Excel"}</button>
      </div>

      {err && <p className="alert error mt-2">{err}</p>}

      {out && (
        <div className="mt-3">
          <div className="card">
            <div className="stat">
              <div className="title">Saved To</div>
              <div className="value" style={{ wordBreak: "break-all" }}>{out.export_path}</div>
            </div>
          </div>
          <p className="text-dim mt-2">
            Local dev: path on server. Azure: blob path/URL (configure Container).
          </p>
        </div>
      )}
    </div>
  );
}
