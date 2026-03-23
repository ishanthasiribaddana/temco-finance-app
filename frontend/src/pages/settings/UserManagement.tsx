import { useState, useEffect } from 'react'
import { Users, ChevronDown, ChevronRight, Mail, Key, Copy, RefreshCw, X, Check, Search, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const SUPER_ADMIN_ROLE_ID = 10

interface Partner {
  id: number
  partnerCode: string
  partnerName: string
  email: string
  mobile: string
  isActive: boolean
}

interface PartnerGroup {
  typeId: number
  typeCode: string
  typeName: string
  partnerCount: number
  partners: Partner[]
}

export default function UserManagement() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<PartnerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  
  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check access on mount - try permission API first, fallback to roleId
  useEffect(() => {
    checkAccess()
  }, [user])

  useEffect(() => {
    if (hasAccess) {
      fetchPartners()
    } else if (hasAccess === false) {
      setLoading(false)
    }
  }, [hasAccess])

  const checkAccess = async () => {
    // Check if any of the user's roles is Super Admin
    const isSuperAdmin = user?.roles?.some((r) => r.roleId === SUPER_ADMIN_ROLE_ID)
    if (isSuperAdmin) {
      setHasAccess(true)
      return
    }
    
    // Try task permission API as fallback
    try {
      const res = await axios.get('/api/permissions/check/USER_MANAGEMENT')
      if (res.data.success && res.data.permissions?.canView) {
        setHasAccess(true)
        return
      }
    } catch (err) {
      // API failed, use role check only
    }
    
    setHasAccess(false)
  }

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get('/api/admin/partners')
      if (res.data.success) {
        setGroups(res.data.data)
        // Expand all groups by default
        const allIds = new Set<number>(res.data.data.map((g: PartnerGroup) => g.typeId))
        setExpandedGroups(allIds)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const toggleGroup = (typeId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(typeId)) {
        newSet.delete(typeId)
      } else {
        newSet.add(typeId)
      }
      return newSet
    })
  }

  const handleSendResetLink = async (partner: Partner) => {
    try {
      const res = await axios.post(`/api/admin/partners/${partner.id}/send-reset-link`)
      alert(res.data.message || 'Reset link sent!')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send reset link')
    }
  }

  const openPasswordModal = async (partner: Partner) => {
    setSelectedPartner(partner)
    setShowPasswordModal(true)
    setPasswordCopied(false)
    setPasswordMessage(null)
    await generateNewPassword()
  }

  const generateNewPassword = async () => {
    try {
      const res = await axios.get('/api/admin/generate-password')
      if (res.data.success) {
        setGeneratedPassword(res.data.password)
        setPasswordCopied(false)
      }
    } catch (err) {
      setGeneratedPassword('')
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setPasswordCopied(true)
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  const setPasswordForPartner = async () => {
    if (!selectedPartner || !generatedPassword) return
    
    setSettingPassword(true)
    setPasswordMessage(null)
    
    try {
      const res = await axios.post(`/api/admin/partners/${selectedPartner.id}/set-password`, {
        password: generatedPassword
      })
      
      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'Password set successfully! Share it securely with the user.' })
      } else {
        setPasswordMessage({ type: 'error', text: res.data.message || 'Failed to set password' })
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Failed to set password' })
    } finally {
      setSettingPassword(false)
    }
  }

  const filteredGroups = groups.map(group => ({
    ...group,
    partners: group.partners.filter(p =>
      p.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partnerCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(g => g.partners.length > 0 || searchTerm === '')

  // Show loading while checking access
  if (hasAccess === null) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">User Management</h1>
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary-500">Checking access...</p>
        </div>
      </div>
    )
  }

  // Show access denied if no access
  if (!hasAccess) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">User Management</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-yellow-700 font-medium">Access Denied</p>
          <p className="text-yellow-600 text-sm mt-2">Only Super Admin can access User Management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">User Management</h1>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by name, email, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary-500">Loading partners...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchPartners} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map(group => (
            <div key={group.typeId} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.typeId)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center">
                  {expandedGroups.has(group.typeId) ? (
                    <ChevronDown className="w-5 h-5 text-secondary-400 mr-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-secondary-400 mr-2" />
                  )}
                  <Users className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-secondary-900">{group.typeName}</span>
                </div>
                <span className="text-sm text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full">
                  {group.partnerCount} partners
                </span>
              </button>

              {/* Partners List */}
              {expandedGroups.has(group.typeId) && (
                <div className="border-t border-secondary-200">
                  {group.partners.length === 0 ? (
                    <div className="p-4 text-center text-secondary-500 text-sm">
                      No partners in this category
                    </div>
                  ) : (
                    <div className="divide-y divide-secondary-100">
                      {group.partners.map(partner => (
                        <div key={partner.id} className="flex items-center justify-between p-4 hover:bg-secondary-50">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-secondary-900 truncate">{partner.partnerName}</p>
                            <p className="text-sm text-secondary-500 truncate">{partner.email || 'No email'}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="text-xs text-secondary-400 hidden sm:inline">{partner.partnerCode}</span>
                            
                            {/* Reset Actions Dropdown */}
                            <div className="relative group">
                              <button className="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center">
                                <Key className="w-4 h-4 mr-1" />
                                Reset
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </button>
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10 hidden group-hover:block">
                                <button
                                  onClick={() => handleSendResetLink(partner)}
                                  className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Reset Link
                                </button>
                                <button
                                  onClick={() => openPasswordModal(partner)}
                                  className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                >
                                  <Key className="w-4 h-4 mr-2" />
                                  Generate Password
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Password Generation Modal */}
      {showPasswordModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900">
                Generate Password for {selectedPartner.partnerName}
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-secondary-400 hover:text-secondary-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {passwordMessage && (
                <div className={`flex items-center p-3 mb-4 rounded-lg ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Generated Password (12 characters)
              </label>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={generatedPassword}
                  className="flex-1 px-4 py-2 bg-secondary-50 border border-secondary-300 rounded-lg font-mono text-lg"
                />
                <button
                  onClick={copyPassword}
                  className={`p-2 rounded-lg transition-colors ${
                    passwordCopied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                  title="Copy to clipboard"
                >
                  {passwordCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  onClick={generateNewPassword}
                  className="p-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200"
                  title="Generate new password"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-700">
                  ⚠️ This password will be set immediately. Share it securely with the user.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-4 border-t border-secondary-200">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={setPasswordForPartner}
                disabled={settingPassword || !generatedPassword}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {settingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Setting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Set Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
