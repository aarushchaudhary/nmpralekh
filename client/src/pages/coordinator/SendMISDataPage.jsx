import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import useRecords from '../../hooks/useRecords'
import FormError from '../../components/ui/FormError'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { MISReportModal, ReportFilters } from '../../components/shared/MISReports'
import { reportColumns } from '../../components/shared/misReportColumns'
import { PlusIcon } from '@heroicons/react/20/solid'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'
const textareaClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function SendMISDataPage() {
    // set by "Fulfill request" on the dashboard
    const { state: prefill } = useLocation()
    const [filters, setFilters] = useState({})
    const [openReport, setOpenReport] = useState(null)
    const { data, loading, error: loadError, totalPages, currentPage, goToPage, fetch, create } =
        useRecords('/export/reports/', { pageSize: 10, filters })
    const [isModalOpen, setIsModalOpen] = useState(!!prefill)
    const [formData, setFormData] = useState({ date_from: prefill?.date_from ?? '', date_to: prefill?.date_to ?? '', data_content: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [pageError, setPageError] = useState('')

    const handleCreateReport = async (e) => {
        e.preventDefault()
        setError('')
        if (!formData.date_from || !formData.date_to || !formData.data_content) {
            setError("All fields are required.")
            return
        }
        if (new Date(formData.date_from) > new Date(formData.date_to)) {
            setError("From Date cannot be after To Date.")
            return
        }

        setSubmitting(true)
        try {
            await create(formData)
            setIsModalOpen(false)
            setFormData({ date_from: '', date_to: '', data_content: '' })
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create report")
        } finally {
            setSubmitting(false)
        }
    }

    const send = async (id, path, failMessage) => {
        try {
            await api.post(`/export/reports/${id}/${path}/`)
            setPageError('')
            fetch()
        } catch (err) {
            setPageError(err.response?.data?.detail || failMessage)
        }
    }

    const columns = [
        ...reportColumns(setOpenReport),
        { key: 'created_at', label: 'Created', render: r => new Date(r.created_at).toLocaleDateString() },
        {
            key: 'actions', label: 'Actions',
            render: r => (
                <div className="flex flex-wrap items-center gap-2">
                    {r.sent_to_admin ? (
                        <Badge label="Sent to Admin" color="dark" />
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => send(r.id, 'send-admin', 'Error sending to admin')}>
                            Send to School Admin
                        </Button>
                    )}
                    {r.sent_to_accumulator ? (
                        <Badge label="Sent to Accumulator" color="dark" />
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => send(r.id, 'send-accumulator', 'Error sending to accumulator')}>
                            Send to MIS Accumulator
                        </Button>
                    )}
                </div>
            ),
        },
    ]

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
                <ReportFilters onApply={f => { setFilters(f); goToPage(1) }} />
                <Table columns={columns} data={data} loading={loading} error={loadError}
                    serverPagination totalPages={totalPages} currentPage={currentPage} onPageChange={goToPage} />
            </div>

            <MISReportModal report={openReport} onClose={() => setOpenReport(null)} />

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create MIS Report">
                    {error && <div className="mb-4"><FormError message={error} /></div>}

                    <form onSubmit={handleCreateReport} className="space-y-4">
                        <p className="text-xs text-gray-500">The report is named School - Campus - From to To.</p>
                        <div className="grid grid-cols-2 gap-4">
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
