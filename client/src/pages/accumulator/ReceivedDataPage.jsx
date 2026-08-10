import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'

export default function ReceivedDataPage() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Input states
    const [inputSchool, setInputSchool] = useState('')
    const [inputDateFrom, setInputDateFrom] = useState('')
    const [inputDateTo, setInputDateTo] = useState('')

    // Active applied filters
    const [activeSchool, setActiveSchool] = useState('')
    const [activeDateFrom, setActiveDateFrom] = useState('')
    const [activeDateTo, setActiveDateTo] = useState('')

    useEffect(() => {
        api.get('/export/reports/received/')
            .then(res => setReports(res.data?.results ?? res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleApplyFilters = () => {
        setActiveSchool(inputSchool)
        setActiveDateFrom(inputDateFrom)
        setActiveDateTo(inputDateTo)
    }

    const handleClearFilters = () => {
        setInputSchool('')
        setInputDateFrom('')
        setInputDateTo('')
        setActiveSchool('')
        setActiveDateFrom('')
        setActiveDateTo('')
    }

    const filteredReports = reports.filter(report => {
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
        
        // Overlapping date logic: if any date in the report falls within the active filter frame
        if (activeDateFrom && activeDateTo) {
            // Two ranges [A, B] and [X, Y] overlap if A <= Y and X <= B
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

    return (
        <div className="max-w-5xl mx-auto">
            <PageHeader 
                title="Received MIS Data" 
                subtitle="Review data sent by campus coordinators" 
            />
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Search Coordinator / School</label>
                    <input 
                        type="text"
                        placeholder="Search by Title, School, or Coordinator..."
                        value={inputSchool}
                        onChange={(e) => setInputSchool(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-48"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                    <input 
                        type="date"
                        value={inputDateFrom}
                        onChange={(e) => setInputDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                    <input 
                        type="date"
                        value={inputDateTo}
                        onChange={(e) => setInputDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleApplyFilters}
                        className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
                    >
                        Apply Filters
                    </button>
                    <button 
                        onClick={handleClearFilters}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredReports.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p className="text-gray-500">No data matches the current filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReports.map(report => (
                        <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        {report.name || 'MIS Report'} <span className="text-sm font-normal text-gray-500">from {report.created_by_school_name}</span>
                                    </h3>
                                    <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                                        <span>From Coordinator: <strong className="text-gray-700">{report.created_by_name}</strong></span>
                                        <span>Period: <strong className="text-gray-700">{report.date_from}</strong> to <strong className="text-gray-700">{report.date_to}</strong></span>
                                        <span>Sent at: {new Date(report.sent_to_accumulator_at || report.sent_to_admin_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    ✓ Received
                                </span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-5 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 mt-2">
                                {report.data_content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
