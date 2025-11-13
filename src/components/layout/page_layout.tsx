//
import { ReactNode, useState } from 'react'
import { clsx } from 'clsx'
import Navbar from './navbar'
import Sidebar from './sidebar'
import Footer from './footer'

interface PageLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  showFooter?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

export default function PageLayout({
  children,
  showSidebar = true,
  showFooter = true,
  maxWidth = 'xl',
  className,
}: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-kpmg-gray-50">
      {/* Navbar */}
      <Navbar
        onMenuClick={toggleSidebar}
        showMenuButton={showSidebar}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div
            className={clsx(
              'mx-auto px-4 sm:px-6 lg:px-8 py-8',
              maxWidthClasses[maxWidth],
              className
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}

// Specialized layout variants for different page types

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  className,
}: DashboardLayoutProps) {
  return (
    <PageLayout className={className}>
      {(title || subtitle || actions) && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-3xl font-bold text-kpmg-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-2 text-kpmg-gray-600">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
          </div>
        </div>
      )}
      {children}
    </PageLayout>
  )
}

interface CenteredLayoutProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CenteredLayout({
  children,
  maxWidth = 'md',
  className,
}: CenteredLayoutProps) {
  const centeredMaxWidth = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }

  return (
    <PageLayout showSidebar={false} showFooter={false} maxWidth="full">
      <div className="min-h-screen flex items-center justify-center py-12">
        <div
          className={clsx(
            'w-full',
            centeredMaxWidth[maxWidth],
            className
          )}
        >
          {children}
        </div>
      </div>
    </PageLayout>
  )
}

interface FullWidthLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  className?: string
}

export function FullWidthLayout({
  children,
  showSidebar = true,
  className,
}: FullWidthLayoutProps) {
  return (
    <PageLayout
      showSidebar={showSidebar}
      maxWidth="full"
      className={clsx('px-0', className)}
    >
      {children}
    </PageLayout>
  )
}

interface BlankLayoutProps {
  children: ReactNode
  className?: string
}

export function BlankLayout({ children, className }: BlankLayoutProps) {
  return (
    <div className={clsx('min-h-screen bg-kpmg-gray-50', className)}>
      {children}
    </div>
  )
}