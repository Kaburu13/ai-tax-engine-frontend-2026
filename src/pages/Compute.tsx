import React, { useEffect, useState } from "react";
import api from "@api/client";
import "../styles/app.css"

type ComputeResp = { run_id: string; results: Record<string, unknown> };

export default function Compute() {
  const [runId, setRunId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ComputeResp | null>(null);

  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("run");
    if (fromHash) setRunId(fromHash);
  }, []);

  const computeAll = async () => {
    if (!runId) return;
    setBusy(true); setErr(null); setData(null);
    try {
      const { data } = await api.get<ComputeResp>(`/runs/${runId}/compute/all`);
      setData(data);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message || "Compute failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Compute</h1>
      <div className="flex items-center gap-2">
        <input value={runId} onChange={(e)=>setRunId(e.target.value)} placeholder="Run ID" className="w-240" />
        <button onClick={computeAll} disabled={!runId || busy}>{busy ? "Computing…" : "Compute All"}</button>
      </div>

      {err && <p className="alert error mt-2">{err}</p>}

      {data && (
        <div className="mt-3">
          <div className="card">
            <div className="stat">
              <div className="title">Run ID</div>
              <div className="value">{data.run_id}</div>
            </div>
          </div>
          <h2>Results (JSON)</h2>
          <pre className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(data.results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
