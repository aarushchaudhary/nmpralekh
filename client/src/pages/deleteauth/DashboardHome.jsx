import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
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
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="Review and authorize pending change requests"
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-5">
                    <p className="text-sm text-yellow-700 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending ?? '—'}</p>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-100 p-5">
                    <p className="text-sm text-green-700 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved ?? '—'}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-100 p-5">
                    <p className="text-sm text-red-700 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected ?? '—'}</p>
                </div>
            </div>

            {/* Recent pending */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Recent Pending Requests
                    </h2>
                    <Link to="/deleteauth/pending"
                        className="text-xs text-primary-600 hover:underline">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                    </div>
                ) : recent.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">
                        No pending requests
                    </p>
                ) : (
                    <div className="space-y-2">
                        {recent.map(req => (
                            <div key={req.id}
                                className="flex items-center justify-between p-3
                           rounded-lg border border-gray-50 bg-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {req.table_name?.replace(/_/g, ' ')} — Record #{req.record_id}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Requested by {req.requested_by_detail?.full_name} ·{' '}
                                        {req.requested_at?.slice(0, 10)}
                                    </p>
                                </div>
                                <Badge
                                    label={req.action}
                                    color={req.action === 'DELETE' ? 'red' : 'yellow'}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}