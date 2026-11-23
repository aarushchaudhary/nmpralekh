import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import FormError from '../../components/ui/FormError'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import useRecords from '../../hooks/useRecords'
import { MISReportModal, ReportFilters } from '../../components/shared/MISReports'
import { reportColumns } from '../../components/shared/misReportColumns'
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../../context/AuthContext'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'
const textareaClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function FinalizeMISPage() {
    const { user } = useAuth()
    
    // Accumulator's own created reports
    const [filters, setFilters] = useState({})
    const [openReport, setOpenReport] = useState(null)
    const { data: myReports, loading, error: loadError, totalPages, currentPage, goToPage, fetch, create } =
        useRecords('/export/reports/', { pageSize: 10, filters })
    // set by "Finalize MIS" on a Chronicle Master request on the dashboard
    const { state: prefill } = useLocation()
    const [isModalOpen, setIsModalOpen] = useState(!!prefill)
    const dialogRef = useRef(null)

    // hand-built dialog: move focus in on open, close on Escape
    useEffect(() => {
        if (!isModalOpen) return
        dialogRef.current?.focus()
        const onKey = e => { if (e.key === 'Escape') setIsModalOpen(false) }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [isModalOpen])
    const [formData, setFormData] = useState({ date_from: prefill?.date_from ?? '', date_to: prefill?.date_to ?? '', data_content: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [pageError, setPageError] = useState('')

    // Search & Combine state for received reports
    const [receivedReports, setReceivedReports] = useState([])
    const [inputSchool, setInputSchool] = useState('')
    const [inputDateFrom, setInputDateFrom] = useState('')
    const [inputDateTo, setInputDateTo] = useState('')
    // id -> report: ticked reports survive a new search that no longer lists them
    const [selectedReportIds, setSelectedReportIds] = useState(new Map())

    // the server filters (same params as the report tables), so older reports are reachable too
    // shortcut: newest 100 matches per search; narrow the dates or add paging if a campus exceeds that
    const fetchReceivedReports = (filters = {}) => {
        api.get('/export/reports/received/', { params: { ...filters, page_size: 100 } })
            .then(res => setReceivedReports(res.data?.results ?? res.data))
            .catch(err => console.error(err))
    }

    useEffect(() => {
        fetchReceivedReports()
    }, [])

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
    const handleSendSuperAdmin = async (id) => {
        try {
            await api.post(`/export/reports/${id}/send-superadmin/`)
            setPageError('')
            fetch()
        } catch (err) {
            setPageError(err.response?.data?.detail || "Failed to send to Super Admin")
        }
    }

    const handleSendChronicle = async (id) => {
        try {
            await api.post(`/export/reports/${id}/send-chronicle/`)
            setPageError('')
            fetch()
        } catch (err) {
            setPageError(err.response?.data?.detail || "Failed to send to Chronicle Master")
        }
    }
    // Filter logic for received reports
    const handleApplyFilters = () => {
        fetchReceivedReports({ search: inputSchool, date_from: inputDateFrom, date_to: inputDateTo })
    }

    const toggleSelection = (report) => {
        const next = new Map(selectedReportIds)
        if (next.has(report.id)) {
            next.delete(report.id)
        } else {
            next.set(report.id, report)
        }
        setSelectedReportIds(next)
    }

    const handleCombineIntoTextarea = () => {
        if (selectedReportIds.size === 0) {
            setError("Please select at least one report to combine.")
            return
        }
        const selected = [...selectedReportIds.values()]
        selected.sort((a, b) => new Date(a.date_from) - new Date(b.date_from))

        let combined = formData.data_content ? formData.data_content + "\n\n" : ""
        
        if (!formData.data_content) {
            combined += `${user?.campus_name || 'Campus Name'}\n`
            combined += `-------------------------------------------------\n\n`
        }
        
        selected.forEach((report, index) => {
            if (index > 0 || formData.data_content) {
                combined += `-------------------------------------------------\n\n`
            }
            combined += `${report.created_by_school_name || 'Unknown School'}\n\n`
            combined += `${report.data_content}\n\n`
        })

        setFormData(prev => ({ ...prev, data_content: combined.trim() }))
        // clear selections after combining so they can select others if needed
        setSelectedReportIds(new Map())
    }

    const columns = [
        ...reportColumns(setOpenReport),
        { key: 'created_at', label: 'Created', render: r => new Date(r.created_at).toLocaleDateString() },
        {
            key: 'actions', label: 'Actions',
            render: r => (
                <div className="flex flex-wrap items-center gap-2">
                    {r.sent_to_super_admin ? (
                        <Badge label="Sent to Super Admin" color="dark" />
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleSendSuperAdmin(r.id)}>
                            Send to Super Admin
                        </Button>
                    )}
                    {r.sent_to_chronicle_master ? (
                        <Badge label="Sent to Chronicle Master" color="dark" />
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleSendChronicle(r.id)}>
                            Send to Chronicle Master
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader
                title="Finalize MIS Data"
                subtitle="Create and manage your finalized MIS reports"
                action={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Create Final MIS
                    </Button>
                }
            />

            <div className="space-y-4">
                <FormError message={pageError} />
                <ReportFilters searchLabel="Search finalized reports" onApply={f => { setFilters(f); goToPage(1) }} />
                <Table columns={columns} data={myReports} loading={loading} error={loadError}
                    serverPagination totalPages={totalPages} currentPage={currentPage} onPageChange={goToPage} />
            </div>

            <MISReportModal report={openReport} onClose={() => setOpenReport(null)} />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="finalize-dialog-title"
                        className="bg-white rounded-md border border-gray-200 shadow-lg w-full max-w-5xl flex flex-col overflow-hidden focus:outline-none" style={{ maxHeight: '95vh' }}>
                        <div className="px-5 py-3.5 border-b border-gray-200 flex justify-between items-center">
                            <h2 id="finalize-dialog-title" className="text-base font-semibold text-gray-900">Create Final MIS</h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close"
                                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-5 py-4 overflow-y-auto flex-grow flex flex-col lg:flex-row gap-5">
                            {/* Left Side: Search & Combine */}
                            <div className="lg:w-1/2 flex flex-col border border-gray-200 rounded-md overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-600 mb-3 text-xs uppercase tracking-wide">1. Search & Select Reports</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Search by Title, School, or Coordinator..."
                                            aria-label="Search received reports"
                                            value={inputSchool}
                                            onChange={(e) => setInputSchool(e.target.value)}
                                            className={inputClass}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                aria-label="Reports from date"
                                                value={inputDateFrom}
                                                onChange={(e) => setInputDateFrom(e.target.value)}
                                                className={`${inputClass} !w-1/2`}
                                            />
                                            <input
                                                type="date"
                                                aria-label="Reports to date"
                                                value={inputDateTo}
                                                onChange={(e) => setInputDateTo(e.target.value)}
                                                className={`${inputClass} !w-1/2`}
                                            />
                                        </div>
                                        <Button variant="secondary" onClick={handleApplyFilters} className="w-full">
                                            Search Received Reports
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-grow overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
                                    {receivedReports.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-sm">No reports match criteria.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {receivedReports.map(report => (
                                                <label
                                                    key={report.id}
                                                    className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                                                        selectedReportIds.has(report.id)
                                                        ? 'border-primary-600 bg-primary-50'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedReportIds.has(report.id)}
                                                            onChange={() => toggleSelection(report)}
                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary-600"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-sm text-gray-900">{report.title}</div>
                                                            <div className="text-xs text-gray-500 tabular-nums">{report.created_by_school_name} | {new Date(report.created_at).toLocaleString()} | {report.date_from} to {report.date_to}</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white border-t border-gray-200">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCombineIntoTextarea}
                                        disabled={selectedReportIds.size === 0}
                                        className="w-full"
                                    >
                                        Combine {selectedReportIds.size || ''} Selected into Editor &rarr;
                                    </Button>
                                </div>
                            </div>

                            {/* Right Side: Editor form */}
                            <div className="lg:w-1/2 flex flex-col">
                                <h3 className="font-semibold text-gray-600 mb-3 text-xs uppercase tracking-wide">2. Review & Save Final MIS</h3>

                                {error && <div className="mb-4"><FormError message={error} /></div>}

                                <form id="create-report-form" onSubmit={handleCreateReport} className="space-y-4 flex flex-col flex-grow">
                                    <p className="text-xs text-gray-500">The report is named Campus - From to To.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="finalize-mis-5" className="block text-xs font-medium text-gray-600 mb-1">Final From Date</label>
                                            <input id="finalize-mis-5"
                                                type="date"
                                                required
                                                value={formData.date_from}
                                                onChange={(e) => setFormData({...formData, date_from: e.target.value})}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="finalize-mis-6" className="block text-xs font-medium text-gray-600 mb-1">Final To Date</label>
                                            <input id="finalize-mis-6"
                                                type="date"
                                                required
                                                value={formData.date_to}
                                                onChange={(e) => setFormData({...formData, date_to: e.target.value})}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-grow flex flex-col">
                                        <label htmlFor="finalize-mis-7" className="block text-xs font-medium text-gray-600 mb-1">Final Data Content</label>
                                        <textarea id="finalize-mis-7"
                                            required
                                            value={formData.data_content}
                                            onChange={(e) => setFormData({...formData, data_content: e.target.value})}
                                            className={`${textareaClass} flex-grow resize-none leading-relaxed`}
                                            style={{ minHeight: '300px' }}
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="px-5 py-3.5 border-t border-gray-200 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <button
                                type="submit"
                                form="create-report-form"
                                disabled={submitting}
                                className="inline-flex items-center justify-center h-9 px-3.5 text-sm font-medium rounded-md border border-primary-600 bg-primary-600 text-white hover:bg-primary-700 hover:border-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Saving...' : 'Save Final Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
