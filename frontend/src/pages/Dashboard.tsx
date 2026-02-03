import { DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle } from 'lucide-react'

const stats = [
  { name: 'Total Assets', value: 'LKR 12.5M', change: '+4.2%', trend: 'up', icon: DollarSign },
  { name: 'Total Liabilities', value: 'LKR 8.3M', change: '+2.1%', trend: 'up', icon: TrendingUp },
  { name: 'Net Income', value: 'LKR 1.2M', change: '+12.5%', trend: 'up', icon: TrendingDown },
  { name: 'Pending Vouchers', value: '24', change: '-3', trend: 'down', icon: FileText },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Finance Dashboard</h1>
        <span className="text-sm text-secondary-500">Fiscal Year 2026</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
              <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-sm text-secondary-500">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Pending Approvals</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-sm text-secondary-700">5 vouchers awaiting approval</span>
              </div>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Review</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm text-secondary-700">3 journal entries pending</span>
              </div>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Review</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-sm text-secondary-500 text-center py-8">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
