import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import RequestDataModal from './RequestDataModal'

export default function DashboardHome() {
    const [coordinators, setCoordinators] = useState([])
    const [pendingRequestsMap, setPendingRequestsMap] = useState({})
    const [metrics, setMetrics] = useState({ total: 0, submitted: 0, pending: 0 })
    const [loading, setLoading] = useState(true)
    const [selectedCoordinator, setSelectedCoordinator] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isBulkRequest, setIsBulkRequest] = useState(false)

    const fetchData = () => {
        setLoading(true)
        Promise.all([
            api.get('/users/accumulator-coordinators/'),
            api.get('/export/accumulator/dashboard/')
        ])
        .then(([coordinatorsRes, dashboardRes]) => {
            setCoordinators(coordinatorsRes.data?.results ?? coordinatorsRes.data)
            
            const dashData = dashboardRes.data
            setMetrics({
                total: dashData.total,
                submitted: dashData.submitted,
                pending: dashData.pending
            })

            const reqMap = {}
            dashData.coordinators.forEach(coord => {
                if (coord.pending_requests > 0) {
                    reqMap[coord.id] = true
                }
            })
            setPendingRequestsMap(reqMap)
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRequestData = (coordinator) => {
        setIsBulkRequest(false)
        setSelectedCoordinator(coordinator)
        setIsModalOpen(true)
    }

    const handleRequestAll = () => {
        setIsBulkRequest(true)
        setSelectedCoordinator(null)
        setIsModalOpen(true)
    }

    const columns = [
        { key: 'full_name', label: 'Coordinator Name' },
        { key: 'school_code', label: 'School' },
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
            key: 'actions', label: 'Actions', sortable: false,
            render: row => {
                const isPending = pendingRequestsMap[row.id]
                if (isPending) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                            Pending
                        </span>
                    )
                }
                return (
                    <button
                        onClick={() => handleRequestData(row)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium bg-primary-50 px-3 py-1 rounded-md transition-colors"
                    >
                        Request Data
                    </button>
                )
            }
        }
    ]

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <PageHeader 
                    title="Accumulator Dashboard" 
                    subtitle="Overview of MIS Data from Coordinators" 
                />
                <button
                    onClick={handleRequestAll}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    Request All
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Coordinators</h3>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '...' : metrics.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                    <p className="text-3xl font-bold text-green-600">{loading ? '...' : metrics.submitted}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Not Submitted</h3>
                    <p className="text-3xl font-bold text-orange-600">{loading ? '...' : metrics.pending}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Linked MIS Coordinators</h3>
                    <p className="text-sm text-gray-500">Coordinators belonging to your campus</p>
                </div>
                <Table columns={columns} data={coordinators} loading={loading} />
            </div>

            <RequestDataModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                coordinator={selectedCoordinator}
                isBulk={isBulkRequest}
                onSuccess={() => {
                    fetchData()
                }}
            />
        </div>
    )
}
