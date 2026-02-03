import { useState } from 'react'
import { Plus, ChevronRight, ChevronDown, Edit2, Trash2, Building } from 'lucide-react'
import { Button, Card, Modal, Input, Select, Badge, SearchInput } from '../../components/ui'

const mockRevenueCenters = [
  { id: 1, code: 'HQ', name: 'Head Office', parentId: null, description: 'Main headquarters', isActive: true },
  { id: 2, code: 'BR-COL', name: 'Colombo Branch', parentId: 1, description: 'Colombo main branch', isActive: true },
  { id: 3, code: 'BR-KDY', name: 'Kandy Branch', parentId: 1, description: 'Kandy regional branch', isActive: true },
  { id: 4, code: 'BR-GLE', name: 'Galle Branch', parentId: 1, description: 'Galle regional branch', isActive: true },
  { id: 5, code: 'DEP-FIN', name: 'Finance Department', parentId: 2, description: 'Finance team', isActive: true },
  { id: 6, code: 'DEP-OPS', name: 'Operations Department', parentId: 2, description: 'Operations team', isActive: true },
  { id: 7, code: 'DEP-IT', name: 'IT Department', parentId: 2, description: 'IT support', isActive: false },
]

function RevenueCenterTree({ center, centers, level = 0, onEdit, onDelete }: {
  center: typeof mockRevenueCenters[0]
  centers: typeof mockRevenueCenters
  level?: number
  onEdit: (c: typeof mockRevenueCenters[0]) => void
  onDelete: (c: typeof mockRevenueCenters[0]) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const children = centers.filter(c => c.parentId === center.id)
  const hasChildren = children.length > 0

  return (
    <div>
      <div className={`flex items-center gap-2 py-2 px-3 hover:bg-secondary-50 rounded-lg group ${level === 0 ? 'bg-secondary-50' : ''}`} style={{ paddingLeft: `${level * 24 + 12}px` }}>
        <button onClick={() => setIsExpanded(!isExpanded)} className={`w-5 h-5 flex items-center justify-center ${hasChildren ? 'text-secondary-400' : 'invisible'}`}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <Building className="w-4 h-4 text-secondary-400" />
        <span className="font-mono text-sm text-secondary-600">{center.code}</span>
        <span className={`flex-1 ${level === 0 ? 'font-medium' : ''}`}>{center.name}</span>
        <Badge variant={center.isActive ? 'success' : 'default'} size="sm">{center.isActive ? 'Active' : 'Inactive'}</Badge>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button onClick={() => onEdit(center)} className="p-1 hover:bg-secondary-200 rounded"><Edit2 className="w-4 h-4 text-secondary-500" /></button>
          <button onClick={() => onDelete(center)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
        </div>
      </div>
      {isExpanded && hasChildren && children.map(child => (
        <RevenueCenterTree key={child.id} center={child} centers={centers} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default function RevenueCenters() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<typeof mockRevenueCenters[0] | null>(null)

  const filtered = mockRevenueCenters.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
  const rootCenters = filtered.filter(c => c.parentId === null)

  const handleEdit = (center: typeof mockRevenueCenters[0]) => { setSelectedCenter(center); setShowModal(true) }
  const handleDelete = (center: typeof mockRevenueCenters[0]) => { if (confirm(`Delete "${center.name}"?`)) console.log('Delete:', center.id) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-secondary-900">Revenue Centers</h1><p className="text-secondary-500 mt-1">Manage organizational revenue centers</p></div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedCenter(null); setShowModal(true) }}>New Revenue Center</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-2xl font-bold text-secondary-900">{mockRevenueCenters.length}</p><p className="text-sm text-secondary-500">Total Centers</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-green-600">{mockRevenueCenters.filter(c => c.isActive).length}</p><p className="text-sm text-secondary-500">Active</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-secondary-400">{mockRevenueCenters.filter(c => !c.isActive).length}</p><p className="text-sm text-secondary-500">Inactive</p></div></Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search centers..." className="w-72" />
          <span className="text-sm text-secondary-500">{filtered.length} centers</span>
        </div>
        <div className="border border-secondary-200 rounded-lg divide-y divide-secondary-100">
          <div className="flex items-center gap-2 py-2 px-3 bg-secondary-50 text-xs font-semibold text-secondary-600 uppercase">
            <span className="w-5" /><span className="w-4" /><span className="w-20">Code</span><span className="flex-1">Name</span><span className="w-20">Status</span><span className="w-16">Actions</span>
          </div>
          {rootCenters.map(center => (
            <RevenueCenterTree key={center.id} center={center} centers={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCenter ? 'Edit Revenue Center' : 'New Revenue Center'} footer={
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>{selectedCenter ? 'Save' : 'Create'}</Button></div>
      }>
        <div className="space-y-4">
          <Input label="Center Code" placeholder="e.g., BR-COL" defaultValue={selectedCenter?.code} required />
          <Input label="Center Name" placeholder="e.g., Colombo Branch" defaultValue={selectedCenter?.name} required />
          <Select label="Parent Center" options={[{ value: '', label: '-- No Parent (Root Level) --' }, ...mockRevenueCenters.filter(c => c.id !== selectedCenter?.id).map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))]} defaultValue={selectedCenter?.parentId || ''} />
          <Input label="Description" placeholder="Optional description" defaultValue={selectedCenter?.description} />
        </div>
      </Modal>
    </div>
  )
}
