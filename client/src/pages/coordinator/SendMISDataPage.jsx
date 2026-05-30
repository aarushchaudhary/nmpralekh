import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function SendMISDataPage() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', date_from: '', date_to: '', data_content: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const fetchReports = () => {
        setLoading(true)
        api.get('/export/reports/')
            .then(res => setReports(res.data?.results ?? res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleCreateReport = async (e) => {
        e.preventDefault()
        setError('')
        if (!formData.name || !formData.date_from || !formData.date_to || !formData.data_content) {
            setError("All fields are required.")
            return
        }
        if (new Date(formData.date_from) > new Date(formData.date_to)) {
            setError("From Date cannot be after To Date.")
            return
        }

        setSubmitting(true)
        try {
            await api.post('/export/reports/', formData)
            setIsModalOpen(false)
            setFormData({ name: '', date_from: '', date_to: '', data_content: '' })
            fetchReports()
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create report")
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendToAdmin = async (id) => {
        try {
            await api.post(`/export/reports/${id}/send-admin/`)
            fetchReports()
        } catch (err) {
            alert(err.response?.data?.detail || "Error sending to admin")
        }
    }

    const handleSendToAccumulator = async (id) => {
        try {
            await api.post(`/export/reports/${id}/send-accumulator/`)
            fetchReports()
        } catch (err) {
            alert(err.response?.data?.detail || "Error sending to accumulator")
        }
    }

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [searchDateFrom, setSearchDateFrom] = useState('')
    const [searchDateTo, setSearchDateTo] = useState('')

    const filteredReports = reports.filter(report => {
        let match = true

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            const matchesName = report.name?.toLowerCase().includes(q)
            if (!matchesName) {
                match = false
            }
        }

        if (searchDateFrom && searchDateTo) {
            if (searchDateFrom > report.date_to || report.date_from > searchDateTo) {
                match = false
            }
        } else if (searchDateFrom) {
            if (report.date_to < searchDateFrom) match = false
        } else if (searchDateTo) {
            if (report.date_from > searchDateTo) match = false
        }

        return match
    })

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Send MIS Data</h1>
                    <p className="text-gray-500 mt-1">Create and dispatch your MIS Reports</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                    + Create MIS Report
                </button>
            </div>
            
            <div className="mb-6 flex gap-4 items-end">
                <div className="flex-grow max-w-md">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Search Report Title</label>
                    <input 
                        type="text"
                        placeholder="Search by Report Title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                    <input 
                        type="date"
                        value={searchDateFrom}
                        onChange={(e) => setSearchDateFrom(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                    <input 
                        type="date"
                        value={searchDateTo}
                        onChange={(e) => setSearchDateTo(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredReports.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No reports found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReports.map(report => (
                        <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        {report.name || 'MIS Report'}
                                    </h3>
                                    <div className="text-sm text-gray-500 flex gap-4">
                                        <span>Period: <strong className="text-gray-700">{report.date_from}</strong> to <strong className="text-gray-700">{report.date_to}</strong></span>
                                        <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSendToAdmin(report.id)}
                                        disabled={report.sent_to_admin}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            report.sent_to_admin 
                                            ? 'bg-green-50 text-green-700 cursor-not-allowed' 
                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        }`}
                                    >
                                        {report.sent_to_admin ? 'Sent to Admin ✓' : 'Send to School Admin'}
                                    </button>
                                    <button
                                        onClick={() => handleSendToAccumulator(report.id)}
                                        disabled={report.sent_to_accumulator}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            report.sent_to_accumulator 
                                            ? 'bg-green-50 text-green-700 cursor-not-allowed' 
                                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                        }`}
                                    >
                                        {report.sent_to_accumulator ? 'Sent to Accumulator ✓' : 'Send to MIS Accumulator'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                                {report.data_content}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Create MIS Report</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>
                        
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateReport} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name / Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. May 2026 Monthly Report"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_from}
                                            onChange={(e) => setFormData({...formData, date_from: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_to}
                                            onChange={(e) => setFormData({...formData, date_to: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MIS Data Content</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="Enter the MIS Data details here..."
                                        value={formData.data_content}
                                        onChange={(e) => setFormData({...formData, data_content: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-6 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                                    >
                                        {submitting ? 'Creating...' : 'Create Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
