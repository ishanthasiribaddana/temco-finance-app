import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Download, Check, Eye, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button, Card, Modal, Input, Select, Badge } from '../../components/ui'

const mockReconciliations = [
  { id: 1, reconciliationNumber: 'BR-2026-0012', bankAccountName: 'Commercial Bank - Current', statementDate: '2026-01-31', statementBalance: 2500000, bookBalance: 2485000, adjustedBalance: 2500000, status: 'COMPLETED', periodName: 'January 2026' },
  { id: 2, reconciliationNumber: 'BR-2026-0013', bankAccountName: 'Commercial Bank - Current', statementDate: '2026-02-28', statementBalance: 3200000, bookBalance: 3150000, adjustedBalance: null, status: 'IN_PROGRESS', periodName: 'February 2026' },
  { id: 3, reconciliationNumber: 'BR-2026-0011', bankAccountName: 'BOC Savings Account', statementDate: '2026-01-31', statementBalance: 850000, bookBalance: 850000, adjustedBalance: 850000, status: 'APPROVED', periodName: 'January 2026' },
]

const mockItems = [
  { id: 1, itemType: 'OUTSTANDING_CHEQUE', referenceNumber: 'CHQ-4521', transactionDate: '2026-02-25', amount: 25000, description: 'Payment to ABC Suppliers', isCleared: false },
  { id: 2, itemType: 'OUTSTANDING_CHEQUE', referenceNumber: 'CHQ-4522', transactionDate: '2026-02-27', amount: 15000, description: 'Office supplies', isCleared: false },
  { id: 3, itemType: 'DEPOSIT_IN_TRANSIT', referenceNumber: 'DEP-0089', transactionDate: '2026-02-28', amount: 40000, description: 'Customer payment', isCleared: false },
  { id: 4, itemType: 'BANK_CHARGE', referenceNumber: 'BC-FEB', transactionDate: '2026-02-28', amount: 500, description: 'Monthly bank charges', isCleared: true },
]

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'info'> = { DRAFT: 'default', IN_PROGRESS: 'warning', COMPLETED: 'success', APPROVED: 'info' }
const itemTypeLabels: Record<string, string> = { OUTSTANDING_CHEQUE: 'Outstanding Cheque', DEPOSIT_IN_TRANSIT: 'Deposit in Transit', BANK_CHARGE: 'Bank Charge', BANK_INTEREST: 'Bank Interest', ERROR: 'Error', OTHER: 'Other' }

function ReconciliationList() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-secondary-900">Bank Reconciliation</h1><p className="text-secondary-500 mt-1">Reconcile bank statements with book records</p></div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Reconciliation</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-2xl font-bold text-secondary-900">{mockReconciliations.length}</p><p className="text-sm text-secondary-500">Total</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-yellow-600">{mockReconciliations.filter(r => r.status === 'IN_PROGRESS').length}</p><p className="text-sm text-secondary-500">In Progress</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-green-600">{mockReconciliations.filter(r => r.status === 'COMPLETED').length}</p><p className="text-sm text-secondary-500">Completed</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-blue-600">{mockReconciliations.filter(r => r.status === 'APPROVED').length}</p><p className="text-sm text-secondary-500">Approved</p></div></Card>
      </div>

      <Card noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Recon #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Bank Account</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Period</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Statement Bal.</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Book Bal.</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Difference</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockReconciliations.map(recon => {
              const diff = recon.statementBalance - recon.bookBalance
              return (
                <tr key={recon.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => navigate(`/reconciliation/${recon.id}`)}>
                  <td className="px-4 py-3 font-mono text-sm font-medium text-primary-600">{recon.reconciliationNumber}</td>
                  <td className="px-4 py-3">{recon.bankAccountName}</td>
                  <td className="px-4 py-3 text-sm">{recon.periodName}</td>
                  <td className="px-4 py-3 text-right font-mono">{recon.statementBalance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">{recon.bookBalance.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-mono ${diff === 0 ? 'text-green-600' : 'text-red-600'}`}>{diff === 0 ? '0' : diff.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={statusColors[recon.status]}>{recon.status.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 hover:bg-secondary-200 rounded"><Eye className="w-4 h-4 text-secondary-500" /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Bank Reconciliation" footer={
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Start Reconciliation</Button></div>
      }>
        <div className="space-y-4">
          <Select label="Bank Account" options={[{ value: 1, label: 'Commercial Bank - Current' }, { value: 2, label: 'BOC Savings Account' }]} required />
          <Select label="Fiscal Period" options={[{ value: 2, label: 'February 2026' }, { value: 3, label: 'March 2026' }]} required />
          <Input label="Statement Date" type="date" required />
          <Input label="Statement Balance" type="number" placeholder="0.00" required />
        </div>
      </Modal>
    </div>
  )
}

