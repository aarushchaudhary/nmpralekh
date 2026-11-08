import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

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
                <div className="flex flex-wrap gap-1.5 items-center">
                    <Badge label={`${row.coordinators_submitted} Submitted`} color="dark" />
                    <Badge label={`${row.coordinators_pending} Pending`} color="outline" />
                    <Badge label={`${row.total_coordinators} Total`} color="gray" />
                </div>
            )
        },
        {
            key: 'submission_status', label: 'Accumulator Submission', sortable: false,
            render: row => (
                <Badge
                    label={row.has_submitted ? 'Submitted' : 'Pending'}
                    color={row.has_submitted ? 'dark' : 'outline'}
                />
            )
        }
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Chronicle Master"
                subtitle="Overview and Management of Chronicles"
            />

            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
                <StatCard label="Total accumulators" value={loading ? null : accumulators.length} />
                <StatCard label="Total coordinators" value={loading ? null : totalCoordinators} />
                <StatCard label="Total MIS records" value={loading ? null : totalMisRecords} />
            </div>

            <section>
                <div className="mb-3">
                    <h2 className="text-sm font-semibold text-gray-900">MIS accumulators</h2>
                    <p className="mt-0.5 text-xs text-gray-500">List of all active MIS Accumulators across campuses</p>
                </div>
                <Table columns={columns} data={accumulators} loading={loading} />
            </section>
        </div>
    )
}
