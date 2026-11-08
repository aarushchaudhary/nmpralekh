import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import FormError from '../../components/ui/FormError'
import PageHeader from '../../components/ui/PageHeader'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const STATUS_PIPELINE = ['open', 'planning', 'fixing', 'testing', 'closed']

// open = needs attention, planning/fixing/testing = in progress, closed = done
const STATUS_BADGE = { open: 'red', planning: 'outline', fixing: 'outline', testing: 'outline', closed: 'dark' }
const statusLabel = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

export default function ErrorTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [pageError, setPageError] = useState('')
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
            setPageError('')
            setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
            if (ticketDetails[ticketId]) {
                setTicketDetails({ ...ticketDetails, [ticketId]: { ...ticketDetails[ticketId], status: newStatus } })
            }
        } catch (err) {
            setPageError(err.response?.data?.detail || "Failed to update status")
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
            <PageHeader title="Automated Error Tickets" />
            <FormError message={pageError} />

            <Panel padded={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Status</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Error Title</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Source</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap text-right">Occurrences</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap text-right">Affected Users</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tickets.map(t => (
                            <React.Fragment key={t.id}>
                                <tr onClick={() => toggleExpand(t.id)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedTicketId === t.id ? 'bg-gray-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Badge label={statusLabel(t.status)} color={STATUS_BADGE[t.status] || 'gray'} />
                                            {STATUS_PIPELINE.indexOf(t.status) < STATUS_PIPELINE.length - 1 && (
                                                <Button
                                                    size="sm" variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        const idx = STATUS_PIPELINE.indexOf(t.status)
                                                        handleStatusChange(t.id, STATUS_PIPELINE[idx + 1])
                                                    }}
                                                >
                                                    <span>Move to {STATUS_PIPELINE[STATUS_PIPELINE.indexOf(t.status) + 1]}</span>
                                                    <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 text-sm max-w-md truncate">{t.title}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{t.source}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right tabular-nums">{t.occurrence_count}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right tabular-nums">{t.affected_users_count}</td>
                                </tr>
                                {expandedTicketId === t.id && (
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <td colSpan={5} className="p-0">
                                            <div className="px-4 py-4">
                                                {loadingDetails && !ticketDetails[t.id] ? (
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                                        <span className="text-sm">Loading details...</span>
                                                    </div>
                                                ) : ticketDetails[t.id] ? (
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Error Message</h4>
                                                                <p className="mt-1 text-sm font-medium text-primary-800 bg-primary-50 p-3 rounded-md border border-primary-200 font-mono whitespace-pre-wrap">{ticketDetails[t.id].error_message}</p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Error Type</h4>
                                                                    <p className="mt-1 text-sm text-gray-800 font-mono">{ticketDetails[t.id].error_type || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL Path</h4>
                                                                    <p className="mt-1 text-sm text-gray-800">{ticketDetails[t.id].url_path || 'N/A'}</p>
                                                                </div>
                                                                {ticketDetails[t.id].api_endpoint && (
                                                                    <>
                                                                        <div>
                                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">API Endpoint</h4>
                                                                            <p className="mt-1 text-sm text-gray-800 font-mono">{ticketDetails[t.id].api_endpoint}</p>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">HTTP Status</h4>
                                                                            <p className="mt-1 text-sm text-gray-800 tabular-nums">{ticketDetails[t.id].http_status || 'N/A'}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stack Trace</h4>
                                                                {ticketDetails[t.id].stack_trace ? (
                                                                    <pre className="text-xs font-mono bg-gray-900 text-gray-200 p-3 rounded-md overflow-x-auto max-h-48 border border-gray-800">
                                                                        {ticketDetails[t.id].stack_trace}
                                                                    </pre>
                                                                ) : (
                                                                    <p className="text-sm text-gray-600 italic">No stack trace available.</p>
                                                                )}
                                                            </div>
                                                            {ticketDetails[t.id].component_stack && (
                                                                <div>
                                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Component Stack (React)</h4>
                                                                    <pre className="text-xs font-mono bg-gray-900 text-gray-200 p-3 rounded-md overflow-x-auto max-h-32 border border-gray-800">
                                                                        {ticketDetails[t.id].component_stack}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-primary-700">Failed to load details.</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                </div>
                {tickets.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-600">No error tickets found.</div>
                )}
            </Panel>
        </div>
    )
}

