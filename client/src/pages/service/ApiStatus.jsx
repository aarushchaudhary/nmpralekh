import { useState, useEffect } from 'react'
import { ServerIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'

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

    // Status is carried by the label; icon shape and brand tone only reinforce it
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Online':
                return <CheckCircleIcon aria-hidden="true" className="w-4 h-4 text-gray-800" />
            case 'Facing Issues':
                return <ExclamationTriangleIcon aria-hidden="true" className="w-4 h-4 text-gray-500" />
            case 'Offline':
            default:
                return <XCircleIcon aria-hidden="true" className="w-4 h-4 text-primary-600" />
        }
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Online':
                return 'dark'
            case 'Facing Issues':
                return 'outline'
            case 'Offline':
            default:
                return 'red'
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
            <PageHeader
                title="API Health Status"
                subtitle="Real-time monitoring of all core API services."
            />

            {error && (
                <div className="px-3 py-2 bg-primary-50 border border-primary-200 border-l-4 border-l-primary-600 rounded-md flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-primary-800">Connection Error</p>
                        <p className="text-sm text-primary-800 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statuses.map((apiItem, index) => {
                    const isExpanded = expandedCategory === apiItem.name;
                    return (
                    <div 
                        key={index} 
                        className={`p-4 bg-white rounded-md border border-gray-200 transition-colors hover:border-gray-300 cursor-pointer ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
                        onClick={() => setExpandedCategory(isExpanded ? null : apiItem.name)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                <ServerIcon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex flex-col items-end">
                                {getStatusIcon(apiItem.status)}
                                <span className="text-xs text-gray-500 mt-1.5">
                                    {isExpanded ? 'Click to collapse' : 'Click to expand'}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">{apiItem.name}</h2>
                            <div className="mt-1.5">
                                <Badge label={apiItem.status} color={getStatusBadgeColor(apiItem.status)} />
                            </div>
                        </div>
                        
                        {isExpanded && apiItem.endpoints && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Endpoints Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {apiItem.endpoints.map((ep, idx) => (
                                        <div key={idx} className="group flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors relative">
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
                                                    className="ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-md text-gray-600 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                                                    title="Copy API Path"
                                                >
                                                    <ClipboardIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {getStatusIcon(ep.status)}
                                                <Badge label={ep.status} color={getStatusBadgeColor(ep.status)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )})}
            </div>
            
            <Panel title="Status Legend">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                        <CheckCircleIcon aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-gray-800" />
                        <span className="text-sm text-gray-600"><strong className="text-gray-800">Online:</strong> Fully operational with no active error tickets.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                        <span className="text-sm text-gray-600"><strong className="text-gray-800">Facing Issues:</strong> Operational, but there are active unresolved error tickets.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <XCircleIcon aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-primary-600" />
                        <span className="text-sm text-gray-600"><strong className="text-gray-800">Offline:</strong> Service is completely unreachable or database is down.</span>
                    </div>
                </div>
            </Panel>
        </div>
    )
}
