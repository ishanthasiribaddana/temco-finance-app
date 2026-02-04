import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Download, Upload, Eye, Edit2, Phone, Mail, MapPin, Building2, Loader2 } from 'lucide-react'
import { Button, Card, Modal, Input, Select, Badge, SearchInput } from '../../components/ui'
import axios from 'axios'

interface Partner {
  id: number
  partnerCode: string
  partnerName: string
  partnerType: 'CUSTOMER' | 'VENDOR' | 'BOTH'
  taxId: string
  creditLimit: number
  paymentTermsDays: number
  email: string
  phone: string
  address?: string
  isActive: boolean
}

const typeColors: Record<string, 'info' | 'success' | 'purple'> = { CUSTOMER: 'info', VENDOR: 'success', BOTH: 'purple' }

function PartnerForm({ partner, onClose }: { partner?: Partner | null; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Partner Code" defaultValue={partner?.partnerCode || 'Auto-generated'} disabled={!!partner} required />
        <Input label="Partner Name" defaultValue={partner?.partnerName} placeholder="Full legal name" required />
        <Select label="Partner Type" options={[{ value: 'CUSTOMER', label: 'Customer' }, { value: 'VENDOR', label: 'Vendor' }, { value: 'BOTH', label: 'Both' }]} defaultValue={partner?.partnerType || 'VENDOR'} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Tax ID" defaultValue={partner?.taxId} placeholder="e.g., TIN-12345678" />
        <Input label="Credit Limit" type="number" defaultValue={partner?.creditLimit} placeholder="0.00" />
        <Input label="Payment Terms (Days)" type="number" defaultValue={partner?.paymentTermsDays || 30} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" defaultValue={partner?.email} placeholder="email@company.com" />
        <Input label="Phone" defaultValue={partner?.phone} placeholder="+94 11 xxx xxxx" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Input label="Address" placeholder="Full business address" />
      </div>
      <Select label="Default Account" options={[{ value: '', label: 'Select default account...' }, { value: 5, label: '1103 - Accounts Receivable' }, { value: 9, label: '2101 - Accounts Payable' }]} />
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button>{partner ? 'Save Changes' : 'Create Partner'}</Button>
      </div>
    </div>
  )
}

function PartnerList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [partnerTypes, setPartnerTypes] = useState<{id: number, typeCode: string, typeName: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const typesRes = await axios.get('/api/partner-types')
        setPartnerTypes(typesRes.data)
      } catch (err) {
        console.error('Failed to fetch partner types:', err)
        setPartnerTypes([
          { id: 1, typeCode: 'CUSTOMER_VENDOR', typeName: 'Customer & Vendor' },
          { id: 2, typeCode: 'MEMBER', typeName: 'Member' },
          { id: 3, typeCode: 'EMPLOYEE', typeName: 'Employee' },
          { id: 4, typeCode: 'LOAN_CUSTOMER', typeName: 'Loan Customer' }
        ])
      }
    }
    fetchTypes()
  }, [])

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true)
      try {
        const url = typeFilter === 'all' ? '/api/partners' : `/api/partners?typeId=${typeFilter}`
        const partnersRes = await axios.get(url)
        setPartners(partnersRes.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch partners:', err)
        setPartners([])
        setError('Failed to load partners from database.')
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [typeFilter])

  const filtered = partners.filter((p: Partner) => {
    const matchesSearch = p.partnerCode.toLowerCase().includes(search.toLowerCase()) || p.partnerName.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <span className="ml-2 text-secondary-500">Loading partners...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-secondary-900">Partners</h1><p className="text-secondary-500 mt-1">Manage customers and vendors</p></div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>Import</Button>
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedPartner(null); setShowModal(true) }}>New Partner</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card onClick={() => setTypeFilter('all')} className="cursor-pointer hover:border-primary-300"><div className="text-center"><p className="text-2xl font-bold text-secondary-900">{partners.length}</p><p className="text-sm text-secondary-500">Total Partners</p></div></Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search partners..." className="w-72" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-secondary-300 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Types</option>
              {partnerTypes.map(type => (
                <option key={type.id} value={type.id}>{type.typeName}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-secondary-500">{filtered.length} partners</span>
        </div>

        <div className="border border-secondary-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Contact</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Credit Limit</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filtered.map(partner => (
                <tr key={partner.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => navigate(`/partners/${partner.id}`)}>
                  <td className="px-4 py-3 font-mono text-sm font-medium text-primary-600">{partner.partnerCode}</td>
                  <td className="px-4 py-3 font-medium">{partner.partnerName}</td>
                  <td className="px-4 py-3 text-sm text-secondary-600">{partner.email}</td>
                  <td className="px-4 py-3 text-right font-mono">LKR {partner.creditLimit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={partner.isActive ? 'success' : 'default'}>{partner.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button className="p-1 hover:bg-secondary-200 rounded"><Eye className="w-4 h-4 text-secondary-500" /></button>
                      <button className="p-1 hover:bg-secondary-200 rounded" onClick={() => { setSelectedPartner(partner); setShowModal(true) }}><Edit2 className="w-4 h-4 text-secondary-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedPartner ? 'Edit Partner' : 'New Partner'} size="lg">
        <PartnerForm partner={selectedPartner} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}

function PartnerDetail() {
  const navigate = useNavigate()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await axios.get('/api/partners')
        if (response.data.length > 0) setPartner(response.data[0])
      } catch (err) {
        console.error('Failed to fetch partner:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPartner()
  }, [])

  if (loading || !partner) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/partners')} className="text-primary-600 hover:text-primary-700 text-sm mb-2">← Back to Partners</button>
          <h1 className="text-2xl font-bold text-secondary-900">{partner.partnerName}</h1>
          <p className="text-secondary-500">{partner.partnerCode} · <Badge variant={typeColors[partner.partnerType]}>{partner.partnerType}</Badge></p>
        </div>
        <Button leftIcon={<Edit2 className="w-4 h-4" />}>Edit Partner</Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Credit Limit</p><p className="text-xl font-bold">LKR {partner.creditLimit.toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Outstanding</p><p className="text-xl font-bold text-red-600">LKR 125,000</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Payment Terms</p><p className="text-xl font-bold">{partner.paymentTermsDays} Days</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-secondary-500">Status</p><Badge variant="success">Active</Badge></div></Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Contact Information">
          <div className="space-y-3">
            <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-secondary-400" /><span>{partner.email}</span></div>
            <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-secondary-400" /><span>{partner.phone}</span></div>
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-secondary-400" /><span>123 Main Street, Colombo 03</span></div>
            <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-secondary-400" /><span>Tax ID: {partner.taxId}</span></div>
          </div>
        </Card>
        <Card title="Recent Transactions" noPadding>
          <table className="w-full">
            <thead className="bg-secondary-50"><tr><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Date</th><th className="px-4 py-2 text-left text-xs font-semibold text-secondary-600">Reference</th><th className="px-4 py-2 text-right text-xs font-semibold text-secondary-600">Amount</th></tr></thead>
            <tbody className="divide-y">
              <tr><td className="px-4 py-2 text-sm">2026-02-04</td><td className="px-4 py-2 text-sm font-mono">PV-2026-0125</td><td className="px-4 py-2 text-right font-mono">125,000</td></tr>
              <tr><td className="px-4 py-2 text-sm">2026-01-28</td><td className="px-4 py-2 text-sm font-mono">PV-2026-0098</td><td className="px-4 py-2 text-right font-mono">85,000</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

export default function Partners() {
  return (
    <Routes>
      <Route index element={<PartnerList />} />
      <Route path=":id" element={<PartnerDetail />} />
    </Routes>
  )
}
