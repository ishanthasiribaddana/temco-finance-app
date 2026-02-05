import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Download, Upload, Eye, Edit2, Phone, Mail, MapPin, Building2, Loader2, ChevronLeft, ChevronRight, Search, CheckCircle, User, AlertCircle } from 'lucide-react'
import { Button, Card, Modal, Input, Badge, SearchInput } from '../../components/ui'
import axios from 'axios'

interface Partner {
  id: number
  partnerCode: string
  partnerName: string
  partnerType: 'CUSTOMER' | 'VENDOR' | 'BOTH'
  nic: string
  taxId: string
  creditLimit: number
  paymentTermsDays: number
  email: string
  phone: string
  address?: string
  isActive: boolean
}

const typeColors: Record<string, 'info' | 'success' | 'purple'> = { CUSTOMER: 'info', VENDOR: 'success', BOTH: 'purple' }

interface VerifiedUser {
  userProfileId: number
  fullName: string
  nic: string
  phone: string
  email: string
}

function PartnerForm({ partner, onClose, partnerTypes, onSuccess }: { 
  partner?: Partner | null; 
  onClose: () => void;
  partnerTypes: {id: number, typeCode: string, typeName: string}[];
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState(1)
  const [nic, setNic] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  const handleVerify = async () => {
    if (!nic.trim()) {
      setError('Please enter a NIC number')
      return
    }
    setVerifying(true)
    setError(null)
    try {
      const res = await axios.get(`/api/lookup-by-nic/${nic.trim()}`)
      setVerifiedUser(res.data)
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify NIC')
      setVerifiedUser(null)
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one partner type')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await axios.post('/api/partners', {
        userProfileId: verifiedUser?.userProfileId,
        partnerTypes: selectedTypes
      })
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create partner')
    } finally {
      setSaving(false)
    }
  }

  const toggleType = (typeId: number) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    )
  }

  // Edit mode - show original form
  if (partner) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Partner Code" defaultValue={partner.partnerCode} disabled required />
          <Input label="Partner Name" defaultValue={partner.partnerName} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" type="email" defaultValue={partner.email} />
          <Input label="Phone" defaultValue={partner.phone} />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-500'
            }`}>{s}</div>
            {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-primary-500' : 'bg-secondary-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Step 1: Enter NIC */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <User className="w-12 h-12 mx-auto text-secondary-400 mb-2" />
            <h3 className="text-lg font-medium">Enter NIC Number</h3>
            <p className="text-sm text-secondary-500">We'll verify the person's details</p>
          </div>
          <Input 
            label="NIC Number" 
            value={nic} 
            onChange={(e) => setNic(e.target.value)}
            placeholder="e.g., 199012345678 or 901234567V"
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleVerify} disabled={verifying}>
              {verifying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</> : <><Search className="w-4 h-4 mr-2" /> Verify</>}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Verification */}
      {step === 2 && verifiedUser && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <h3 className="text-lg font-medium">Person Verified</h3>
            <p className="text-sm text-secondary-500">Please confirm the details below</p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary-500">Name</span>
              <span className="font-medium">{verifiedUser.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">NIC</span>
              <span className="font-mono">{verifiedUser.nic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Contact</span>
              <span>{verifiedUser.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Email</span>
              <span>{verifiedUser.email || '-'}</span>
            </div>
          </div>
          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { setStep(1); setVerifiedUser(null); setError(null); }}>Back</Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Partner Types */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">Select Partner Type(s)</h3>
            <p className="text-sm text-secondary-500">Choose one or more types for {verifiedUser?.fullName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {partnerTypes.map(type => (
              <label 
                key={type.id} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTypes.includes(type.id) 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => toggleType(type.id)}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <span className="font-medium">{type.typeName}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleSave} disabled={saving || selectedTypes.length === 0}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Partner'}
            </Button>
          </div>
        </div>
      )}
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
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

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

  const refreshPartners = () => {
    setLoading(true)
    const url = typeFilter === 'all' ? '/api/partners' : `/api/partners?typeId=${typeFilter}`
    axios.get(url).then(res => {
      setPartners(res.data)
      setError(null)
    }).catch(() => {
      setError('Failed to load partners')
    }).finally(() => setLoading(false))
  }

  const filtered = partners.filter((p: Partner) => {
    const matchesSearch = p.partnerCode.toLowerCase().includes(search.toLowerCase()) || p.partnerName.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPartners = filtered.slice(startIndex, startIndex + pageSize)

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter])

  // Skeleton loading component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-6 mx-auto"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-24"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-28"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-32"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-28"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-36"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-20 ml-auto"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-16 mx-auto"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-secondary-200 rounded w-12 ml-auto"></div></td>
    </tr>
  )

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
          <span className="text-sm text-secondary-500">Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} partners</span>
        </div>

        <div className="border border-secondary-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">NIC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Email</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Credit Limit</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginatedPartners.map((partner, index) => (
                <tr key={partner.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => navigate(`/partners/${partner.id}`)}>
                  <td className="px-4 py-3 text-center text-sm text-secondary-500">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 font-mono text-sm font-medium text-primary-600">{partner.partnerCode}</td>
                  <td className="px-4 py-3 text-sm text-secondary-600">{partner.nic}</td>
                  <td className="px-4 py-3 font-medium">{partner.partnerName}</td>
                  <td className="px-4 py-3 text-sm text-secondary-600">{partner.phone}</td>
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

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-secondary-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg ${currentPage === pageNum ? 'bg-primary-500 text-white' : 'hover:bg-secondary-100'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedPartner ? 'Edit Partner' : 'New Partner'} size="lg">
        <PartnerForm partner={selectedPartner} onClose={() => setShowModal(false)} partnerTypes={partnerTypes} onSuccess={refreshPartners} />
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
