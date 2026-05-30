import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_PIPELINE = ['open', 'planning', 'fixing', 'testing', 'closed']

export default function ErrorTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

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
        } catch (err) {
            console.error("Failed to update status", err)
            alert("Failed to update status")
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
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
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
