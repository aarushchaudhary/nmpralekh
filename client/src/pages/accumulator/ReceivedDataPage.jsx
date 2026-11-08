import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Panel from '../../components/ui/Panel'
import EmptyState from '../../components/ui/EmptyState'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

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

            <Panel className="mb-6">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="w-full sm:w-auto">
                        <label htmlFor="received-data-1" className="block text-xs font-medium text-gray-600 mb-1">Search Coordinator / School</label>
                        <input id="received-data-1"
                            type="text"
                            placeholder="Search by Title, School, or Coordinator..."
                            value={inputSchool}
                            onChange={(e) => setInputSchool(e.target.value)}
                            className={`${inputClass} sm:w-72`}
                        />
                    </div>
                    <div>
                        <label htmlFor="received-data-2" className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                        <input id="received-data-2"
                            type="date"
                            value={inputDateFrom}
                            onChange={(e) => setInputDateFrom(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="received-data-3" className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                        <input id="received-data-3"
                            type="date"
                            value={inputDateTo}
                            onChange={(e) => setInputDateTo(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleApplyFilters}>
                            Apply Filters
                        </Button>
                        <Button variant="ghost" onClick={handleClearFilters}>
                            Clear
                        </Button>
                    </div>
                </div>
            </Panel>

            {loading ? (
                <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
            ) : filteredReports.length === 0 ? (
                <EmptyState message="No data matches the current filters." />
            ) : (
                <div className="space-y-4">
                    {filteredReports.map(report => (
                        <Panel key={report.id}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                                        {report.name || 'MIS Report'} <span className="text-sm font-normal text-gray-600">from {report.created_by_school_name}</span>
                                    </h2>
                                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
                                        <span>From Coordinator: <strong className="font-medium text-gray-800">{report.created_by_name}</strong></span>
                                        <span>Period: <strong className="font-medium text-gray-800">{report.date_from}</strong> to <strong className="font-medium text-gray-800">{report.date_to}</strong></span>
                                        <span>Sent at: {new Date(report.sent_to_accumulator_at || report.sent_to_admin_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <Badge label="Received" color="dark" />
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
    )
}
