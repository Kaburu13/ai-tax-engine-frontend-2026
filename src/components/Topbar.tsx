import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Topbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const title = {
    "/": "Upload & Ingest",
    "/summary": "Run Summary",
    "/compute": "Compute",
    "/export": "Export",
    "/settings": "Settings"
  }[loc.pathname] || "AI Tax Engine";

  return (
    <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <h1 className="mt-0">{title}</h1>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/summary")} title="Run Summary">Summary</button>
        <button onClick={() => navigate("/compute")} title="Compute">Compute</button>
        <button onClick={() => navigate("/export")} title="Export">Export</button>
      </div>
    </div>
  );
}
