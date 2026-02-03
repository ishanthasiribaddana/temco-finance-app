import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle, Plus, ArrowRight, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'

const stats = [
  { name: 'Total Assets', value: 'LKR 11.5M', change: '+4.2%', trend: 'up', icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
  { name: 'Total Liabilities', value: 'LKR 3.0M', change: '+2.1%', trend: 'up', icon: TrendingUp, color: 'bg-red-50 text-red-600' },
  { name: 'Net Income', value: 'LKR 1.0M', change: '+12.5%', trend: 'up', icon: TrendingDown, color: 'bg-green-50 text-green-600' },
  { name: 'Open Period', value: 'Feb 2026', change: 'FY2026', trend: 'neutral', icon: FileText, color: 'bg-purple-50 text-purple-600' },
]

const recentTransactions = [
  { id: 1, type: 'Payment Voucher', number: 'PV-2026-0125', amount: 125000, status: 'APPROVED', date: '2026-02-04' },
  { id: 2, type: 'Receipt Voucher', number: 'RV-2026-0089', amount: 75000, status: 'APPROVED', date: '2026-02-04' },
  { id: 3, type: 'Journal Entry', number: 'JE-2026-0042', amount: 50000, status: 'POSTED', date: '2026-02-04' },
  { id: 4, type: 'Payment Voucher', number: 'PV-2026-0124', amount: 15000, status: 'PENDING', date: '2026-02-03' },
]

const pendingItems = [
  { type: 'Voucher Approvals', count: 3, path: '/vouchers/approvals', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  { type: 'Journal Approvals', count: 1, path: '/journal-entries/approvals', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  { type: 'Bank Reconciliation', count: 1, path: '/reconciliation', icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
]

const quickActions = [
  { label: 'New Voucher', path: '/vouchers', icon: Plus },
  { label: 'Journal Entry', path: '/journal-entries', icon: Plus },
  { label: 'View Reports', path: '/reports', icon: BarChart3 },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Finance Dashboard</h1>
          <p className="text-secondary-500">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          {quickActions.map(action => (
            <Button key={action.label} variant="outline" size="sm" leftIcon={<action.icon className="w-4 h-4" />} onClick={() => navigate(action.path)}>
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend !== 'neutral' && (
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              )}
              {stat.trend === 'neutral' && <Badge variant="info">{stat.change}</Badge>}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-sm text-secondary-500">{stat.name}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Pending Actions" className="lg:col-span-1">
          <div className="space-y-3">
            {pendingItems.map(item => (
              <div key={item.type} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 cursor-pointer" onClick={() => navigate(item.path)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}><item.icon className="w-4 h-4" /></div>
                  <div>
                    <p className="font-medium text-secondary-900">{item.type}</p>
                    <p className="text-sm text-secondary-500">{item.count} item{item.count > 1 ? 's' : ''} pending</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-400" />
              </div>
            ))}
            {pendingItems.length === 0 && (
              <div className="text-center py-6 text-secondary-500">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                All caught up!
              </div>
            )}
          </div>
        </Card>

        <Card title="Recent Transactions" headerAction={<Button variant="ghost" size="sm" onClick={() => navigate('/vouchers')}>View All</Button>} className="lg:col-span-2" noPadding>
          <table className="w-full">
            <thead className="bg-secondary-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600 uppercase">Reference</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-secondary-600 uppercase">Amount</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-secondary-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-secondary-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm">{tx.type}</td>
                  <td className="px-4 py-3 font-mono text-sm text-primary-600">{tx.number}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm">LKR {tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={tx.status === 'APPROVED' || tx.status === 'POSTED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'default'} size="sm">{tx.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-secondary-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Cash Flow Summary">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2"><TrendingUp className="w-5 h-5" /><span className="font-medium">Inflows</span></div>
              <p className="text-2xl font-bold text-secondary-900">LKR 2.5M</p>
              <p className="text-sm text-secondary-500">This month</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2"><TrendingDown className="w-5 h-5" /><span className="font-medium">Outflows</span></div>
              <p className="text-2xl font-bold text-secondary-900">LKR 1.5M</p>
              <p className="text-sm text-secondary-500">This month</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-primary-700">Net Cash Flow</span>
              <span className="text-xl font-bold text-primary-700">+LKR 1.0M</span>
            </div>
          </div>
        </Card>

        <Card title="Budget Utilization">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Operating Expenses</span><span className="font-medium">75%</span></div>
              <div className="w-full bg-secondary-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Capital Expenditure</span><span className="font-medium">45%</span></div>
              <div className="w-full bg-secondary-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Marketing & Sales</span><span className="font-medium">90%</span></div>
              <div className="w-full bg-secondary-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Research & Development</span><span className="font-medium">30%</span></div>
              <div className="w-full bg-secondary-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div></div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/reports')}>View Full Report</Button>
        </Card>
      </div>
    </div>
  )
}