function ReconciliationDetail() {
  const navigate = useNavigate()
  const recon = mockReconciliations[1]
  const outstandingCheques = mockItems.filter(i => i.itemType === 'OUTSTANDING_CHEQUE' && !i.isCleared)
  const depositsInTransit = mockItems.filter(i => i.itemType === 'DEPOSIT_IN_TRANSIT' && !i.isCleared)
  const adjustments = mockItems.filter(i => ['BANK_CHARGE', 'BANK_INTEREST', 'ERROR', 'OTHER'].includes(i.itemType))

  const totalOutstanding = outstandingCheques.reduce((sum, i) => sum + i.amount, 0)
  const totalDeposits = depositsInTransit.reduce((sum, i) => sum + i.amount, 0)
  const adjustedBookBalance = recon.bookBalance - totalOutstanding + totalDeposits

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/reconciliation')} className="text-primary-600 hover:text-primary-700 text-sm mb-2">← Back to Reconciliations</button>
          <h1 className="text-2xl font-bold text-secondary-900">{recon.reconciliationNumber}</h1>
          <p className="text-secondary-500">{recon.bankAccountName} · {recon.periodName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
          {recon.status === 'IN_PROGRESS' && <Button variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Complete</Button>}
          {recon.status === 'COMPLETED' && <Button variant="success" leftIcon={<Check className="w-4 h-4" />}>Approve</Button>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Statement Balance</p><p className="text-xl font-bold font-mono">LKR {recon.statementBalance.toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Book Balance</p><p className="text-xl font-bold font-mono">LKR {recon.bookBalance.toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Adjusted Balance</p><p className="text-xl font-bold font-mono">LKR {adjustedBookBalance.toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Difference</p><p className={`text-xl font-bold font-mono ${recon.statementBalance === adjustedBookBalance ? 'text-green-600' : 'text-red-600'}`}>{recon.statementBalance === adjustedBookBalance ? <><CheckCircle2 className="w-5 h-5 inline" /> Balanced</> : <><AlertCircle className="w-5 h-5 inline" /> {(recon.statementBalance - adjustedBookBalance).toLocaleString()}</>}</p></div></Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Outstanding Cheques" subtitle={`Total: LKR ${totalOutstanding.toLocaleString()}`} noPadding>
          <table className="w-full">
            <thead className="bg-secondary-50"><tr><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Ref #</th><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Date</th><th className="px-4 py-2 text-right text-xs font-semibold text-secondary-600">Amount</th><th className="px-4 py-2 w-16"></th></tr></thead>
            <tbody className="divide-y">
              {outstandingCheques.map(item => (
                <tr key={item.id}><td className="px-4 py-2 font-mono text-sm">{item.referenceNumber}</td><td className="px-4 py-2 text-sm">{item.transactionDate}</td><td className="px-4 py-2 text-right font-mono">{item.amount.toLocaleString()}</td><td className="px-4 py-2"><button className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button></td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Deposits in Transit" subtitle={`Total: LKR ${totalDeposits.toLocaleString()}`} noPadding>
          <table className="w-full">
            <thead className="bg-secondary-50"><tr><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Ref #</th><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Date</th><th className="px-4 py-2 text-right text-xs font-semibold text-secondary-600">Amount</th><th className="px-4 py-2 w-16"></th></tr></thead>
            <tbody className="divide-y">
              {depositsInTransit.map(item => (
                <tr key={item.id}><td className="px-4 py-2 font-mono text-sm">{item.referenceNumber}</td><td className="px-4 py-2 text-sm">{item.transactionDate}</td><td className="px-4 py-2 text-right font-mono">{item.amount.toLocaleString()}</td><td className="px-4 py-2"><button className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button></td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Adjustments" headerAction={<Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add</Button>} noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50"><tr><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Type</th><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Ref</th><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Description</th><th className="px-4 py-2 text-right text-xs font-semibold text-secondary-600">Amount</th></tr></thead>
          <tbody className="divide-y">
            {adjustments.map(item => (
              <tr key={item.id}><td className="px-4 py-2"><Badge size="sm">{itemTypeLabels[item.itemType]}</Badge></td><td className="px-4 py-2 font-mono text-sm">{item.referenceNumber}</td><td className="px-4 py-2 text-sm">{item.description}</td><td className="px-4 py-2 text-right font-mono">{item.amount.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default function BankReconciliation() {
  return (
    <Routes>
      <Route index element={<ReconciliationList />} />
      <Route path=":id" element={<ReconciliationDetail />} />
    </Routes>
  )
}
