import { useState } from 'react'
import api from '../../api/axios'

export default function RequestDataModal({ isOpen, onClose, coordinator, onSuccess }) {
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!dateFrom || !dateTo) {
            setError("Please select both dates.")
            return
        }
        if (new Date(dateFrom) > new Date(dateTo)) {
            setError("From Date cannot be after To Date.")
            return
        }

        setError('')
        setLoading(true)
        try {
            await api.post('/export/data-requests/', {
                coordinator: coordinator.id,
                date_from: dateFrom,
                date_to: dateTo
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create request.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Request MIS Data
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        &times;
                    </button>
                </div>
                
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Request data from <strong>{coordinator?.full_name}</strong>. They will receive a notification on their dashboard.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                required
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                required
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-6 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
