import { useState } from 'react'
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, FileSpreadsheet, Calendar, Filter } from 'lucide-react'
import { Button, Card, Select, Input, Badge } from '../../components/ui'

const reportCategories = [
  { id: 'financial', name: 'Financial Statements', icon: FileText, reports: [
    { id: 'balance-sheet', name: 'Balance Sheet', description: 'Assets, Liabilities and Equity position' },
    { id: 'income-statement', name: 'Income Statement', description: 'Revenue and Expenses summary' },
    { id: 'cash-flow', name: 'Cash Flow Statement', description: 'Cash inflows and outflows' },
    { id: 'trial-balance', name: 'Trial Balance', description: 'All account balances' },
  ]},
  { id: 'ledger', name: 'Ledger Reports', icon: FileSpreadsheet, reports: [
    { id: 'general-ledger', name: 'General Ledger', description: 'Complete transaction history' },
    { id: 'account-ledger', name: 'Account Ledger', description: 'Transactions by account' },
    { id: 'partner-ledger', name: 'Partner Ledger', description: 'Partner transaction history' },
  ]},
  { id: 'analysis', name: 'Analysis Reports', icon: BarChart3, reports: [
    { id: 'budget-variance', name: 'Budget vs Actual', description: 'Budget variance analysis' },
    { id: 'revenue-analysis', name: 'Revenue Analysis', description: 'Revenue by center' },
    { id: 'expense-analysis', name: 'Expense Analysis', description: 'Expense breakdown' },
  ]},
  { id: 'audit', name: 'Audit Reports', icon: PieChart, reports: [
    { id: 'journal-register', name: 'Journal Register', description: 'All journal entries' },
    { id: 'voucher-register', name: 'Voucher Register', description: 'All vouchers' },
    { id: 'audit-trail', name: 'Audit Trail', description: 'System activity log' },
  ]},
]

function ReportCard({ report, onClick }: { report: { id: string; name: string; description: string }; onClick: () => void }) {
  return (
    <div onClick={onClick} className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors">
      <h4 className="font-medium text-secondary-900">{report.name}</h4>
      <p className="text-sm text-secondary-500 mt-1">{report.description}</p>
    </div>
  )
}

function BalanceSheet() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Balance Sheet</h2><p className="text-secondary-500">As of February 4, 2026</p></div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export PDF</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card title="Assets" noPadding>
          <table className="w-full">
            <tbody className="divide-y">
              <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">Current Assets</td><td className="px-4 py-2 text-right"></td></tr>
              <tr><td className="px-4 py-2 pl-8">Cash on Hand</td><td className="px-4 py-2 text-right font-mono">250,000</td></tr>
              <tr><td className="px-4 py-2 pl-8">Bank Accounts</td><td className="px-4 py-2 text-right font-mono">3,500,000</td></tr>
              <tr><td className="px-4 py-2 pl-8">Accounts Receivable</td><td className="px-4 py-2 text-right font-mono">1,250,000</td></tr>
              <tr className="font-medium"><td className="px-4 py-2 pl-8">Total Current Assets</td><td className="px-4 py-2 text-right font-mono">5,000,000</td></tr>
              <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">Fixed Assets</td><td className="px-4 py-2 text-right"></td></tr>
              <tr><td className="px-4 py-2 pl-8">Property & Equipment</td><td className="px-4 py-2 text-right font-mono">8,000,000</td></tr>
              <tr><td className="px-4 py-2 pl-8">Less: Depreciation</td><td className="px-4 py-2 text-right font-mono">(1,500,000)</td></tr>
              <tr className="font-medium"><td className="px-4 py-2 pl-8">Total Fixed Assets</td><td className="px-4 py-2 text-right font-mono">6,500,000</td></tr>
              <tr className="bg-primary-50 font-bold text-primary-700"><td className="px-4 py-3">TOTAL ASSETS</td><td className="px-4 py-3 text-right font-mono">11,500,000</td></tr>
            </tbody>
          </table>
        </Card>
        <Card title="Liabilities & Equity" noPadding>
          <table className="w-full">
            <tbody className="divide-y">
              <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">Current Liabilities</td><td className="px-4 py-2 text-right"></td></tr>
              <tr><td className="px-4 py-2 pl-8">Accounts Payable</td><td className="px-4 py-2 text-right font-mono">850,000</td></tr>
              <tr><td className="px-4 py-2 pl-8">Accrued Expenses</td><td className="px-4 py-2 text-right font-mono">150,000</td></tr>
              <tr className="font-medium"><td className="px-4 py-2 pl-8">Total Current Liabilities</td><td className="px-4 py-2 text-right font-mono">1,000,000</td></tr>
              <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">Long-term Liabilities</td><td className="px-4 py-2 text-right"></td></tr>
              <tr><td className="px-4 py-2 pl-8">Bank Loans</td><td className="px-4 py-2 text-right font-mono">2,000,000</td></tr>
              <tr className="font-medium"><td className="px-4 py-2 pl-8">Total Long-term</td><td className="px-4 py-2 text-right font-mono">2,000,000</td></tr>
              <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">Equity</td><td className="px-4 py-2 text-right"></td></tr>
              <tr><td className="px-4 py-2 pl-8">Capital</td><td className="px-4 py-2 text-right font-mono">7,000,000</td></tr>
              <tr><td className="px-4 py-2 pl-8">Retained Earnings</td><td className="px-4 py-2 text-right font-mono">1,500,000</td></tr>
              <tr className="font-medium"><td className="px-4 py-2 pl-8">Total Equity</td><td className="px-4 py-2 text-right font-mono">8,500,000</td></tr>
              <tr className="bg-primary-50 font-bold text-primary-700"><td className="px-4 py-3">TOTAL LIAB & EQUITY</td><td className="px-4 py-3 text-right font-mono">11,500,000</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

