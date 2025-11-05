import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Ingest from "./pages/Ingest";
import RunSummary from "./pages/RunSummary";
import Compute from "./pages/Compute";
import ExportPage from "./pages/Export";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./styles/app.css"

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">Tax Engine</h2>
        <nav className="nav">
          <NavLink to="/" end>Upload / Ingest</NavLink>
          <NavLink to="/summary">Run Summary</NavLink>
          <NavLink to="/compute">Compute</NavLink>
          <NavLink to="/export">Export</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <Sidebar />
      </aside>

      <main className="main">
        <Topbar />
        <Routes>
          <Route path="/" element={<Ingest />} />
          <Route path="/summary" element={<RunSummary />} />
          <Route path="/compute" element={<Compute />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
