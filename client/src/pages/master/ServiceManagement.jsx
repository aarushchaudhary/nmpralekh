import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function ServiceManagement() {
    const [exists, setExists] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ type: '', text: '' })
    
    // Form fields
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await api.get('/users/master/service-user/')
            setExists(res.data.exists)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch service user status.' })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })
        try {
            await api.post('/users/master/service-user/', { username, email, password })
            setMessage({ type: 'success', text: 'Service user created successfully.' })
            setExists(true)
            setPassword('')
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create user.' })
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })
        try {
            await api.patch('/users/master/service-user/', { password })
            setMessage({ type: 'success', text: 'Password updated successfully.' })
            setPassword('')
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update password.' })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage the single Service Admin account.
                </p>
            </div>
            
            {message.text && (
                <div className={`p-4 mb-6 rounded-lg text-sm border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {!exists ? (
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Create Service Admin</h2>
                            <p className="text-sm text-gray-500 mt-1">This will permanently lock the service account identity.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input 
                                type="text" 
                                required
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="Enter service username"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent transition-all placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                required
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter service email"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent transition-all placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password" 
                                required
                                minLength="8"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter strong password (min 8 characters)"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent transition-all placeholder-gray-400"
                            />
                        </div>
                        
                        <div className="pt-2">
                            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-50 text-sm font-medium transition-all">
                                Create Account
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Update Password</h2>
                            <p className="text-sm text-gray-500 mt-1">The Service Admin account identity is locked. You can only reset their password.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                required
                                minLength="8"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter new strong password"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent transition-all placeholder-gray-400"
                            />
                        </div>
                        
                        <div className="pt-2">
                            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-50 text-sm font-medium transition-all">
                                Update Password
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
