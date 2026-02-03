import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Download, Eye, Edit2, Printer, Send, Check, X, Trash2 } from 'lucide-react'
import { Button, Card, Modal, Input, Select, Badge, SearchInput } from '../../components/ui'

// Mock data
const voucherTypes = [
  { id: 1, code: 'PV', name: 'Payment Voucher' },
  { id: 2, code: 'RV', name: 'Receipt Voucher' },
  { id: 3, code: 'JV', name: 'Journal Voucher' },
  { id: 4, code: 'CV', name: 'Contra Voucher' },
]

const mockVouchers = [
  { id: 1, voucherNumber: 'PV-2026-0125', voucherTypeId: 1, typeName: 'Payment Voucher', voucherDate: '2026-02-04', partnerName: 'ABC Suppliers Ltd', totalAmount: 125000, status: 'APPROVED', paymentMethod: 'CHEQUE', chequeNumber: 'CHQ-4521' },
  { id: 2, voucherNumber: 'RV-2026-0089', voucherTypeId: 2, typeName: 'Receipt Voucher', voucherDate: '2026-02-04', partnerName: 'XYZ Corporation', totalAmount: 75000, status: 'APPROVED', paymentMethod: 'TRANSFER' },
  { id: 3, voucherNumber: 'PV-2026-0124', voucherTypeId: 1, typeName: 'Payment Voucher', voucherDate: '2026-02-03', partnerName: 'Office Mart', totalAmount: 15000, status: 'PENDING', paymentMethod: 'CASH' },
  { id: 4, voucherNumber: 'JV-2026-0045', voucherTypeId: 3, typeName: 'Journal Voucher', voucherDate: '2026-02-02', partnerName: '-', totalAmount: 50000, status: 'DRAFT' },
  { id: 5, voucherNumber: 'RV-2026-0088', voucherTypeId: 2, typeName: 'Receipt Voucher', voucherDate: '2026-02-01', partnerName: 'Member #1234', totalAmount: 25000, status: 'REJECTED', paymentMethod: 'CASH' },
]

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'danger' | 'info'> = {
  DRAFT: 'default',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  POSTED: 'info'
}

const mockAccounts = [
  { id: 3, code: '1101', name: 'Cash on Hand' },
  { id: 4, code: '1102', name: 'Bank Accounts' },
  { id: 5, code: '1103', name: 'Accounts Receivable' },
  { id: 9, code: '2101', name: 'Accounts Payable' },
]

const mockPartners = [
  { id: 1, code: 'V001', name: 'ABC Suppliers Ltd', type: 'VENDOR' },
  { id: 2, code: 'C001', name: 'XYZ Corporation', type: 'CUSTOMER' },
  { id: 3, code: 'V002', name: 'Office Mart', type: 'VENDOR' },
]

