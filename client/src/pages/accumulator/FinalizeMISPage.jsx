import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import FormError from '../../components/ui/FormError'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Panel from '../../components/ui/Panel'
import EmptyState from '../../components/ui/EmptyState'
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../../context/AuthContext'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'
const textareaClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function FinalizeMISPage() {
    const { user } = useAuth()
    
    // Accumulator's own created reports
    const [myReports, setMyReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', date_from: '', date_to: '', data_content: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [pageError, setPageError] = useState('')

    // Search & Combine state for received reports
    const [receivedReports, setReceivedReports] = useState([])
    const [inputSchool, setInputSchool] = useState('')
    const [inputDateFrom, setInputDateFrom] = useState('')
    const [inputDateTo, setInputDateTo] = useState('')
    const [activeSchool, setActiveSchool] = useState('')
    const [activeDateFrom, setActiveDateFrom] = useState('')
    const [activeDateTo, setActiveDateTo] = useState('')
    const [selectedReportIds, setSelectedReportIds] = useState(new Set())

    const fetchMyReports = () => {
        setLoading(true)
        api.get('/export/reports/')
            .then(res => setMyReports(res.data?.results ?? res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    const fetchReceivedReports = () => {
        api.get('/export/reports/received/')
            .then(res => setReceivedReports(res.data?.results ?? res.data))
            .catch(err => console.error(err))
    }

    useEffect(() => {
        fetchMyReports()
        fetchReceivedReports()
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
            fetchMyReports()
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
            fetchMyReports()
        } catch (err) {
            setPageError(err.response?.data?.detail || "Failed to send to Super Admin")
        }
    }

    const handleSendChronicle = async (id) => {
        try {
            await api.post(`/export/reports/${id}/send-chronicle/`)
            setPageError('')
            fetchMyReports()
        } catch (err) {
            setPageError(err.response?.data?.detail || "Failed to send to Chronicle Master")
        }
    }
    // Filter logic for received reports
    const handleApplyFilters = () => {
        setActiveSchool(inputSchool)
        setActiveDateFrom(inputDateFrom)
        setActiveDateTo(inputDateTo)
    }

    const filteredReceivedReports = receivedReports.filter(report => {
        let match = true
        if (activeSchool) {
            const searchTerm = activeSchool.toLowerCase()
            const matchesName = report.name?.toLowerCase().includes(searchTerm)
            const matchesSchool = report.created_by_school_name?.toLowerCase().includes(searchTerm)
            const matchesCoordinator = report.created_by_name?.toLowerCase().includes(searchTerm)
            if (!matchesName && !matchesSchool && !matchesCoordinator) {
                match = false
            }
        }
        if (activeDateFrom && activeDateTo) {
            if (activeDateFrom > report.date_to || report.date_from > activeDateTo) {
                match = false
            }
        } else if (activeDateFrom) {
            if (report.date_to < activeDateFrom) match = false
        } else if (activeDateTo) {
            if (report.date_from > activeDateTo) match = false
        }
        return match
    })

    const toggleSelection = (id) => {
        const newSet = new Set(selectedReportIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedReportIds(newSet)
    }

    const handleCombineIntoTextarea = () => {
        if (selectedReportIds.size === 0) {
            setError("Please select at least one report to combine.")
            return
        }
        const selected = receivedReports.filter(r => selectedReportIds.has(r.id))
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
        setSelectedReportIds(new Set())
    }

    const [mySearchQuery, setMySearchQuery] = useState('')
    const [mySearchDateFrom, setMySearchDateFrom] = useState('')
    const [mySearchDateTo, setMySearchDateTo] = useState('')

    const filteredMyReports = myReports.filter(report => {
        let match = true
        if (mySearchQuery) {
            const matchesName = report.name?.toLowerCase().includes(mySearchQuery.toLowerCase())
            if (!matchesName) {
                match = false
            }
        }
        
        if (mySearchDateFrom && mySearchDateTo) {
            if (mySearchDateFrom > report.date_to || report.date_from > mySearchDateTo) {
                match = false
            }
        } else if (mySearchDateFrom) {
            if (report.date_to < mySearchDateFrom) match = false
        } else if (mySearchDateTo) {
            if (report.date_from > mySearchDateTo) match = false
        }

        return match
    })

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

                <div className="flex flex-wrap gap-3 items-end">
                    <div className="w-full sm:flex-1 sm:max-w-md">
                        <label htmlFor="finalize-mis-1" className="block text-xs font-medium text-gray-600 mb-1">Search Finalized Reports</label>
                        <input id="finalize-mis-1"
                            type="text"
                            placeholder="Search by Title..."
                            value={mySearchQuery}
                            onChange={(e) => setMySearchQuery(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="finalize-mis-2" className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                        <input id="finalize-mis-2"
                            type="date"
                            value={mySearchDateFrom}
                            onChange={(e) => setMySearchDateFrom(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="finalize-mis-3" className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                        <input id="finalize-mis-3"
                            type="date"
                            value={mySearchDateTo}
                            onChange={(e) => setMySearchDateTo(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
                ) : filteredMyReports.length === 0 ? (
                    <EmptyState message="No reports found." />
                ) : (
                    <div className="space-y-4">
                        {filteredMyReports.map(report => (
                            <Panel key={report.id}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-gray-900 mb-1">
                                            {report.name || 'Finalized MIS Report'}
                                        </h2>
                                        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
                                            <span>Period: <strong className="font-medium text-gray-800">{report.date_from}</strong> to <strong className="font-medium text-gray-800">{report.date_to}</strong></span>
                                            <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                                        <Badge label="Saved in System" color="dark" />
                                        {report.sent_to_super_admin ? (
                                            <Badge label="Sent to Super Admin" color="dark" />
                                        ) : (
                                            <Button variant="secondary" size="sm" onClick={() => handleSendSuperAdmin(report.id)}>
                                                Send to Super Admin
                                            </Button>
                                        )}
                                        {report.sent_to_chronicle_master ? (
                                            <Badge label="Sent to Chronicle Master" color="dark" />
                                        ) : (
                                            <Button variant="secondary" size="sm" onClick={() => handleSendChronicle(report.id)}>
                                                Send to Chronicle Master
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-200" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {report.data_content}
                                </div>
                            </Panel>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-md border border-gray-200 shadow-lg w-full max-w-5xl flex flex-col overflow-hidden" style={{ maxHeight: '95vh' }}>
                        <div className="px-5 py-3.5 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-base font-semibold text-gray-900">Create Final MIS</h2>
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
                                            value={inputSchool}
                                            onChange={(e) => setInputSchool(e.target.value)}
                                            className={inputClass}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={inputDateFrom}
                                                onChange={(e) => setInputDateFrom(e.target.value)}
                                                className={`${inputClass} !w-1/2`}
                                            />
                                            <input
                                                type="date"
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
                                    {filteredReceivedReports.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-sm">No reports match criteria.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredReceivedReports.map(report => (
                                                <div
                                                    key={report.id}
                                                    onClick={() => toggleSelection(report.id)}
                                                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                                                        selectedReportIds.has(report.id)
                                                        ? 'border-primary-600 bg-primary-50'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedReportIds.has(report.id)}
                                                            onChange={() => {}}
                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary-600"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-sm text-gray-900">{report.name || 'Unnamed Report'}</div>
                                                            <div className="text-xs text-gray-500 tabular-nums">{report.created_by_school_name} | {new Date(report.created_at).toLocaleString()} | {report.date_from} to {report.date_to}</div>
                                                        </div>
                                                    </div>
                                                </div>
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
                                        Combine Selected into Editor &rarr;
                                    </Button>
                                </div>
                            </div>

                            {/* Right Side: Editor form */}
                            <div className="lg:w-1/2 flex flex-col">
                                <h3 className="font-semibold text-gray-600 mb-3 text-xs uppercase tracking-wide">2. Review & Save Final MIS</h3>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <form id="create-report-form" onSubmit={handleCreateReport} className="space-y-4 flex flex-col flex-grow">
                                    <div>
                                        <label htmlFor="finalize-mis-4" className="block text-xs font-medium text-gray-600 mb-1">Final Report Title</label>
                                        <input id="finalize-mis-4"
                                            type="text"
                                            required
                                            placeholder="e.g. Q1 Final Combined Report"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className={inputClass}
                                        />
                                    </div>
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
