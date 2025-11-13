// src/components/layout/sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Upload, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  HelpCircle,
  X,
  ChevronRight,
  Activity,
  type LucideIcon
} from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  badge?: string | number
  children?: NavItem[]
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation()

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: '3',
    },
    {
      path: '/upload',
      label: 'Upload Workbook',
      icon: Upload,
    },
    {
      path: '/processing',
      label: 'Processing',
      icon: Activity,
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: FileText,
    },
  ]

  const bottomNavItems: NavItem[] = [
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
    },
    {
      path: '/help',
      label: 'Help & Support',
      icon: HelpCircle,
    },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const active = isActive(item.path)

    return (
      <Link
        to={item.path}
        onClick={onClose}
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
          active
            ? 'bg-kpmg-blue text-white shadow-sm'
            : 'text-kpmg-gray-700 hover:bg-kpmg-gray-100'
        )}
      >
        <Icon
          size={20}
          className={clsx(
            'flex-shrink-0',
            active ? 'text-white' : 'text-kpmg-gray-600 group-hover:text-kpmg-blue'
          )}
        />
        <span className="flex-1 font-medium text-sm">{item.label}</span>
        {item.badge && (
          <span
            className={clsx(
              'px-2 py-0.5 text-xs font-semibold rounded-full',
              active
                ? 'bg-white/20 text-white'
                : 'bg-kpmg-blue text-white'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.children && (
          <ChevronRight
            size={16}
            className={clsx(
              'flex-shrink-0 transition-transform',
              active && 'rotate-90'
            )}
          />
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white border-r border-kpmg-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64 flex flex-col'
        )}
      >
        {/* Sidebar header (mobile only) */}
        <div className="flex items-center justify-between p-4 border-b border-kpmg-gray-200 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-kpmg-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-kpmg-blue">AI Tax Engine</h2>
              <p className="text-xs text-kpmg-gray-600">KPMG East Africa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-kpmg-gray-100 transition-colors focus-ring"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-kpmg-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-kpmg-gray-200" />

          {/* Bottom navigation */}
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-kpmg-gray-200 bg-kpmg-gray-50">
          <div className="bg-kpmg-blue/10 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <HelpCircle size={20} className="text-kpmg-blue flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-kpmg-gray-900 mb-1">
                  Need Help?
                </h4>
                <p className="text-xs text-kpmg-gray-600 mb-2">
                  Contact the Tax Technology Team for assistance
                </p>
                <button className="text-xs font-medium text-kpmg-blue hover:underline">
                  Get Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}