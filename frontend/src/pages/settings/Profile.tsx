import { User, Mail, CreditCard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-secondary-900">{user?.fullName || 'User'}</h2>
            <p className="text-sm text-secondary-500">Super Admin</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center p-4 bg-secondary-50 rounded-lg">
            <Mail className="w-5 h-5 text-secondary-400 mr-3" />
            <div>
              <p className="text-xs text-secondary-500">Email</p>
              <p className="text-sm font-medium text-secondary-900">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-secondary-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-secondary-400 mr-3" />
            <div>
              <p className="text-xs text-secondary-500">NIC</p>
              <p className="text-sm font-medium text-secondary-900">{user?.nic || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
