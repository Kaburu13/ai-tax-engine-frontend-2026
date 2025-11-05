import React, { useState } from "react";
import api from "@api/client";
import FileDrop from "@components/FileDrop";
import "../styles/app.css"

type DetectResp = {
  run_id: string;
  detected: { sheet_name: string; sheet_type: string; confidence: number; evidence?: string[] }[];
};

export default function Ingest() {
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<DetectResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    setResp(null);
    try {
      const form = new FormData();
      form.append("workbook", file);
      const { data } = await api.post<DetectResp>("/runs/ingest", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResp(data);
      // store in hash so other pages can pick it up
      const url = new URL(window.location.href);
      url.hash = `run=${data.run_id}`;
      history.replaceState(null, "", url.toString());
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <FileDrop onFile={upload} />
      {busy && <p className="mt-2">Uploading & detecting…</p>}
      {err && <p className="mt-2 alert error">{err}</p>}

      {resp && (
        <div className="mt-3">
          <div className="card">
            <div className="stat">
              <div className="title">Run ID</div>
              <div className="value">{resp.run_id}</div>
            </div>
          </div>

          <h2>Detected Sheets</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sheet</th>
                  <th>Type</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {resp.detected.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.sheet_name}</td>
                    <td><code>{d.sheet_type}</code></td>
                    <td>{d.confidence.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-2">
            Next: open <b>Run Summary</b> to preview modules.
          </p>
        </div>
      )}
    </div>
  );
}
