import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle, AlertCircle, Search, ArrowLeft } from 'lucide-react'
import axios from 'axios'

// Build: 2026-02-05-v2 - Password fields enabled
// Temco Bank Logo Component
const TemcoLogo = () => (
  <div className="flex flex-col items-center">
    <div className="relative w-20 h-20 mb-2">
      {/* Stylized TB Logo */}
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

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [nic, setNic] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [registering, setRegistering] = useState(false)
  const [success, setSuccess] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')

  const handleCheckNic = async () => {
    if (!nic.trim()) {
      setError('Please enter your NIC number')
      return
    }
    
    setChecking(true)
    setError(null)
    
    try {
      const res = await axios.get(`/api/check-nic/${nic.trim()}`)
      if (res.data.exists) {
        setError('This NIC is already registered. Please login instead.')
      } else {
        setStep(2)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify NIC')
    } finally {
      setChecking(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setError('All fields are required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setRegistering(true)
    setError(null)
    
    try {
      const res = await axios.post('/api/signup', {
        nic: nic.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      })
      setMaskedEmail(res.data.message)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  // Auto-redirect to login after successful registration
  const [countdown, setCountdown] = useState(5)
  
  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate('/login')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [success, navigate])

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-temco-blue/10 via-temco-pink/5 to-temco-yellow/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center border-t-4 border-temco-blue">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Registration Successful!</h2>
          <p className="text-secondary-600 mb-6">{maskedEmail}</p>
          <p className="text-sm text-secondary-500 mb-6">
            Please check your email for your temporary password and login to continue.
          </p>
          <p className="text-sm text-temco-blue mb-4">
            Redirecting to login in {countdown} seconds...
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-temco-blue text-white py-3 rounded-lg hover:bg-temco-blue/90 transition-colors font-medium"
          >
            Go to Login Now
          </button>
          <p className="text-xs text-secondary-400 mt-6">© 2026 Temco Bank. All rights reserved.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-temco-blue/10 via-temco-pink/5 to-temco-yellow/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-t-4 border-temco-blue">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <TemcoLogo />
          <h2 className="text-xl font-semibold text-secondary-800 mt-4">User Registration</h2>
          <p className="text-secondary-500 text-sm mt-1">
            {step === 1 ? 'Enter your NIC to get started' : 'Complete your profile'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step >= 1 ? 'bg-temco-blue text-white' : 'bg-secondary-200 text-secondary-500'
          }`}>1</div>
          <div className={`w-12 h-1 transition-colors ${step > 1 ? 'bg-temco-yellow' : 'bg-secondary-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step >= 2 ? 'bg-temco-blue text-white' : 'bg-secondary-200 text-secondary-500'
          }`}>2</div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Check NIC */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">NIC Number</label>
              <input
                type="text"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="e.g., 199501234567 or 951234567V"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleCheckNic}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 bg-temco-blue text-white py-3 rounded-lg hover:bg-temco-blue/90 transition-colors font-medium disabled:opacity-50"
            >
              {checking ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
              ) : (
                <><Search className="w-4 h-4" /> Check NIC</>
              )}
            </button>
            <p className="text-center text-sm text-secondary-500">
              Already registered? <Link to="/login" className="text-temco-blue font-medium hover:underline">Login here</Link>
            </p>
          </div>
        )}

        {/* Step 2: Enter Details */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">NIC Number</label>
              <input
                type="text"
                value={nic}
                disabled
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">First Name <span className="text-temco-pink">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name <span className="text-temco-pink">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Email <span className="text-temco-pink">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@email.com"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Password <span className="text-temco-pink">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm Password <span className="text-temco-pink">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-temco-blue/30 focus:border-temco-blue outline-none transition-colors"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setError(null); }}
                className="flex items-center justify-center gap-1 px-4 py-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={registering}
                className="flex-1 flex items-center justify-center gap-2 bg-temco-blue text-white py-3 rounded-lg hover:bg-temco-blue/90 transition-colors font-medium disabled:opacity-50"
              >
                {registering ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-secondary-400 text-center mt-6">© 2026 Temco Bank. All rights reserved.</p>
      </div>
    </div>
  )
}