// Voucher Form
function VoucherForm({ voucher, onClose }: { voucher?: typeof mockVouchers[0] | null; onClose: () => void }) {
  const [lines, setLines] = useState([
    { lineNumber: 1, accountId: 0, type: 'DEBIT', amount: 0, description: '' },
    { lineNumber: 2, accountId: 0, type: 'CREDIT', amount: 0, description: '' }
  ])

  const addLine = () => setLines([...lines, { lineNumber: lines.length + 1, accountId: 0, type: 'DEBIT', amount: 0, description: '' }])
  const removeLine = (index: number) => lines.length > 2 && setLines(lines.filter((_, i) => i !== index))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Select
          label="Voucher Type"
          options={voucherTypes.map(t => ({ value: t.id, label: t.name }))}
          required
        />
        <Input label="Voucher Number" defaultValue={voucher?.voucherNumber || 'Auto-generated'} disabled />
        <Input label="Voucher Date" type="date" defaultValue={voucher?.voucherDate || new Date().toISOString().split('T')[0]} required />
        <Select
          label="Fiscal Period"
          options={[
            { value: 2, label: 'February 2026' },
            { value: 1, label: 'January 2026' }
          ]}
          defaultValue={2}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Partner"
          placeholder="Select partner..."
          options={mockPartners.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
        />
        <Select
          label="Payment Method"
          options={[
            { value: 'CASH', label: 'Cash' },
            { value: 'CHEQUE', label: 'Cheque' },
            { value: 'TRANSFER', label: 'Bank Transfer' },
            { value: 'OTHER', label: 'Other' }
          ]}
        />
        <Input label="Reference Number" placeholder="e.g., INV-001" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="Cheque Number" placeholder="If payment by cheque" />
        <Input label="Due Date" type="date" />
        <Input label="Description" placeholder="Voucher description" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-secondary-900">Line Items</h4>
          <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addLine}>Add Line</Button>
        </div>

        <div className="border border-secondary-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-600 uppercase w-12">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-600 uppercase">Account</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-600 uppercase w-28">Type</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-secondary-600 uppercase w-36">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-secondary-600 uppercase">Description</th>
                <th className="px-3 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {lines.map((line, index) => (
                <tr key={index} className="bg-white">
                  <td className="px-3 py-2 text-sm text-secondary-500">{index + 1}</td>
                  <td className="px-3 py-2">
                    <select className="w-full text-sm border border-secondary-300 rounded px-2 py-1.5">
                      <option value="">Select account...</option>
                      {mockAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select className="w-full text-sm border border-secondary-300 rounded px-2 py-1.5" defaultValue={line.type}>
                      <option value="DEBIT">Debit</option>
                      <option value="CREDIT">Credit</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" className="w-full text-sm text-right border border-secondary-300 rounded px-2 py-1.5" placeholder="0.00" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="text" className="w-full text-sm border border-secondary-300 rounded px-2 py-1.5" placeholder="Description" />
                  </td>
                  <td className="px-3 py-2">
                    {lines.length > 2 && (
                      <button onClick={() => removeLine(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="secondary">Save as Draft</Button>
        <Button>Submit for Approval</Button>
      </div>
    </div>
  )
}

// Voucher List
function VoucherList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredVouchers = mockVouchers.filter(v => {
    const matchesSearch = v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.partnerName.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || v.voucherTypeId.toString() === typeFilter
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Vouchers</h1>
          <p className="text-secondary-500 mt-1">Manage payment, receipt, and journal vouchers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Voucher</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {voucherTypes.map(type => {
          const count = mockVouchers.filter(v => v.voucherTypeId === type.id).length
          return (
            <Card key={type.id} className="cursor-pointer hover:border-primary-300" onClick={() => setTypeFilter(type.id.toString())}>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-900">{count}</p>
                <p className="text-sm text-secondary-500">{type.name}s</p>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search vouchers..." className="w-72" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-secondary-300 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Types</option>
              {voucherTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-secondary-300 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <span className="text-sm text-secondary-500">{filteredVouchers.length} vouchers</span>
        </div>

        <div className="border border-secondary-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Voucher #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Partner</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredVouchers.map(voucher => (
                <tr key={voucher.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => navigate(`/vouchers/${voucher.id}`)}>
                  <td className="px-4 py-3 font-mono text-sm font-medium text-primary-600">{voucher.voucherNumber}</td>
                  <td className="px-4 py-3 text-sm">{voucher.typeName}</td>
                  <td className="px-4 py-3 text-sm">{voucher.voucherDate}</td>
                  <td className="px-4 py-3 text-sm">{voucher.partnerName}</td>
                  <td className="px-4 py-3 text-right font-mono">LKR {voucher.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusColors[voucher.status]}>{voucher.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button className="p-1 hover:bg-secondary-200 rounded"><Eye className="w-4 h-4 text-secondary-500" /></button>
                      <button className="p-1 hover:bg-secondary-200 rounded"><Printer className="w-4 h-4 text-secondary-500" /></button>
                      {voucher.status === 'DRAFT' && (
                        <button className="p-1 hover:bg-secondary-200 rounded"><Edit2 className="w-4 h-4 text-secondary-500" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Voucher" size="full">
        <VoucherForm onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}

// Voucher Detail
function VoucherDetail() {
  const navigate = useNavigate()
  const voucher = mockVouchers[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/vouchers')} className="text-primary-600 hover:text-primary-700 text-sm mb-2">← Back to Vouchers</button>
          <h1 className="text-2xl font-bold text-secondary-900">{voucher.voucherNumber}</h1>
          <p className="text-secondary-500">{voucher.typeName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />}>Print</Button>
          {voucher.status === 'PENDING' && (
            <>
              <Button variant="danger" leftIcon={<X className="w-4 h-4" />}>Reject</Button>
              <Button variant="success" leftIcon={<Check className="w-4 h-4" />}>Approve</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-secondary-500">Amount</p>
            <p className="text-2xl font-bold text-secondary-900">LKR {voucher.totalAmount.toLocaleString()}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-secondary-500">Date</p>
            <p className="text-lg font-semibold">{voucher.voucherDate}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-secondary-500">Payment Method</p>
            <Badge variant="info">{voucher.paymentMethod}</Badge>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-secondary-500">Status</p>
            <Badge variant={statusColors[voucher.status]}>{voucher.status}</Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Voucher Details">
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="text-secondary-500">Partner</dt><dd className="font-medium">{voucher.partnerName}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-500">Cheque #</dt><dd className="font-mono">{voucher.chequeNumber || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-500">Fiscal Period</dt><dd>February 2026</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-500">Created By</dt><dd>Admin User</dd></div>
          </dl>
        </Card>

        <Card title="Approval History">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-secondary-500">Feb 4, 2026 2:30 PM</span>
              <span>Approved by <strong>Finance Manager</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-secondary-500">Feb 4, 2026 10:00 AM</span>
              <span>Submitted for approval by <strong>Admin User</strong></span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Line Items" noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Account</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Debit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="px-4 py-3">1</td><td className="px-4 py-3"><span className="font-mono">2101</span> - Accounts Payable</td><td className="px-4 py-3 text-secondary-600">Payment to supplier</td><td className="px-4 py-3 text-right font-mono">125,000.00</td><td className="px-4 py-3 text-right text-secondary-400">-</td></tr>
            <tr><td className="px-4 py-3">2</td><td className="px-4 py-3"><span className="font-mono">1102</span> - Bank Accounts</td><td className="px-4 py-3 text-secondary-600">Cheque payment</td><td className="px-4 py-3 text-right text-secondary-400">-</td><td className="px-4 py-3 text-right font-mono">125,000.00</td></tr>
          </tbody>
          <tfoot className="bg-secondary-50 border-t-2">
            <tr><td colSpan={3} className="px-4 py-3 text-right font-semibold">Totals:</td><td className="px-4 py-3 text-right font-mono font-semibold">125,000.00</td><td className="px-4 py-3 text-right font-mono font-semibold">125,000.00</td></tr>
          </tfoot>
        </table>
      </Card>
    </div>
  )
}

// Pending Approvals
function VoucherApprovals() {
  const pendingVouchers = mockVouchers.filter(v => v.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Voucher Approvals</h1>
        <p className="text-secondary-500 mt-1">Review and approve pending vouchers</p>
      </div>

      <Card noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Voucher #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Partner</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Submitted By</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pendingVouchers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-secondary-500">No pending approvals</td></tr>
            ) : pendingVouchers.map(v => (
              <tr key={v.id} className="hover:bg-secondary-50">
                <td className="px-4 py-3 font-mono text-sm font-medium">{v.voucherNumber}</td>
                <td className="px-4 py-3 text-sm">{v.typeName}</td>
                <td className="px-4 py-3 text-sm">{v.partnerName}</td>
                <td className="px-4 py-3 text-right font-mono">LKR {v.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">Admin User</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>View</Button>
                    <Button variant="danger" size="sm" leftIcon={<X className="w-3 h-3" />}>Reject</Button>
                    <Button variant="success" size="sm" leftIcon={<Check className="w-3 h-3" />}>Approve</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// Voucher Types Management
function VoucherTypes() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Voucher Types</h1>
          <p className="text-secondary-500 mt-1">Manage voucher type definitions</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Type</Button>
      </div>

      <Card noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Name</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Voucher Count</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {voucherTypes.map(type => (
              <tr key={type.id} className="hover:bg-secondary-50">
                <td className="px-4 py-3 font-mono font-medium">{type.code}</td>
                <td className="px-4 py-3">{type.name}</td>
                <td className="px-4 py-3 text-center">{mockVouchers.filter(v => v.voucherTypeId === type.id).length}</td>
                <td className="px-4 py-3 text-center"><Badge variant="success">Active</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 hover:bg-secondary-200 rounded"><Edit2 className="w-4 h-4 text-secondary-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Voucher Type" footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={() => setShowModal(false)}>Create Type</Button>
        </div>
      }>
        <div className="space-y-4">
          <Input label="Type Code" placeholder="e.g., PV" required />
          <Input label="Type Name" placeholder="e.g., Payment Voucher" required />
          <Input label="Prefix" placeholder="e.g., PV-" hint="Used in voucher number generation" />
        </div>
      </Modal>
    </div>
  )
}

// Main Router
export default function Vouchers() {
  return (
    <Routes>
      <Route index element={<VoucherList />} />
      <Route path="approvals" element={<VoucherApprovals />} />
      <Route path="types" element={<VoucherTypes />} />
      <Route path=":id" element={<VoucherDetail />} />
    </Routes>
  )
}
