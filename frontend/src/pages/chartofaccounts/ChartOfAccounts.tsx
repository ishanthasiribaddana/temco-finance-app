import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Download, Upload, Filter, ChevronRight, ChevronDown, Edit2, Trash2, Eye } from 'lucide-react'
import { Button, Card, Modal, Input, Select, Badge, SearchInput } from '../../components/ui'
import type { ChartOfAccount, AccountCategory } from '../../types'

// Mock data
const mockCategories: AccountCategory[] = [
  { id: 1, categoryCode: 'ASSET', categoryName: 'Assets', normalBalance: 'DEBIT', displayOrder: 1, isActive: true },
  { id: 2, categoryCode: 'LIAB', categoryName: 'Liabilities', normalBalance: 'CREDIT', displayOrder: 2, isActive: true },
  { id: 3, categoryCode: 'EQUITY', categoryName: 'Equity', normalBalance: 'CREDIT', displayOrder: 3, isActive: true },
  { id: 4, categoryCode: 'REV', categoryName: 'Revenue', normalBalance: 'CREDIT', displayOrder: 4, isActive: true },
  { id: 5, categoryCode: 'EXP', categoryName: 'Expenses', normalBalance: 'DEBIT', displayOrder: 5, isActive: true },
]

const mockAccounts: ChartOfAccount[] = [
  { id: 1, accountCode: '1000', accountName: 'ASSETS', parentId: null, accountCategoryId: 1, accountLevel: 1, isHeader: true, isPosting: false, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 2, accountCode: '1100', accountName: 'Current Assets', parentId: 1, accountCategoryId: 1, accountLevel: 2, isHeader: true, isPosting: false, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 3, accountCode: '1101', accountName: 'Cash on Hand', parentId: 2, accountCategoryId: 1, accountLevel: 3, isHeader: false, isPosting: true, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 4, accountCode: '1102', accountName: 'Bank Accounts', parentId: 2, accountCategoryId: 1, accountLevel: 3, isHeader: false, isPosting: true, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 5, accountCode: '1103', accountName: 'Accounts Receivable', parentId: 2, accountCategoryId: 1, accountLevel: 3, isHeader: false, isPosting: true, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 6, accountCode: '1200', accountName: 'Fixed Assets', parentId: 1, accountCategoryId: 1, accountLevel: 2, isHeader: true, isPosting: false, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 7, accountCode: '2000', accountName: 'LIABILITIES', parentId: null, accountCategoryId: 2, accountLevel: 1, isHeader: true, isPosting: false, normalBalance: 'CREDIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 8, accountCode: '2100', accountName: 'Current Liabilities', parentId: 7, accountCategoryId: 2, accountLevel: 2, isHeader: true, isPosting: false, normalBalance: 'CREDIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 9, accountCode: '2101', accountName: 'Accounts Payable', parentId: 8, accountCategoryId: 2, accountLevel: 3, isHeader: false, isPosting: true, normalBalance: 'CREDIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 10, accountCode: '3000', accountName: 'EQUITY', parentId: null, accountCategoryId: 3, accountLevel: 1, isHeader: true, isPosting: false, normalBalance: 'CREDIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 11, accountCode: '4000', accountName: 'REVENUE', parentId: null, accountCategoryId: 4, accountLevel: 1, isHeader: true, isPosting: false, normalBalance: 'CREDIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
  { id: 12, accountCode: '5000', accountName: 'EXPENSES', parentId: null, accountCategoryId: 5, accountLevel: 1, isHeader: true, isPosting: false, normalBalance: 'DEBIT', isActive: true, isSystem: true, createdAt: '2026-01-01' },
]

// Tree Item Component
function AccountTreeItem({ account, accounts, level = 0, onEdit, onDelete, onView }: {
  account: ChartOfAccount
  accounts: ChartOfAccount[]
  level?: number
  onEdit: (acc: ChartOfAccount) => void
  onDelete: (acc: ChartOfAccount) => void
  onView: (acc: ChartOfAccount) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const children = accounts.filter(a => a.parentId === account.id)
  const hasChildren = children.length > 0

  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-2 px-3 hover:bg-secondary-50 rounded-lg group transition-colors ${level === 0 ? 'bg-secondary-50' : ''}`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 flex items-center justify-center ${hasChildren ? 'text-secondary-400' : 'invisible'}`}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        <span className={`font-mono text-sm ${account.isHeader ? 'font-semibold text-secondary-700' : 'text-secondary-600'}`}>
          {account.accountCode}
        </span>
        
        <span className={`flex-1 ${account.isHeader ? 'font-medium text-secondary-900' : 'text-secondary-700'}`}>
          {account.accountName}
        </span>

        <Badge variant={account.normalBalance === 'DEBIT' ? 'info' : 'success'} size="sm">
          {account.normalBalance}
        </Badge>

        {account.isPosting && (
          <Badge variant="purple" size="sm">Posting</Badge>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button onClick={() => onView(account)} className="p-1 hover:bg-secondary-200 rounded">
            <Eye className="w-4 h-4 text-secondary-500" />
          </button>
          {!account.isSystem && (
            <>
              <button onClick={() => onEdit(account)} className="p-1 hover:bg-secondary-200 rounded">
                <Edit2 className="w-4 h-4 text-secondary-500" />
              </button>
              <button onClick={() => onDelete(account)} className="p-1 hover:bg-red-100 rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <AccountTreeItem
              key={child.id}
              account={child}
              accounts={accounts}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Account Form Modal
function AccountFormModal({ isOpen, onClose, account, parentAccounts }: {
  isOpen: boolean
  onClose: () => void
  account?: ChartOfAccount | null
  parentAccounts: ChartOfAccount[]
}) {
  const isEditing = !!account

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Account' : 'New Account'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>{isEditing ? 'Save Changes' : 'Create Account'}</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Account Code"
          placeholder="e.g., 1104"
          defaultValue={account?.accountCode}
          required
        />
        <Input
          label="Account Name"
          placeholder="e.g., Petty Cash"
          defaultValue={account?.accountName}
          required
        />
        <Select
          label="Account Category"
          options={mockCategories.map(c => ({ value: c.id, label: c.categoryName }))}
          defaultValue={account?.accountCategoryId}
          required
        />
        <Select
          label="Parent Account"
          options={[
            { value: '', label: '-- No Parent (Root Level) --' },
            ...parentAccounts.filter(a => a.isHeader).map(a => ({ value: a.id, label: `${a.accountCode} - ${a.accountName}` }))
          ]}
          defaultValue={account?.parentId || ''}
        />
        <Select
          label="Normal Balance"
          options={[
            { value: 'DEBIT', label: 'Debit' },
            { value: 'CREDIT', label: 'Credit' }
          ]}
          defaultValue={account?.normalBalance || 'DEBIT'}
          required
        />
        <Select
          label="Account Type"
          options={[
            { value: 'posting', label: 'Posting Account' },
            { value: 'header', label: 'Header Account' }
          ]}
          defaultValue={account?.isPosting ? 'posting' : 'header'}
          required
        />
        <div className="col-span-2">
          <Input
            label="Description"
            placeholder="Optional description for this account"
            defaultValue={account?.description}
          />
        </div>
      </div>
    </Modal>
  )
}

// Main Chart of Accounts List
function ChartOfAccountsList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null)
  const [viewType, setViewType] = useState<'tree' | 'flat'>('tree')

  const filteredAccounts = mockAccounts.filter(a => 
    a.accountCode.toLowerCase().includes(search.toLowerCase()) ||
    a.accountName.toLowerCase().includes(search.toLowerCase())
  )

  const rootAccounts = filteredAccounts.filter(a => a.parentId === null)

  const handleEdit = (account: ChartOfAccount) => {
    setSelectedAccount(account)
    setShowModal(true)
  }

  const handleDelete = (account: ChartOfAccount) => {
    if (confirm(`Are you sure you want to delete "${account.accountName}"?`)) {
      console.log('Delete:', account.id)
    }
  }

  const handleView = (account: ChartOfAccount) => {
    navigate(`/chart-of-accounts/${account.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Chart of Accounts</h1>
          <p className="text-secondary-500 mt-1">Manage your organization's account structure</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>Import</Button>
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedAccount(null); setShowModal(true) }}>
            New Account
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search accounts..."
              className="w-72"
            />
            <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>
          <div className="flex items-center gap-2 bg-secondary-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('tree')}
              className={`px-3 py-1 text-sm rounded ${viewType === 'tree' ? 'bg-white shadow-sm' : ''}`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewType('flat')}
              className={`px-3 py-1 text-sm rounded ${viewType === 'flat' ? 'bg-white shadow-sm' : ''}`}
            >
              Flat View
            </button>
          </div>
        </div>

        <div className="border border-secondary-200 rounded-lg divide-y divide-secondary-100">
          <div className="flex items-center gap-2 py-2 px-3 bg-secondary-50 text-xs font-semibold text-secondary-600 uppercase">
            <span className="w-5" />
            <span className="w-24">Code</span>
            <span className="flex-1">Account Name</span>
            <span className="w-20">Balance</span>
            <span className="w-20">Type</span>
            <span className="w-24">Actions</span>
          </div>
          {viewType === 'tree' ? (
            rootAccounts.map(account => (
              <AccountTreeItem
                key={account.id}
                account={account}
                accounts={filteredAccounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))
          ) : (
            filteredAccounts.map(account => (
              <div key={account.id} className="flex items-center gap-2 py-2 px-3 hover:bg-secondary-50">
                <span className="w-5" />
                <span className="w-24 font-mono text-sm">{account.accountCode}</span>
                <span className="flex-1">{account.accountName}</span>
                <Badge variant={account.normalBalance === 'DEBIT' ? 'info' : 'success'} size="sm">
                  {account.normalBalance}
                </Badge>
                {account.isPosting && <Badge variant="purple" size="sm">Posting</Badge>}
                <div className="w-24 flex gap-1">
                  <button onClick={() => handleView(account)} className="p-1 hover:bg-secondary-200 rounded">
                    <Eye className="w-4 h-4 text-secondary-500" />
                  </button>
                  <button onClick={() => handleEdit(account)} className="p-1 hover:bg-secondary-200 rounded">
                    <Edit2 className="w-4 h-4 text-secondary-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-sm text-secondary-500">
          Showing {filteredAccounts.length} accounts
        </div>
      </Card>

      <AccountFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        account={selectedAccount}
        parentAccounts={mockAccounts}
      />
    </div>
  )
}

// Account Detail View
function AccountDetail() {
  const navigate = useNavigate()
  const account = mockAccounts[2] // Mock - would use useParams

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/chart-of-accounts')} className="text-primary-600 hover:text-primary-700 text-sm mb-2">
            ← Back to Chart of Accounts
          </button>
          <h1 className="text-2xl font-bold text-secondary-900">{account.accountCode} - {account.accountName}</h1>
        </div>
        <Button leftIcon={<Edit2 className="w-4 h-4" />}>Edit Account</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card title="Account Information">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-secondary-500">Account Code</dt>
              <dd className="font-mono font-medium">{account.accountCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-500">Account Name</dt>
              <dd className="font-medium">{account.accountName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-500">Category</dt>
              <dd><Badge>Assets</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-500">Normal Balance</dt>
              <dd><Badge variant="info">{account.normalBalance}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-500">Type</dt>
              <dd><Badge variant="purple">{account.isPosting ? 'Posting' : 'Header'}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-500">Status</dt>
              <dd><Badge variant="success">Active</Badge></dd>
            </div>
          </dl>
        </Card>

        <Card title="Current Balance" className="col-span-2">
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-secondary-900">LKR 1,250,000.00</p>
            <p className="text-secondary-500 mt-2">As of February 4, 2026</p>
          </div>
        </Card>
      </div>

      <Card title="Recent Transactions" noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Reference</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Debit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Credit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-secondary-50">
              <td className="px-4 py-3 text-sm">2026-02-04</td>
              <td className="px-4 py-3 text-sm font-mono">JE-2026-0042</td>
              <td className="px-4 py-3 text-sm">Cash deposit from customer</td>
              <td className="px-4 py-3 text-sm text-right font-mono">50,000.00</td>
              <td className="px-4 py-3 text-sm text-right font-mono">-</td>
              <td className="px-4 py-3 text-sm text-right font-mono font-medium">1,250,000.00</td>
            </tr>
            <tr className="hover:bg-secondary-50">
              <td className="px-4 py-3 text-sm">2026-02-03</td>
              <td className="px-4 py-3 text-sm font-mono">JE-2026-0041</td>
              <td className="px-4 py-3 text-sm">Payment to vendor</td>
              <td className="px-4 py-3 text-sm text-right font-mono">-</td>
              <td className="px-4 py-3 text-sm text-right font-mono">25,000.00</td>
              <td className="px-4 py-3 text-sm text-right font-mono font-medium">1,200,000.00</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// Categories Management
function AccountCategories() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Account Categories</h1>
          <p className="text-secondary-500 mt-1">Manage account category types</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          New Category
        </Button>
      </div>

      <Card noPadding>
        <table className="w-full">
          <thead className="bg-secondary-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Normal Balance</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Order</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockCategories.map(cat => (
              <tr key={cat.id} className="hover:bg-secondary-50">
                <td className="px-4 py-3 font-mono text-sm">{cat.categoryCode}</td>
                <td className="px-4 py-3 font-medium">{cat.categoryName}</td>
                <td className="px-4 py-3">
                  <Badge variant={cat.normalBalance === 'DEBIT' ? 'info' : 'success'}>{cat.normalBalance}</Badge>
                </td>
                <td className="px-4 py-3 text-center">{cat.displayOrder}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 hover:bg-secondary-200 rounded">
                    <Edit2 className="w-4 h-4 text-secondary-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Account Category"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => setShowModal(false)}>Create Category</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Category Code" placeholder="e.g., ASSET" required />
          <Input label="Category Name" placeholder="e.g., Assets" required />
          <Select
            label="Normal Balance"
            options={[
              { value: 'DEBIT', label: 'Debit' },
              { value: 'CREDIT', label: 'Credit' }
            ]}
            required
          />
          <Input label="Display Order" type="number" defaultValue="1" />
        </div>
      </Modal>
    </div>
  )
}

// Main Router Component
export default function ChartOfAccounts() {
  return (
    <Routes>
      <Route index element={<ChartOfAccountsList />} />
      <Route path="categories" element={<AccountCategories />} />
      <Route path=":id" element={<AccountDetail />} />
    </Routes>
  )
}
