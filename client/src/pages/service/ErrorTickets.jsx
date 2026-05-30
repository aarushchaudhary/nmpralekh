import React, { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_PIPELINE = ['open', 'planning', 'fixing', 'testing', 'closed']

export default function ErrorTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedTicketId, setExpandedTicketId] = useState(null)
    const [ticketDetails, setTicketDetails] = useState({})
    const [loadingDetails, setLoadingDetails] = useState(false)

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            const res = await api.get('/service/tickets/')
            setTickets(res.data.results || res.data)
        } catch (err) {
            console.error("Failed to load tickets", err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await api.post(`/service/tickets/${ticketId}/status/`, { status: newStatus })
            setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
            if (ticketDetails[ticketId]) {
                setTicketDetails({ ...ticketDetails, [ticketId]: { ...ticketDetails[ticketId], status: newStatus } })
            }
        } catch (err) {
            console.error("Failed to update status", err)
            alert("Failed to update status")
        }
    }

    const toggleExpand = async (ticketId) => {
        if (expandedTicketId === ticketId) {
            setExpandedTicketId(null)
            return
        }
        
        setExpandedTicketId(ticketId)
        
        if (!ticketDetails[ticketId]) {
            setLoadingDetails(true)
            try {
                const res = await api.get(`/service/tickets/${ticketId}/`)
                setTicketDetails(prev => ({ ...prev, [ticketId]: res.data }))
            } catch (err) {
                console.error("Failed to load ticket details", err)
            } finally {
                setLoadingDetails(false)
            }
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Automated Error Tickets</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Error Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Source</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Occurrences</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Affected Users</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tickets.map(t => (
                            <React.Fragment key={t.id}>
                                <tr onClick={() => toggleExpand(t.id)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedTicketId === t.id ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold rounded-lg px-2.5 py-1 uppercase tracking-wide border ${
                                                t.status === 'open' ? 'bg-red-50 text-red-700 border-red-200' :
                                                t.status === 'planning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                t.status === 'fixing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                t.status === 'testing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                                {t.status}
                                            </span>
                                            {STATUS_PIPELINE.indexOf(t.status) < STATUS_PIPELINE.length - 1 && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        const idx = STATUS_PIPELINE.indexOf(t.status)
                                                        handleStatusChange(t.id, STATUS_PIPELINE[idx + 1])
                                                    }}
                                                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1"
                                                >
                                                    <span>Move to {STATUS_PIPELINE[STATUS_PIPELINE.indexOf(t.status) + 1]}</span>
                                                    <span>→</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 text-sm max-w-md truncate">{t.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{t.source}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{t.occurrence_count}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{t.affected_users_count}</td>
                                </tr>
                                {expandedTicketId === t.id && (
                                    <tr className="bg-gray-50/50 border-b border-gray-100 shadow-inner">
                                        <td colSpan={5} className="p-0">
                                            <div className="px-8 py-6">
                                                {loadingDetails && !ticketDetails[t.id] ? (
                                                    <div className="flex items-center space-x-2 text-gray-500">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                                        <span className="text-sm">Loading details...</span>
                                                    </div>
                                                ) : ticketDetails[t.id] ? (
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Error Message</h4>
                                                                <p className="mt-1 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-mono whitespace-pre-wrap">{ticketDetails[t.id].error_message}</p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Error Type</h4>
                                                                    <p className="mt-1 text-sm text-gray-900 font-mono">{ticketDetails[t.id].error_type || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL Path</h4>
                                                                    <p className="mt-1 text-sm text-gray-900">{ticketDetails[t.id].url_path || 'N/A'}</p>
                                                                </div>
                                                                {ticketDetails[t.id].api_endpoint && (
                                                                    <>
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">API Endpoint</h4>
                                                                            <p className="mt-1 text-sm text-gray-900 font-mono">{ticketDetails[t.id].api_endpoint}</p>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">HTTP Status</h4>
                                                                            <p className="mt-1 text-sm text-gray-900">{ticketDetails[t.id].http_status || 'N/A'}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stack Trace</h4>
                                                                {ticketDetails[t.id].stack_trace ? (
                                                                    <pre className="text-xs font-mono bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto max-h-48 border border-gray-800">
                                                                        {ticketDetails[t.id].stack_trace}
                                                                    </pre>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 italic">No stack trace available.</p>
                                                                )}
                                                            </div>
                                                            {ticketDetails[t.id].component_stack && (
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Component Stack (React)</h4>
                                                                    <pre className="text-xs font-mono bg-gray-900 text-blue-300 p-4 rounded-lg overflow-x-auto max-h-32 border border-gray-800">
                                                                        {ticketDetails[t.id].component_stack}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-red-500">Failed to load details.</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {tickets.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No error tickets found.</div>
                )}
            </div>
        </div>
    )
}

