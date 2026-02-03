import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Receipt, 
  Users, 
  Calendar, 
  Building2, 
  Scale, 
  BarChart3,
  LogOut,
  Menu
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chart of Accounts', href: '/chart-of-accounts', icon: BookOpen },
  { name: 'Journal Entries', href: '/journal-entries', icon: FileText },
  { name: 'Vouchers', href: '/vouchers', icon: Receipt },
  { name: 'Partners', href: '/partners', icon: Users },
  { name: 'Fiscal Years', href: '/fiscal', icon: Calendar },
  { name: 'Revenue Centers', href: '/revenue-centers', icon: Building2 },
  { name: 'Bank Reconciliation', href: '/reconciliation', icon: Scale },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
]

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200">
          <h1 className="text-xl font-bold text-primary-600">TEMCO Finance</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
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
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 rounded-lg">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-secondary-100">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">Admin User</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
