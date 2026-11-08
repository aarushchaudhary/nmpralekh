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

  const inputClass = 'block w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

  return (
    <div className="min-h-screen flex bg-white">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[42%] bg-gray-800 flex-col justify-between p-12 border-t-4 border-primary-600">
        <div className="flex items-center gap-3">
          <span className="w-2 h-9 bg-primary-600" aria-hidden="true" />
          <div className="leading-tight">
            <p className="text-2xl font-semibold text-white">NMPralekh</p>
            <p className="text-sm text-gray-400">Management Information System</p>
          </div>
        </div>
        <div>
          <p className="text-base text-gray-300 max-w-sm leading-relaxed">
            Records, approvals and MIS reports for every NMIMS campus and school, in one place.
          </p>
          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-gray-400">NMIMS University</p>
        </div>
      </div>

      {/* Sign-in form */}
      <main className="w-full lg:w-[58%] flex items-center justify-center px-6 py-12 border-t-4 border-primary-600 lg:border-t-0">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <span className="w-1.5 h-7 bg-primary-600" aria-hidden="true" />
            <p className="text-xl font-semibold text-gray-900">NMPralekh</p>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-600">Use your NMPralekh username and password.</p>

          {error && (
            <div className="mt-6 px-3 py-2.5 bg-primary-50 border border-primary-200 border-l-4 border-l-primary-600 rounded-md text-sm text-primary-800" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-primary-600 text-sm font-medium text-white hover:bg-primary-700
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-10 text-xs text-gray-500">
            &copy; {new Date().getFullYear()} NMIMS. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
