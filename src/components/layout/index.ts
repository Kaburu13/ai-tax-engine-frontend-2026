// src/components/layout/index.ts
// Layout Components Index
// This file exports all layout components for easier importing

export { default as Navbar } from './navbar'
export { default as Sidebar } from './sidebar'
export { default as Footer } from './footer'
export { 
  default as PageLayout,
  DashboardLayout,
  CenteredLayout,
  FullWidthLayout,
  BlankLayout
} from './page_layout'

// Usage example:
// import { PageLayout, DashboardLayout, Navbar } from '@/components/layout'