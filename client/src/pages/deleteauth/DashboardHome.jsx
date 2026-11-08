import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import Panel from '../../components/ui/Panel'
import api from '../../api/axios'

export default function DashboardHome() {
    const { user } = useAuth()
    const [stats, setStats] = useState({})
    const [recent, setRecent] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/audit/'),
            api.get('/audit/history/'),
        ]).then(([pending, history]) => {
            const pendingData = pending.data?.results ?? pending.data
            const historyData = history.data?.results ?? history.data

            setStats({
                pending: pendingData.length,
                approved: historyData.filter(r => r.status === 'approved').length,
                rejected: historyData.filter(r => r.status === 'rejected').length,
            })
            setRecent(pendingData.slice(0, 5))
        }).catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="Review and authorize pending change requests"
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
                <StatCard label="Pending" value={stats.pending} to="/deleteauth/pending" />
                <StatCard label="Approved" value={stats.approved} />
                <StatCard label="Rejected" value={stats.rejected} />
            </div>

            {/* Recent pending */}
            <Panel
                title="Recent pending requests"
                padded={false}
                action={
                    <Link to="/deleteauth/pending"
                        className="text-sm font-medium text-primary-700 hover:underline rounded
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                        View all
                    </Link>
                }
            >
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                    </div>
                ) : recent.length === 0 ? (
                    <p className="text-sm text-gray-500 px-4 py-8 text-center">
                        No pending requests
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {recent.map(req => (
                            <li key={req.id}
                                className="flex items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 capitalize">
                                        {req.table_name?.replace(/_/g, ' ')} — Record #{req.record_id}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                                        Requested by {req.requested_by_detail?.full_name} ·{' '}
                                        {req.requested_at?.slice(0, 10)}
                                    </p>
                                </div>
                                <Badge
                                    label={req.action}
                                    color={req.action === 'DELETE' ? 'red' : 'gray'}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    )
}
