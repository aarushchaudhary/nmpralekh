import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Panel from '../../components/ui/Panel'
import Modal from '../../components/ui/Modal'
import { PlusIcon } from '@heroicons/react/20/solid'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'
const textareaClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

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
            <PageHeader
                title="Initiate Data Requests"
                subtitle="Request MIS Data from Accumulators & Coordinators"
                action={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        New Request
                    </Button>
                }
            />

            <Panel
                title="Past Requests"
                description="History of MIS data requests sent to accumulators"
            >
                <Table columns={columns} data={requests} loading={loading} />
            </Panel>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate Data Request">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreateRequest} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="initiate-request-1" className="block text-sm font-medium text-gray-800 mb-1">From Date</label>
                                <input id="initiate-request-1"
                                    type="date"
                                    required
                                    value={formData.date_from}
                                    onChange={(e) => setFormData({...formData, date_from: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="initiate-request-2" className="block text-sm font-medium text-gray-800 mb-1">To Date</label>
                                <input id="initiate-request-2"
                                    type="date"
                                    required
                                    value={formData.date_to}
                                    onChange={(e) => setFormData({...formData, date_to: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="initiate-request-3" className="block text-sm font-medium text-gray-800 mb-1">Message</label>
                            <textarea id="initiate-request-3"
                                required
                                rows={4}
                                placeholder="Instruction for accumulators..."
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                className={`${textareaClass} resize-none`}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 mt-6 pt-4">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={submitting}
                                disabled={submitting}
                            >
                                Send Request
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
