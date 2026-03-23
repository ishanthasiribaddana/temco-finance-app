import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Temco Bank Logo Component
const TemcoLogo = () => (
  <div className="flex flex-col items-center">
    <div className="relative w-20 h-20 mb-2">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-temco-yellow via-temco-pink to-temco-blue flex items-center justify-center">
          <span className="text-2xl font-black text-white drop-shadow-lg">TB</span>
        </div>
      </div>
    </div>
    <h1 className="text-2xl font-bold tracking-wide">
      <span className="text-temco-blue">TEM</span>
      <span className="text-temco-pink">C</span>
      <span className="text-temco-yellow">O</span>
    </h1>
    <p className="text-xs text-secondary-500 mt-1">අපිට අපේම බැංකුවක්</p>
  </div>
)

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-temco-blue/10 via-temco-pink/5 to-temco-yellow/10 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-t-4 border-temco-blue">
        <div className="text-center mb-6">
          <TemcoLogo />
          <h2 className="text-xl font-semibold text-secondary-800 mt-4">Welcome Back</h2>
          <p className="text-secondary-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Username / Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-temco-blue text-white font-medium rounded-lg hover:bg-temco-blue/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-secondary-500 mt-6">
          Don't have an account? <Link to="/signup" className="text-temco-blue font-medium hover:underline">Sign up</Link>
        </p>

        <p className="text-xs text-secondary-400 text-center mt-6">© 2026 Temco Bank. All rights reserved.</p>
      </div>
    </div>
  )
}
