import { useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function RequestDataModal({ isOpen, onClose, coordinator, onSuccess, isBulk }) {
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
            if (isBulk) {
                await api.post('/export/accumulator/request-all/', {
                    date_from: dateFrom,
                    date_to: dateTo
                })
            } else {
                await api.post('/export/data-requests/', {
                    coordinator: coordinator.id,
                    date_from: dateFrom,
                    date_to: dateTo
                })
            }
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create request.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isBulk ? 'Request Data from All' : 'Request MIS Data'}
            size="sm"
        >
            <p className="text-sm text-gray-600 mb-4">
                {isBulk
                    ? "Request data from all coordinators in your campus. They will receive notifications on their dashboard."
                    : <>Request data from <strong className="font-medium text-gray-900">{coordinator?.full_name}</strong>. They will receive a notification on their dashboard.</>
                }
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="request-data-1" className="block text-sm font-medium text-gray-800 mb-1">From Date</label>
                    <input id="request-data-1"
                        type="date"
                        required
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="request-data-2" className="block text-sm font-medium text-gray-800 mb-1">To Date</label>
                    <input id="request-data-2"
                        type="date"
                        required
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 mt-6 pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Request'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
