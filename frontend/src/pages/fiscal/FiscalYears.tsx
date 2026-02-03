import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Calendar, Lock, Unlock, ChevronRight, Edit2, Eye } from 'lucide-react'
import { Button, Card, Modal, Input, Badge } from '../../components/ui'

const mockFiscalYears = [
  { id: 1, yearCode: 'FY2025', yearName: 'Fiscal Year 2025', startDate: '2025-01-01', endDate: '2025-12-31', isClosed: true, isActive: true },
  { id: 2, yearCode: 'FY2026', yearName: 'Fiscal Year 2026', startDate: '2026-01-01', endDate: '2026-12-31', isClosed: false, isActive: true },
]

const mockPeriods = [
  { id: 1, fiscalYearId: 2, periodNumber: 1, periodName: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31', isClosed: true },
  { id: 2, fiscalYearId: 2, periodNumber: 2, periodName: 'February 2026', startDate: '2026-02-01', endDate: '2026-02-28', isClosed: false },
  { id: 3, fiscalYearId: 2, periodNumber: 3, periodName: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31', isClosed: false },
  { id: 4, fiscalYearId: 2, periodNumber: 4, periodName: 'April 2026', startDate: '2026-04-01', endDate: '2026-04-30', isClosed: false },
  { id: 5, fiscalYearId: 2, periodNumber: 5, periodName: 'May 2026', startDate: '2026-05-01', endDate: '2026-05-31', isClosed: false },
  { id: 6, fiscalYearId: 2, periodNumber: 6, periodName: 'June 2026', startDate: '2026-06-01', endDate: '2026-06-30', isClosed: false },
  { id: 7, fiscalYearId: 2, periodNumber: 7, periodName: 'July 2026', startDate: '2026-07-01', endDate: '2026-07-31', isClosed: false },
  { id: 8, fiscalYearId: 2, periodNumber: 8, periodName: 'August 2026', startDate: '2026-08-01', endDate: '2026-08-31', isClosed: false },
  { id: 9, fiscalYearId: 2, periodNumber: 9, periodName: 'September 2026', startDate: '2026-09-01', endDate: '2026-09-30', isClosed: false },
  { id: 10, fiscalYearId: 2, periodNumber: 10, periodName: 'October 2026', startDate: '2026-10-01', endDate: '2026-10-31', isClosed: false },
  { id: 11, fiscalYearId: 2, periodNumber: 11, periodName: 'November 2026', startDate: '2026-11-01', endDate: '2026-11-30', isClosed: false },
  { id: 12, fiscalYearId: 2, periodNumber: 12, periodName: 'December 2026', startDate: '2026-12-01', endDate: '2026-12-31', isClosed: false },
]

function FiscalYearList() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const currentYear = mockFiscalYears.find(y => !y.isClosed)
  const currentPeriod = mockPeriods.find(p => !p.isClosed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-secondary-900">Fiscal Years</h1><p className="text-secondary-500 mt-1">Manage fiscal years and periods</p></div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Fiscal Year</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card><div className="flex items-center gap-4"><Calendar className="w-10 h-10 text-primary-500" /><div><p className="text-sm text-secondary-500">Current Year</p><p className="text-xl font-bold">{currentYear?.yearCode || 'N/A'}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><Calendar className="w-10 h-10 text-green-500" /><div><p className="text-sm text-secondary-500">Current Period</p><p className="text-xl font-bold">{currentPeriod?.periodName || 'N/A'}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><Lock className="w-10 h-10 text-secondary-400" /><div><p className="text-sm text-secondary-500">Closed Periods</p><p className="text-xl font-bold">{mockPeriods.filter(p => p.isClosed).length} / {mockPeriods.length}</p></div></div></Card>
      </div>

      <Card title="Fiscal Years" noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">End Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockFiscalYears.map(year => (
              <tr key={year.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => navigate(`/fiscal/${year.id}`)}>
                <td className="px-4 py-3 font-mono font-medium text-primary-600">{year.yearCode}</td>
                <td className="px-4 py-3 font-medium">{year.yearName}</td>
                <td className="px-4 py-3 text-sm">{year.startDate}</td>
                <td className="px-4 py-3 text-sm">{year.endDate}</td>
                <td className="px-4 py-3 text-center">
                  {year.isClosed ? <Badge variant="default">Closed</Badge> : <Badge variant="success">Open</Badge>}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button className="p-1 hover:bg-secondary-200 rounded"><Eye className="w-4 h-4 text-secondary-500" /></button>
                    {!year.isClosed && <button className="p-1 hover:bg-secondary-200 rounded"><Lock className="w-4 h-4 text-secondary-500" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Fiscal Year" footer={
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button>Create & Generate Periods</Button></div>
      }>
        <div className="space-y-4">
          <Input label="Year Code" placeholder="e.g., FY2027" required />
          <Input label="Year Name" placeholder="e.g., Fiscal Year 2027" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" required />
            <Input label="End Date" type="date" required />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function FiscalYearDetail() {
  const navigate = useNavigate()
  const year = mockFiscalYears[1]
  const periods = mockPeriods.filter(p => p.fiscalYearId === year.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/fiscal')} className="text-primary-600 hover:text-primary-700 text-sm mb-2">← Back to Fiscal Years</button>
          <h1 className="text-2xl font-bold text-secondary-900">{year.yearName}</h1>
          <p className="text-secondary-500">{year.startDate} to {year.endDate}</p>
        </div>
        <div className="flex items-center gap-3">
          {!year.isClosed && <Button variant="danger" leftIcon={<Lock className="w-4 h-4" />}>Close Year</Button>}
          <Button variant="outline" leftIcon={<Edit2 className="w-4 h-4" />}>Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Total Periods</p><p className="text-2xl font-bold">{periods.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Open Periods</p><p className="text-2xl font-bold text-green-600">{periods.filter(p => !p.isClosed).length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Closed Periods</p><p className="text-2xl font-bold text-secondary-500">{periods.filter(p => p.isClosed).length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Year Status</p><Badge variant={year.isClosed ? 'default' : 'success'}>{year.isClosed ? 'Closed' : 'Open'}</Badge></div></Card>
      </div>

      <Card title="Fiscal Periods" noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">End Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {periods.map(period => (
              <tr key={period.id} className="hover:bg-secondary-50">
                <td className="px-4 py-3 text-sm">{period.periodNumber}</td>
                <td className="px-4 py-3 font-medium">{period.periodName}</td>
                <td className="px-4 py-3 text-sm">{period.startDate}</td>
                <td className="px-4 py-3 text-sm">{period.endDate}</td>
                <td className="px-4 py-3 text-center">
                  {period.isClosed ? <Badge variant="default">Closed</Badge> : <Badge variant="success">Open</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  {!period.isClosed ? (
                    <Button variant="outline" size="sm" leftIcon={<Lock className="w-3 h-3" />}>Close Period</Button>
                  ) : (
                    <Button variant="ghost" size="sm" leftIcon={<Unlock className="w-3 h-3" />}>Reopen</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default function FiscalYears() {
  return (
    <Routes>
      <Route index element={<FiscalYearList />} />
      <Route path=":id" element={<FiscalYearDetail />} />
    </Routes>
  )
}
