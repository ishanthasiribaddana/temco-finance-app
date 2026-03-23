import { Outlet, Link, useLocation } from 'react-router-dom'
import { User, Lock, Users, Shield, Cog } from 'lucide-react'

const settingsMenu = [
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Security', href: '/settings/security', icon: Lock },
  { name: 'User Management', href: '/settings/users', icon: Users },
  { name: 'Role Management', href: '/settings/roles', icon: Shield },
  { name: 'System', href: '/settings/system', icon: Cog },
]

export default function SettingsLayout() {
  const location = useLocation()

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Settings Sub-Menu Pane */}
      <aside className="w-52 bg-white border-r border-secondary-200 flex-shrink-0">
        <div className="p-4 border-b border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900">Settings</h2>
        </div>
        <nav className="p-3 space-y-1">
          {settingsMenu.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  )
}
