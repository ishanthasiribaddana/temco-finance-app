import { Shield } from 'lucide-react'

export default function RoleManagement() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Role Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-lg font-semibold text-secondary-900">Manage Roles</h2>
        </div>

        <div className="text-center py-12 text-secondary-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
          <p>Role management features coming soon.</p>
        </div>
      </div>
    </div>
  )
}
