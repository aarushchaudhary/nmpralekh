import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                    color={row.is_active ? 'dark' : 'gray'}
                />
            )
        },
        {
            key: 'actions', label: 'Actions', sortable: false,
            render: row => {
                const isPending = pendingRequestsMap[row.id]
                if (isPending) {
                    return (
                        <Badge label="Pending" color="outline" />
                    )
                }
                return (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRequestData(row)}
                    >
                        Request data
                    </Button>
                )
            }
        }
    ]

    return (
        <>
        <div className="space-y-6">
            <PageHeader
                title="Accumulator Dashboard"
                subtitle="Overview of MIS Data from Coordinators"
                action={
                    <Button onClick={handleRequestAll}>
                        Request all
                    </Button>
                }
            />

            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
                <StatCard label="Total coordinators" value={loading ? null : metrics.total} />
                <StatCard label="Submitted" value={loading ? null : metrics.submitted} />
                <StatCard label="Not submitted" value={loading ? null : metrics.pending} />
            </div>

            <section>
                <div className="mb-3">
                    <h2 className="text-sm font-semibold text-gray-900">Linked MIS coordinators</h2>
                    <p className="mt-0.5 text-xs text-gray-500">Coordinators belonging to your campus</p>
                </div>
                <Table columns={columns} data={coordinators} loading={loading} />
            </section>
        </div>

        {/* Kept outside the space-y stack so its margins don't offset the dialog */}
        <RequestDataModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            coordinator={selectedCoordinator}
            isBulk={isBulkRequest}
            onSuccess={() => {
                fetchData()
            }}
        />
        </>
    )
}
