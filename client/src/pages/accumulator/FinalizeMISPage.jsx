import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'

export default function FinalizeMISPage() {
    const { user } = useAuth()
    
    // Accumulator's own created reports
    const [myReports, setMyReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', date_from: '', date_to: '', data_content: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

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
            const matchesSchool = report.coordinator_school_name?.toLowerCase().includes(searchTerm)
            const matchesCoordinator = report.coordinator_name?.toLowerCase().includes(searchTerm)
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
            alert("Please select at least one report to combine.")
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
            combined += `${report.coordinator_school_name || 'Unknown School'}\n\n`
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
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Finalize MIS Data</h1>
                    <p className="text-gray-500 mt-1">Create and manage your finalized MIS reports</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                    + Create Final MIS
                </button>
            </div>
            
            <div className="mb-6 flex gap-4 items-end">
                <div className="flex-grow max-w-md">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Search Finalized Reports</label>
                    <input 
                        type="text"
                        placeholder="Search by Title..."
                        value={mySearchQuery}
                        onChange={(e) => setMySearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                    <input 
                        type="date"
                        value={mySearchDateFrom}
                        onChange={(e) => setMySearchDateFrom(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                    <input 
                        type="date"
                        value={mySearchDateTo}
                        onChange={(e) => setMySearchDateTo(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredMyReports.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No reports found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMyReports.map(report => (
                        <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        {report.name || 'Finalized MIS Report'}
                                    </h3>
                                    <div className="text-sm text-gray-500 flex gap-4">
                                        <span>Period: <strong className="text-gray-700">{report.date_from}</strong> to <strong className="text-gray-700">{report.date_to}</strong></span>
                                        <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    ✓ Saved in System
                                </span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {report.data_content}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col overflow-hidden" style={{ maxHeight: '95vh' }}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">Create Final MIS</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow flex flex-col lg:flex-row gap-6 bg-white">
                            {/* Left Side: Search & Combine */}
                            <div className="lg:w-1/2 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">1. Search & Select Reports</h4>
                                    <div className="space-y-3">
                                        <input 
                                            type="text"
                                            placeholder="Search by Title, School, or Coordinator..."
                                            value={inputSchool}
                                            onChange={(e) => setInputSchool(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="date"
                                                value={inputDateFrom}
                                                onChange={(e) => setInputDateFrom(e.target.value)}
                                                className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                            <input 
                                                type="date"
                                                value={inputDateTo}
                                                onChange={(e) => setInputDateTo(e.target.value)}
                                                className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleApplyFilters}
                                            className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Search Received Reports
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-grow overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '400px' }}>
                                    {filteredReceivedReports.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">No reports match criteria.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredReceivedReports.map(report => (
                                                <div 
                                                    key={report.id} 
                                                    onClick={() => toggleSelection(report.id)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        selectedReportIds.has(report.id) 
                                                        ? 'border-primary-500 bg-primary-50' 
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedReportIds.has(report.id)}
                                                            onChange={() => {}}
                                                            className="mt-1"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-sm text-gray-800">{report.coordinator_school_name}</div>
                                                            <div className="text-xs text-gray-500">{report.coordinator_name} | {report.date_from} to {report.date_to}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white border-t border-gray-200">
                                    <button 
                                        onClick={handleCombineIntoTextarea}
                                        disabled={selectedReportIds.size === 0}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        Combine Selected into Editor &rarr;
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: Editor form */}
                            <div className="lg:w-1/2 flex flex-col">
                                <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">2. Review & Save Final MIS</h4>
                                
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <form id="create-report-form" onSubmit={handleCreateReport} className="space-y-4 flex flex-col flex-grow">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Final Report Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Q1 Final Combined Report"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Final From Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date_from}
                                                onChange={(e) => setFormData({...formData, date_from: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Final To Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date_to}
                                                onChange={(e) => setFormData({...formData, date_to: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow flex flex-col">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Final Data Content</label>
                                        <textarea
                                            required
                                            value={formData.data_content}
                                            onChange={(e) => setFormData({...formData, data_content: e.target.value})}
                                            className="w-full flex-grow px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono"
                                            style={{ minHeight: '300px' }}
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-white border border-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-report-form"
                                disabled={submitting}
                                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
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