function IncomeStatement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Income Statement</h2><p className="text-secondary-500">January 1 - February 4, 2026</p></div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export PDF</Button>
      </div>
      <Card noPadding>
        <table className="w-full">
          <tbody className="divide-y">
            <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">REVENUE</td><td className="px-4 py-2 text-right"></td></tr>
            <tr><td className="px-4 py-2 pl-8">Interest Income</td><td className="px-4 py-2 text-right font-mono">1,250,000</td></tr>
            <tr><td className="px-4 py-2 pl-8">Fee Income</td><td className="px-4 py-2 text-right font-mono">350,000</td></tr>
            <tr><td className="px-4 py-2 pl-8">Other Income</td><td className="px-4 py-2 text-right font-mono">50,000</td></tr>
            <tr className="font-medium text-green-600"><td className="px-4 py-2 pl-8">Total Revenue</td><td className="px-4 py-2 text-right font-mono">1,650,000</td></tr>
            <tr className="bg-secondary-50 font-medium"><td className="px-4 py-2">EXPENSES</td><td className="px-4 py-2 text-right"></td></tr>
            <tr><td className="px-4 py-2 pl-8">Salaries & Wages</td><td className="px-4 py-2 text-right font-mono">450,000</td></tr>
            <tr><td className="px-4 py-2 pl-8">Rent & Utilities</td><td className="px-4 py-2 text-right font-mono">85,000</td></tr>
            <tr><td className="px-4 py-2 pl-8">Office Expenses</td><td className="px-4 py-2 text-right font-mono">35,000</td></tr>
            <tr><td className="px-4 py-2 pl-8">Depreciation</td><td className="px-4 py-2 text-right font-mono">65,000</td></tr>
            <tr><td className="px-4 py-2 pl-8">Other Expenses</td><td className="px-4 py-2 text-right font-mono">15,000</td></tr>
            <tr className="font-medium text-red-600"><td className="px-4 py-2 pl-8">Total Expenses</td><td className="px-4 py-2 text-right font-mono">650,000</td></tr>
            <tr className="bg-green-50 font-bold text-green-700"><td className="px-4 py-3">NET INCOME</td><td className="px-4 py-3 text-right font-mono">1,000,000</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function TrialBalance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Trial Balance</h2><p className="text-secondary-500">As of February 4, 2026</p></div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
      </div>
      <Card noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Account Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Account Name</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Debit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="px-4 py-2 font-mono">1101</td><td className="px-4 py-2">Cash on Hand</td><td className="px-4 py-2 text-right font-mono">250,000</td><td className="px-4 py-2 text-right">-</td></tr>
            <tr><td className="px-4 py-2 font-mono">1102</td><td className="px-4 py-2">Bank Accounts</td><td className="px-4 py-2 text-right font-mono">3,500,000</td><td className="px-4 py-2 text-right">-</td></tr>
            <tr><td className="px-4 py-2 font-mono">1103</td><td className="px-4 py-2">Accounts Receivable</td><td className="px-4 py-2 text-right font-mono">1,250,000</td><td className="px-4 py-2 text-right">-</td></tr>
            <tr><td className="px-4 py-2 font-mono">1200</td><td className="px-4 py-2">Fixed Assets</td><td className="px-4 py-2 text-right font-mono">8,000,000</td><td className="px-4 py-2 text-right">-</td></tr>
            <tr><td className="px-4 py-2 font-mono">1210</td><td className="px-4 py-2">Accumulated Depreciation</td><td className="px-4 py-2 text-right">-</td><td className="px-4 py-2 text-right font-mono">1,500,000</td></tr>
            <tr><td className="px-4 py-2 font-mono">2101</td><td className="px-4 py-2">Accounts Payable</td><td className="px-4 py-2 text-right">-</td><td className="px-4 py-2 text-right font-mono">850,000</td></tr>
            <tr><td className="px-4 py-2 font-mono">2200</td><td className="px-4 py-2">Bank Loans</td><td className="px-4 py-2 text-right">-</td><td className="px-4 py-2 text-right font-mono">2,000,000</td></tr>
            <tr><td className="px-4 py-2 font-mono">3000</td><td className="px-4 py-2">Capital</td><td className="px-4 py-2 text-right">-</td><td className="px-4 py-2 text-right font-mono">7,000,000</td></tr>
            <tr><td className="px-4 py-2 font-mono">3100</td><td className="px-4 py-2">Retained Earnings</td><td className="px-4 py-2 text-right">-</td><td className="px-4 py-2 text-right font-mono">1,500,000</td></tr>
            <tr><td className="px-4 py-2 font-mono">4000</td><td className="px-4 py-2">Revenue</td><td className="px-4 py-2 text-right">-</td><td className="px-4 py-2 text-right font-mono">1,650,000</td></tr>
            <tr><td className="px-4 py-2 font-mono">5000</td><td className="px-4 py-2">Expenses</td><td className="px-4 py-2 text-right font-mono">1,500,000</td><td className="px-4 py-2 text-right">-</td></tr>
          </tbody>
          <tfoot className="bg-secondary-50 border-t-2">
            <tr className="font-bold"><td colSpan={2} className="px-4 py-3">TOTALS</td><td className="px-4 py-3 text-right font-mono">14,500,000</td><td className="px-4 py-3 text-right font-mono">14,500,000</td></tr>
          </tfoot>
        </table>
      </Card>
    </div>
  )
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-02-04')

  const renderReport = () => {
    switch (selectedReport) {
      case 'balance-sheet': return <BalanceSheet />
      case 'income-statement': return <IncomeStatement />
      case 'trial-balance': return <TrialBalance />
      default: return null
    }
  }

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedReport(null)} className="text-primary-600 hover:text-primary-700 text-sm">← Back to Reports</button>
        {renderReport()}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-secondary-900">Financial Reports</h1><p className="text-secondary-500 mt-1">Generate and export financial reports</p></div>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary-400" /><span className="text-sm text-secondary-600">Report Period:</span></div>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
          <span className="text-secondary-400">to</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
          <Select options={[{ value: 2, label: 'February 2026' }, { value: 1, label: 'January 2026' }]} defaultValue={2} className="w-48" />
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center"><TrendingUp className="w-8 h-8 text-green-500 mx-auto" /><p className="text-2xl font-bold mt-2">LKR 1.65M</p><p className="text-sm text-secondary-500">Total Revenue</p></Card>
        <Card className="text-center"><TrendingDown className="w-8 h-8 text-red-500 mx-auto" /><p className="text-2xl font-bold mt-2">LKR 650K</p><p className="text-sm text-secondary-500">Total Expenses</p></Card>
        <Card className="text-center"><DollarSign className="w-8 h-8 text-primary-500 mx-auto" /><p className="text-2xl font-bold mt-2 text-green-600">LKR 1.0M</p><p className="text-sm text-secondary-500">Net Income</p></Card>
        <Card className="text-center"><PieChart className="w-8 h-8 text-purple-500 mx-auto" /><p className="text-2xl font-bold mt-2">60.6%</p><p className="text-sm text-secondary-500">Profit Margin</p></Card>
      </div>

      {reportCategories.map(category => (
        <Card key={category.id} title={category.name}>
          <div className="grid grid-cols-4 gap-4">
            {category.reports.map(report => (
              <ReportCard key={report.id} report={report} onClick={() => setSelectedReport(report.id)} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
