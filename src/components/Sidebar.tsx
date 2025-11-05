import React from "react";

export default function Sidebar() {
  return (
    <div style={{ marginTop: 16 }}>
      <div className="card">
        <div className="stat">
          <div className="title">API Base</div>
          <div className="value" style={{ wordBreak: "break-all" }}>
            {import.meta.env.VITE_API_BASE}
          </div>
        </div>
      </div>
      <p className="text-dim mt-2">
        Tip: You can set <code>VITE_API_BASE</code> in <code>.env</code>.
      </p>
    </div>
  );
}
