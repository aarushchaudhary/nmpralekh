import { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import api from '../../api/axios'

const statusColor = {
    approved: 'green',
    rejected: 'red',
    pending: 'yellow',
}

export default function History() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        setLoading(true)
        api.get('/audit/history/', { params: { page: currentPage, page_size: 25 } })
            .then(res => {
                setHistory(res.data?.results ?? res.data)
                setTotalPages(res.data?.total_pages ?? 1)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [currentPage])

    const columns = [
        { key: 'table_name', label: 'Table', render: row => <span className="capitalize text-gray-700">{row.table_name?.replace(/_/g, ' ')}</span> },
        { key: 'record_id', label: 'Record', render: row => <span className="text-gray-500">#{row.record_id}</span> },
        { key: 'action', label: 'Action', render: row => <Badge label={row.action} color={row.action === 'DELETE' ? 'red' : 'yellow'} /> },
        { key: 'requested_by', label: 'Requested By', render: row => <span className="text-gray-700">{row.requested_by_detail?.full_name}</span> },
        { key: 'reviewed_by', label: 'Reviewed By', render: row => <span className="text-gray-700">{row.reviewed_by_detail?.full_name ?? '—'}</span> },
        { key: 'date', label: 'Date', render: row => <span className="text-gray-500">{row.reviewed_at?.slice(0, 10) ?? row.requested_at?.slice(0, 10)}</span> },
        { key: 'status', label: 'Status', render: row => <Badge label={row.status} color={statusColor[row.status]} /> },
    ]

    return (
        <div>
            <PageHeader
                title="Request History"
                subtitle="All past approved and rejected change requests"
            />

            <Table
                columns={columns}
                data={history}
                loading={loading}
                serverPagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}