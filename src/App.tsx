// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import "./App.css"
import "./index.css"
// ✅ import from your layout *folder* (you have a barrel index.ts there)
import { PageLayout } from '@/components/layout'

import HomePage from '@/pages/home_page'
import UploadPage from '@/pages/upload_page'
import DashboardPage from '@/pages/dashboard_page'
import WorkbookDetailPage from '@/pages/workbook_detail_page'
import ProcessingPage from '@/pages/processing_page'
import ReportsPage from '@/pages/reports_page'
import NotFoundPage from '@/pages/not_found_page'

export default function App() {
  const withLayout = (node: React.ReactNode) => (
    <PageLayout>{node}</PageLayout>
  )

  return (
    <Routes>
      {/* Main pages wrapped with the shared layout */}
      <Route path="/" element={withLayout(<HomePage />)} />
       <Route path="/upload" element={withLayout(<UploadPage />)} /> 
       <Route path="/dashboard" element={withLayout(<DashboardPage />)} /> 
      <Route path="/processing" element={withLayout(<ProcessingPage />)} />
      <Route path="/reports" element={withLayout(<ReportsPage />)} />
       <Route path="/workbooks/:id" element={withLayout(<WorkbookDetailPage />)} />

      {/* 404 */}
      <Route path="*" element={withLayout(<NotFoundPage />)} />
    </Routes>
  )
}
