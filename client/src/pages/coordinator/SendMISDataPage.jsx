import { useState, useEffect } from 'react'
import api from '../../api/axios'
import FormError from '../../components/ui/FormError'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Panel from '../../components/ui/Panel'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { PlusIcon } from '@heroicons/react/20/solid'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'
const textareaClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function SendMISDataPage() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', date_from: '', date_to: '', data_content: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [pageError, setPageError] = useState('')

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
            setPageError('')
            fetchReports()
        } catch (err) {
            setPageError(err.response?.data?.detail || "Error sending to admin")
        }
    }

    const handleSendToAccumulator = async (id) => {
        try {
            await api.post(`/export/reports/${id}/send-accumulator/`)
            setPageError('')
            fetchReports()
        } catch (err) {
            setPageError(err.response?.data?.detail || "Error sending to accumulator")
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
        <div className="max-w-5xl mx-auto">
            <PageHeader
                title="Send MIS Data"
                subtitle="Create and dispatch your MIS Reports"
                action={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Create MIS Report
                    </Button>
                }
            />

            <div className="space-y-4">
                <FormError message={pageError} />

                <div className="flex flex-wrap gap-3 items-end">
                    <div className="w-full sm:flex-1 sm:max-w-md">
                        <label htmlFor="send-mis-data-1" className="block text-xs font-medium text-gray-600 mb-1">Search Report Title</label>
                        <input id="send-mis-data-1"
                            type="text"
                            placeholder="Search by Report Title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="send-mis-data-2" className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                        <input id="send-mis-data-2"
                            type="date"
                            value={searchDateFrom}
                            onChange={(e) => setSearchDateFrom(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="send-mis-data-3" className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                        <input id="send-mis-data-3"
                            type="date"
                            value={searchDateTo}
                            onChange={(e) => setSearchDateTo(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
                ) : filteredReports.length === 0 ? (
                    <EmptyState message="No reports found." />
                ) : (
                    <div className="space-y-4">
                        {filteredReports.map(report => (
                            <Panel key={report.id}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-gray-900 mb-1">
                                            {report.name || 'MIS Report'}
                                        </h2>
                                        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
                                            <span>Period: <strong className="font-medium text-gray-800">{report.date_from}</strong> to <strong className="font-medium text-gray-800">{report.date_to}</strong></span>
                                            <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {report.sent_to_admin ? (
                                            <Badge label="Sent to Admin" color="dark" />
                                        ) : (
                                            <Button variant="secondary" size="sm" onClick={() => handleSendToAdmin(report.id)}>
                                                Send to School Admin
                                            </Button>
                                        )}
                                        {report.sent_to_accumulator ? (
                                            <Badge label="Sent to Accumulator" color="dark" />
                                        ) : (
                                            <Button variant="secondary" size="sm" onClick={() => handleSendToAccumulator(report.id)}>
                                                Send to MIS Accumulator
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-200">
                                    {report.data_content}
                                </div>
                            </Panel>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create MIS Report">
                    {error && <div className="mb-4"><FormError message={error} /></div>}

                    <form onSubmit={handleCreateReport} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label htmlFor="send-mis-data-4" className="block text-sm font-medium text-gray-800 mb-1">Report Name / Title</label>
                                <input id="send-mis-data-4"
                                    type="text"
                                    required
                                    placeholder="e.g. May 2026 Monthly Report"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="send-mis-data-5" className="block text-sm font-medium text-gray-800 mb-1">From Date</label>
                                <input id="send-mis-data-5"
                                    type="date"
                                    required
                                    value={formData.date_from}
                                    onChange={(e) => setFormData({...formData, date_from: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="send-mis-data-6" className="block text-sm font-medium text-gray-800 mb-1">To Date</label>
                                <input id="send-mis-data-6"
                                    type="date"
                                    required
                                    value={formData.date_to}
                                    onChange={(e) => setFormData({...formData, date_to: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="send-mis-data-7" className="block text-sm font-medium text-gray-800 mb-1">MIS Data Content</label>
                            <textarea id="send-mis-data-7"
                                required
                                rows={6}
                                placeholder="Enter the MIS Data details here..."
                                value={formData.data_content}
                                onChange={(e) => setFormData({...formData, data_content: e.target.value})}
                                className={`${textareaClass} resize-none`}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 mt-6 pt-4">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Report'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
