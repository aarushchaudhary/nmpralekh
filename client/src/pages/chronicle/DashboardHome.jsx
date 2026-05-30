import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'

export default function DashboardHome() {
    const [accumulators, setAccumulators] = useState([])
    const [loading, setLoading] = useState(true)

    const [totalMisRecords, setTotalMisRecords] = useState(0)

    useEffect(() => {
        const fetchAccumulators = api.get('/users/chronicle/accumulators/')
        const fetchReports = api.get('/export/reports/received/')

        Promise.all([fetchAccumulators, fetchReports])
            .then(([accRes, repRes]) => {
                setAccumulators(accRes.data?.results ?? accRes.data)
                
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
        { key: 'email', label: 'Email Address' },
        {
            key: 'is_active', label: 'Status', sortable: false,
            render: row => (
                <Badge
                    label={row.is_active ? 'Active' : 'Inactive'}
                    color={row.is_active ? 'green' : 'red'}
                />
            )
        },
        {
            key: 'coordinator_count', label: 'MIS Coordinators',
            render: row => (
                <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full text-xs">
                    {row.coordinator_count}
                </span>
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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total MIS Records</h3>
                    <p className="text-3xl font-bold text-gray-800">{totalMisRecords}</p>
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
