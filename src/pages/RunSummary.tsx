import React, { useEffect, useMemo, useState } from "react";
import api from "@api/client";
import { Th, Td } from "@components/Table";
import "../styles/app.css"

type ModuleHit = { sheet_name: string; confidence: number };
type ModulesResponse = { run_id: string; modules: Record<string, ModuleHit[]> };
type PreviewResponse = { module: string; sheet?: string; status?: string; columns: string[]; rows: Record<string, unknown>[] };

const REQUIRED = ["tb", "ia", "deferred_tax", "proof_of_tax", "tax_comp"];

export default function RunSummary() {
  const [runId, setRunId] = useState("");
  const [mods, setMods] = useState<ModulesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const missing = useMemo(() => {
    if (!mods) return REQUIRED;
    const present = Object.keys(mods.modules || {});
    return REQUIRED.filter((m) => !present.includes(m));
  }, [mods]);

  const load = async () => {
    if (!runId) return;
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<ModulesResponse>(`/runs/${runId}/modules`);
      setMods(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load modules");
      setMods(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("run");
    if (fromHash) { setRunId(fromHash); setTimeout(load, 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Run Summary</h1>
      <div className="flex items-center gap-2">
        <input
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
          placeholder="Run ID"
          className="w-240"
        />
        <button onClick={load} disabled={!runId || loading}>{loading ? "Loading…" : "Refresh"}</button>
      </div>

      {err && <p className="alert error mt-2">{err}</p>}
      {!mods && !loading && <p className="text-dim mt-2">Enter a <b>Run ID</b> or upload on the Ingest page.</p>}

      {mods && (
        <>
          <section className="stats mt-3">
            <div className="card stat">
              <div className="title">Run ID</div><div className="value">{mods.run_id}</div>
            </div>
            <div className="card stat">
              <div className="title">Modules Detected</div><div className="value">{Object.keys(mods.modules).length}</div>
            </div>
            <div className="card stat">
              <div className="title">Sheets Total</div>
              <div className="value">{Object.values(mods.modules).reduce((a,b)=>a+b.length,0)}</div>
            </div>
            <div className="card stat">
              <div className="title">Missing (required)</div>
              <div className="value">{missing.length ? missing.join(", ") : "None"}</div>
            </div>
          </section>

          <section className="mt-3">
            <h2>Detected Modules</h2>
            <ModulesTable runId={mods.run_id} modules={mods.modules} />
          </section>

          <section className="mt-3">
            <h2>Quick Flags</h2>
            <Flags missing={missing} />
          </section>
        </>
      )}
    </div>
  );
}

function Flags({ missing }: { missing: string[] }) {
  const rows: { level: "ERROR" | "WARN" | "INFO"; msg: string }[] = [];
  if (missing.includes("tb")) rows.push({ level: "ERROR", msg: "Missing Trial Balance — cannot compute PBT." });
  if (missing.includes("ia")) rows.push({ level: "WARN", msg: "Missing Investment Allowance — IA will be zero." });
  if (missing.includes("deferred_tax")) rows.push({ level: "WARN", msg: "Missing Deferred Tax schedule — DT movement unavailable." });
  if (missing.includes("proof_of_tax")) rows.push({ level: "INFO", msg: "Proof of Tax not found — credits may be missing." });
  if (missing.includes("tax_comp")) rows.push({ level: "INFO", msg: "Tax Computation sheet not found — engine can still compute it." });

  if (!rows.length) return <p style={{ color: "#0a7d12" }}>No immediate issues detected.</p>;
  return (
    <ul>
      {rows.map((f, i) => (
        <li key={i} style={{ color: f.level === "ERROR" ? "crimson" : f.level === "WARN" ? "#a16207" : "#374151" }}>
          <b>[{f.level}]</b> {f.msg}
        </li>
      ))}
    </ul>
  );
}

function ModulesTable({ runId, modules }: { runId: string; modules: Record<string, { sheet_name: string; confidence: number }[]> }) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadPreview = async (mod: string) => {
    setLoading(true); setErr(null); setPreview(null);
    try {
      const { data } = await api.get<PreviewResponse>(`/runs/${runId}/module/${mod}`);
      setPreview(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  const names = Object.keys(modules || {});
  return (
    <div className="grid gap-3">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <Th>Module</Th>
              <Th>Sheets</Th>
              <Th>Top Confidence</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {names.map((m) => {
              const list = modules[m];
              const best = [...list].sort((a, b) => b.confidence - a.confidence)[0];
              return (
                <tr key={m}>
                  <Td><code>{m}</code></Td>
                  <Td>{list.length}</Td>
                  <Td>{best ? `${best.sheet_name} (${best.confidence.toFixed(3)})` : "-"}</Td>
                  <Td><button onClick={() => loadPreview(m)}>Preview</button></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        {loading && <p>Loading preview…</p>}
        {err && <p className="alert error">{err}</p>}
        {preview && !loading && (
          <>
            <h3 className="mt-2">Preview: <code>{preview.module}</code>{preview.sheet ? ` — ${preview.sheet}` : ""}</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {preview.columns.map((c) => <Th key={c}>{c}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, i) => (
                    <tr key={i}>
                      {preview.columns.map((c) => <Td key={c}>{formatCell((r as any)[c])}</Td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!preview.rows?.length && <p className="text-dim">No rows returned.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatCell(v: unknown) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return new Intl.NumberFormat().format(v);
  return String(v);
}
