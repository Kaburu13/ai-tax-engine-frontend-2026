import React, { useState } from "react";
import "../styles/app.css"

export default function Settings() {
  const [apiBase, setApiBase] = useState(import.meta.env.VITE_API_BASE);

  return (
    <div>
      <h1>Settings</h1>
      <div className="card">
        <div className="stat">
          <div className="title">VITE_API_BASE (build-time)</div>
          <div className="value" style={{ wordBreak: "break-all" }}>{apiBase}</div>
        </div>
      </div>
      <p className="text-dim mt-2">
        To change this, set <code>VITE_API_BASE</code> in <code>.env</code> then re-run <code>npm run dev</code> or rebuild.
      </p>
    </div>
  );
}
