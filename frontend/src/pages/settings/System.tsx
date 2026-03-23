import { Cog } from 'lucide-react'

export default function System() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">System Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center mb-6">
          <Cog className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-lg font-semibold text-secondary-900">System Configuration</h2>
        </div>

        <div className="text-center py-12 text-secondary-500">
          <Cog className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
          <p>System settings coming soon.</p>
        </div>
      </div>
    </div>
  )
}
