import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'

export default function InitiateRequestPage() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ date_from: '', date_to: '', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const fetchRequests = () => {
        setLoading(true)
        api.get('/export/chronicle/data-requests/')
            .then(res => setRequests(res.data?.results ?? res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleCreateRequest = async (e) => {
        e.preventDefault()
        setError('')
        if (!formData.date_from || !formData.date_to || !formData.message) {
            setError("All fields are required.")
            return
        }
        if (new Date(formData.date_from) > new Date(formData.date_to)) {
            setError("From Date cannot be after To Date.")
            return
        }

        setSubmitting(true)
        try {
            await api.post('/export/chronicle/data-requests/', formData)
            setIsModalOpen(false)
            setFormData({ date_from: '', date_to: '', message: '' })
            fetchRequests()
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create request")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        { key: 'created_by_name', label: 'Requested By' },
        { 
            key: 'period', label: 'Period', 
            render: row => `${row.date_from} to ${row.date_to}` 
        },
        { key: 'message', label: 'Message' },
        { 
            key: 'created_at', label: 'Created At',
            render: row => new Date(row.created_at).toLocaleDateString()
        }
    ]

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <PageHeader 
                    title="Initiate Data Requests" 
                    subtitle="Request MIS Data from Accumulators & Coordinators" 
                />
                <Button onClick={() => setIsModalOpen(true)}>
                    + New Request
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Past Requests</h3>
                        <p className="text-sm text-gray-500">History of MIS data requests sent to accumulators</p>
                    </div>
                </div>
                <Table columns={columns} data={requests} loading={loading} />
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Initiate Data Request</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>
                        
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Instruction for accumulators..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
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
                                    <Button
                                        type="submit"
                                        loading={submitting}
                                        disabled={submitting}
                                    >
                                        Send Request
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
