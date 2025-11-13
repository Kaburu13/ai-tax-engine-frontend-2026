// src/components/layout/navbar.tsx
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

interface NavbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export default function Navbar({ onMenuClick, showMenuButton = true }: NavbarProps) {
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/upload', label: 'Upload' },
    { path: '/processing', label: 'Processing' },
    { path: '/reports', label: 'Reports' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white border-b border-kpmg-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Menu button + Logo + Brand */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-kpmg-gray-100 transition-colors lg:hidden focus-ring"
                aria-label="Toggle menu"
              >
                <Menu size={24} className="text-kpmg-gray-700" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-kpmg-blue rounded-lg flex items-center justify-center group-hover:bg-kpmg-blue-dark transition-colors">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-kpmg-blue leading-none">
                  AI Tax Engine
                </h1>
                <p className="text-xs text-kpmg-gray-600">KPMG East Africa</p>
              </div>
            </Link>
          </div>

          {/* Center section: Navigation links (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive(link.path)
                    ? 'bg-kpmg-blue text-white'
                    : 'text-kpmg-gray-700 hover:bg-kpmg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section: Notifications + User menu */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-kpmg-gray-100 transition-colors focus-ring relative"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-kpmg-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-kpmg-gray-200 z-20 animate-fade-in">
                    <div className="p-4 border-b border-kpmg-gray-200">
                      <h3 className="font-semibold text-kpmg-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-kpmg-gray-50 border-b border-kpmg-gray-100 cursor-pointer">
                        <p className="text-sm font-medium text-kpmg-gray-900">
                          Processing Complete
                        </p>
                        <p className="text-xs text-kpmg-gray-600 mt-1">
                          Workbook "Client ABC 2024" has been processed successfully
                        </p>
                        <p className="text-xs text-kpmg-gray-500 mt-2">2 minutes ago</p>
                      </div>
                      <div className="p-4 hover:bg-kpmg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-kpmg-gray-900">
                          Upload Ready
                        </p>
                        <p className="text-xs text-kpmg-gray-600 mt-1">
                          You can now upload new workbooks
                        </p>
                        <p className="text-xs text-kpmg-gray-500 mt-2">1 hour ago</p>
                      </div>
                    </div>
                    <div className="p-3 border-t border-kpmg-gray-200">
                      <button className="text-sm text-kpmg-blue hover:underline w-full text-center">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-kpmg-gray-100 transition-colors focus-ring"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-kpmg-blue rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-kpmg-gray-700">
                  Tax Team
                </span>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-kpmg-gray-200 z-20 animate-fade-in">
                    <div className="p-4 border-b border-kpmg-gray-200">
                      <p className="font-semibold text-kpmg-gray-900">Tax Team User</p>
                      <p className="text-sm text-kpmg-gray-600">tax.team@kpmg.com</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-kpmg-gray-100 transition-colors text-left">
                        <User size={18} className="text-kpmg-gray-600" />
                        <span className="text-sm text-kpmg-gray-900">Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-kpmg-gray-100 transition-colors text-left">
                        <Settings size={18} className="text-kpmg-gray-600" />
                        <span className="text-sm text-kpmg-gray-900">Settings</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-kpmg-gray-200">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left">
                        <LogOut size={18} className="text-error" />
                        <span className="text-sm text-error">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu (shown when menu is open) */}
      <div className="lg:hidden border-t border-kpmg-gray-200 bg-kpmg-gray-50">
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(link.path)
                  ? 'bg-kpmg-blue text-white'
                  : 'text-kpmg-gray-700 hover:bg-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}