import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_PIPELINE = ['open', 'planning', 'fixing', 'testing', 'closed']

export default function UserFeedback() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await api.get('/service/bug-reports/')
            setReports(res.data.results || res.data)
        } catch (err) {
            console.error("Failed to load reports", err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await api.patch(`/service/bug-reports/${reportId}/`, { status: newStatus })
            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r))
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
            <h1 className="text-2xl font-bold text-gray-900">User Bug Reports</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Severity</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reported By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold rounded-lg px-2.5 py-1 uppercase tracking-wide border ${
                                            r.status === 'open' ? 'bg-red-50 text-red-700 border-red-200' :
                                            r.status === 'planning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            r.status === 'fixing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            r.status === 'testing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                            {r.status}
                                        </span>
                                        {STATUS_PIPELINE.indexOf(r.status) < STATUS_PIPELINE.length - 1 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const idx = STATUS_PIPELINE.indexOf(r.status)
                                                    handleStatusChange(r.id, STATUS_PIPELINE[idx + 1])
                                                }}
                                                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1"
                                            >
                                                <span>Move to {STATUS_PIPELINE[STATUS_PIPELINE.indexOf(r.status) + 1]}</span>
                                                <span>→</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        r.severity === 'critical' || r.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {r.severity.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 text-sm max-w-md truncate">{r.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{r.user?.full_name || 'Anonymous'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reports.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No bug reports found.</div>
                )}
            </div>
        </div>
    )
}
