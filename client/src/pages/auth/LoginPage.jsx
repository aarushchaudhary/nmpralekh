import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const roleRoutes = {
    master: '/master',
    admin: '/admin',
    user: '/faculty',
    super_admin: '/superadmin',
    delete_auth: '/deleteauth',
    mis_coordinator: '/coordinator',
    mis_accumulator: '/accumulator',
    chronicle_master: '/chronicle-dashboard',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      if (user.is_service_admin) {
        navigate('/service-dashboard')
      } else if (user.is_chronicle_master) {
        navigate('/chronicle-dashboard')
      } else {
        navigate(roleRoutes[user.role] || '/login')
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid username or password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Brand Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 p-16 flex-col justify-between relative overflow-hidden border-r-4 border-primary-600">
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-4 h-10 bg-primary-600 rounded-sm"></div>
            <h1 className="text-4xl font-bold text-white tracking-tight">NMPralekh</h1>
          </div>
          <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
            The unified Management Information System Portal for NMIMS University.
          </p>
        </div>
        
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-xl font-medium text-white max-w-md leading-relaxed">
              "Streamlining academic and administrative operations for excellence."
            </p>
            <footer className="text-gray-500 text-sm font-semibold tracking-wider uppercase">NMIMS University</footer>
          </blockquote>
        </div>
      </div>

      {/* Login Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                <div className="w-2.5 h-6 bg-primary-600 rounded-sm"></div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">NMPralekh</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="text-base text-gray-500 mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors border"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors border"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center rounded-md bg-gray-900 px-4 py-3.5 text-sm font-bold text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : 'Sign in to account'}
            </button>
          </form>

          <p className="text-center lg:text-left text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} NMIMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
