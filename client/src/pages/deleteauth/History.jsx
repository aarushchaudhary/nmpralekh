import { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'

const statusColor = {
    approved: 'green',
    rejected: 'red',
    pending: 'yellow',
}

export default function History() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/audit/history/')
            .then(res => setHistory(res.data?.results ?? res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            <PageHeader
                title="Request History"
                subtitle="All past approved and rejected change requests"
            />

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8
                          border-b-2 border-primary-600" />
                </div>
            ) : history.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-16">
                    No history yet
                </p>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Table', 'Record', 'Action', 'Requested By',
                                    'Reviewed By', 'Date', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs
                                         font-medium text-gray-500 uppercase">
                                            {h}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 capitalize text-gray-700">
                                        {req.table_name?.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        #{req.record_id}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={req.action}
                                            color={req.action === 'DELETE' ? 'red' : 'yellow'}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {req.requested_by_detail?.full_name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {req.reviewed_by_detail?.full_name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {req.reviewed_at?.slice(0, 10) ?? req.requested_at?.slice(0, 10)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={req.status}
                                            color={statusColor[req.status]}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}