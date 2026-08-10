import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'

export default function DashboardHome() {
    const [accumulators, setAccumulators] = useState([])
    const [loading, setLoading] = useState(true)

    const [totalMisRecords, setTotalMisRecords] = useState(0)
    const [totalCoordinators, setTotalCoordinators] = useState(0)

    useEffect(() => {
        const fetchDashboard = api.get('/export/chronicle/dashboard/')
        const fetchReports = api.get('/export/reports/received/')

        Promise.all([fetchDashboard, fetchReports])
            .then(([dashRes, repRes]) => {
                const accumulatorsData = dashRes.data?.results ?? dashRes.data
                setAccumulators(accumulatorsData)
                
                const coordsCount = accumulatorsData.reduce((acc, curr) => acc + (curr.total_coordinators || 0), 0)
                setTotalCoordinators(coordsCount)
                
                const reports = repRes.data?.results ?? repRes.data
                setTotalMisRecords(reports.length)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const columns = [
        { key: 'full_name', label: 'Accumulator Name' },
        { key: 'campus_name', label: 'Campus' },
        { key: 'username', label: 'Username' },
        {
            key: 'tracking', label: 'Coordinators Tracking', sortable: false,
            render: row => (
                <div className="flex gap-2 items-center">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">
                        {row.coordinators_submitted} Submitted
                    </span>
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-md">
                        {row.coordinators_pending} Pending
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {row.total_coordinators} Total
                    </span>
                </div>
            )
        },
        {
            key: 'submission_status', label: 'Accumulator Submission', sortable: false,
            render: row => (
                <Badge
                    label={row.has_submitted ? 'Submitted' : 'Pending'}
                    color={row.has_submitted ? 'green' : 'gray'}
                />
            )
        }
    ]

    return (
        <div>
            <PageHeader 
                title="Chronicle Master" 
                subtitle="Overview and Management of Chronicles" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Accumulators</h3>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '...' : accumulators.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Coordinators</h3>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '...' : totalCoordinators}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total MIS Records</h3>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '...' : totalMisRecords}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">MIS Accumulators</h3>
                        <p className="text-sm text-gray-500">List of all active MIS Accumulators across campuses</p>
                    </div>
                </div>
                <Table columns={columns} data={accumulators} loading={loading} />
            </div>

        </div>
    )
}
