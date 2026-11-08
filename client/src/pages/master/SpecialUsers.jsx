import { useState, useEffect, useCallback, useId } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Panel from '../../components/ui/Panel'
import Button from '../../components/ui/Button'
import FormError from '../../components/ui/FormError'

const inputClass = 'w-full h-9 px-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-md transition-colors ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

function SpecialUserCard({ title, apiEndpoint, lockMessage }) {
    const [exists, setExists] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ type: '', text: '' })
    const uid = useId()
    
    // Form fields
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const fetchStatus = useCallback(async () => {
        try {
            const res = await api.get(apiEndpoint)
            setExists(res.data.exists)
        } catch {
            setMessage({ type: 'error', text: `Failed to fetch status.` })
        } finally {
            setLoading(false)
        }
    }, [apiEndpoint])

    useEffect(() => { fetchStatus() }, [fetchStatus])

    const handleCreate = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })
        try {
            await api.post(apiEndpoint, { username, email, password })
            setMessage({ type: 'success', text: `${title} created successfully.` })
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
            await api.patch(apiEndpoint, { password })
            setMessage({ type: 'success', text: 'Password updated successfully.' })
            setPassword('')
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update password.' })
        }
    }

    if (loading) {
        return (
            <Panel className="h-full">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                </div>
            </Panel>
        )
    }

    return (
        <Panel
            className="h-full"
            title={exists ? `Update Password for ${title}` : `Create ${title}`}
            description={exists ? 'The account identity is locked. You can only reset the password.' : lockMessage}
        >
            {message.text && (
                <div className="mb-4">
                    {message.type === 'error' ? (
                        <FormError message={message.text} />
                    ) : (
                        <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                            {message.text}
                        </p>
                    )}
                </div>
            )}

            {!exists ? (
                <form onSubmit={handleCreate} className="space-y-4">
                    
                    <div>
                        <label htmlFor={`${uid}-username`} className="block text-sm font-medium text-gray-800 mb-1">Username</label>
                        <input id={`${uid}-username`}
                            type="text" 
                            required
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder={`Enter username`}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${uid}-email`} className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                        <input id={`${uid}-email`}
                            type="email" 
                            required
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder={`Enter email`}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${uid}-password`} className="block text-sm font-medium text-gray-800 mb-1">Password</label>
                        <input id={`${uid}-password`}
                            type="password" 
                            required
                            minLength="8"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter strong password (min 8 characters)"
                            className={inputClass}
                        />
                    </div>
                    
                    <div className="pt-2">
                        <Button type="submit" className="w-full sm:w-auto">
                            Create Account
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                    
                    <div>
                        <label htmlFor={`${uid}-new-password`} className="block text-sm font-medium text-gray-800 mb-1">New Password</label>
                        <input id={`${uid}-new-password`}
                            type="password" 
                            required
                            minLength="8"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter new strong password"
                            className={inputClass}
                        />
                    </div>
                    
                    <div className="pt-2">
                        <Button type="submit" className="w-full sm:w-auto">
                            Update Password
                        </Button>
                    </div>
                </form>
            )}
        </Panel>
    )
}

export default function SpecialUsers() {
    return (
        <div>
            <PageHeader
                title="Special Users"
                subtitle="Manage system-level singular accounts."
            />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SpecialUserCard 
                    title="Service Admin" 
                    description="Manage the single Service Admin account."
                    apiEndpoint="/users/master/service-user/"
                    lockMessage="This will permanently lock the service account identity."
                />
                <SpecialUserCard 
                    title="Chronicle Master" 
                    description="Manage the single Chronicle Master account."
                    apiEndpoint="/users/master/chronicle-master/"
                    lockMessage="This will permanently lock the chronicle master account identity."
                />
            </div>
        </div>
    )
}
