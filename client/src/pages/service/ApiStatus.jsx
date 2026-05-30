import { useState, useEffect } from 'react'
import { ServerIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import api from '../../api/axios'

export default function ApiStatus() {
    const [statuses, setStatuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedCategory, setExpandedCategory] = useState(null)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/service/api-status/')
                setStatuses(res.data)
                setError(null)
            } catch (err) {
                console.error("Failed to load API status", err)
                setError("Unable to connect to the monitoring server. The system might be completely offline.")
                // If it fails, assume everything is offline
                setStatuses([
                    { name: 'Accounts API', status: 'Offline' },
                    { name: 'Records API', status: 'Offline' },
                    { name: 'Export API', status: 'Offline' },
                    { name: 'Schools API', status: 'Offline' },
                    { name: 'Audit API', status: 'Offline' },
                    { name: 'Service API', status: 'Offline' }
                ])
            } finally {
                setLoading(false)
            }
        }
        
        fetchStatus()
        
        // Poll every 30 seconds
        const interval = setInterval(fetchStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Online':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />
            case 'Facing Issues':
                return <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
            case 'Offline':
            default:
                return <XCircleIcon className="w-6 h-6 text-red-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Online':
                return 'border-green-100 bg-green-50/50'
            case 'Facing Issues':
                return 'border-amber-100 bg-amber-50/50'
            case 'Offline':
            default:
                return 'border-red-100 bg-red-50/50'
        }
    }

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'Online':
                return 'text-green-700'
            case 'Facing Issues':
                return 'text-amber-700'
            case 'Offline':
            default:
                return 'text-red-700'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API Health Status</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time monitoring of all core API services.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-800">Connection Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statuses.map((apiItem, index) => {
                    const isExpanded = expandedCategory === apiItem.name;
                    return (
                    <div 
                        key={index} 
                        className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer ${getStatusColor(apiItem.status)} ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
                        onClick={() => setExpandedCategory(isExpanded ? null : apiItem.name)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white shadow-sm border border-gray-100">
                                <ServerIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex flex-col items-end">
                                {getStatusIcon(apiItem.status)}
                                <span className="text-xs text-gray-500 mt-2 opacity-70">
                                    {isExpanded ? 'Click to collapse' : 'Click to expand'}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{apiItem.name}</h2>
                            <p className={`text-sm font-semibold mt-1 ${getStatusTextColor(apiItem.status)}`}>
                                {apiItem.status}
                            </p>
                        </div>
                        
                        {isExpanded && apiItem.endpoints && (
                            <div className="mt-6 pt-6 border-t border-gray-200/50">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Endpoints Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {apiItem.endpoints.map((ep, idx) => (
                                        <div key={idx} className="group flex items-center justify-between bg-white/60 p-3 rounded-lg border border-white/40 shadow-sm hover:bg-white transition-colors relative">
                                            <div className="flex-1 min-w-0 mr-3 flex items-center">
                                                <span className="text-sm font-mono text-gray-700 truncate" title={ep.path}>
                                                    {ep.path}
                                                </span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(ep.path);
                                                        // Simple temporary visual feedback could go here
                                                    }}
                                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex-shrink-0"
                                                    title="Copy API Path"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {getStatusIcon(ep.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )})}
            </div>
            
            <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Legend</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600"><strong>Online:</strong> Fully operational with no active error tickets.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-gray-600"><strong>Facing Issues:</strong> Operational, but there are active unresolved error tickets.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-600"><strong>Offline:</strong> Service is completely unreachable or database is down.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
