import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import api from '../../api/axios'

function DiffRow({ field, oldVal, newVal }) {
    const changed = String(oldVal) !== String(newVal)
    return (
        <tr className={changed ? 'bg-gray-50' : ''}>
            <td className="px-3 py-2 text-xs font-medium text-gray-600 capitalize w-1/4">
                {field.replace(/_/g, ' ')}
            </td>
            <td className={`px-3 py-2 text-xs w-3/8 ${changed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                {oldVal !== null && oldVal !== undefined ? String(oldVal) : '—'}
            </td>
            <td className={`px-3 py-2 text-xs w-3/8 ${changed ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                {newVal !== null && newVal !== undefined ? String(newVal) : '—'}
            </td>
        </tr>
    )
}

function AuditCard({ request, onApprove, onReject, loading }) {
    const isDelete = request.action === 'DELETE'
    const oldData = request.old_data || {}
    const newData = request.new_data || {}

    // fields to skip in the diff — internal fields
    const skipFields = ['id', 'created_by', 'created_at', 'updated_at',
        'is_deleted', 'pending_audit', 'pending_audit_id']

    const allFields = Object.keys(oldData).filter(k => !skipFields.includes(k))

    return (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3
                      border-b border-gray-200">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            label={request.action}
                            color={isDelete ? 'red' : 'gray'}
                        />
                        <span className="text-sm font-semibold text-gray-800 capitalize">
                            {request.table_name?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500 tabular-nums">
                            Record #{request.record_id}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        Requested by{' '}
                        <span className="font-medium text-gray-600">
                            {request.requested_by_detail?.full_name}
                        </span>
                        {' '}({request.requested_by_detail?.role?.replace('_', ' ')})
                        {' · '}{request.requested_at?.slice(0, 10)}
                    </p>
                </div>

                {/* Approve / Reject */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onReject(request.id)}
                        loading={loading === `reject-${request.id}`}
                        disabled={!!loading}
                    >
                        Reject
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onApprove(request.id)}
                        loading={loading === `approve-${request.id}`}
                        disabled={!!loading}
                    >
                        Approve
                    </Button>
                </div>
            </div>

            {/* Diff table */}
            <div className="overflow-x-auto">
                {isDelete ? (
                    // For DELETE show what will be removed
                    <div className="p-4">
                        <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-3">
                            Record to be deleted
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allFields.map(field => (
                                <div key={field}
                                    className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <p className="text-xs text-gray-500 capitalize mb-0.5">
                                        {field.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-sm text-gray-900 font-medium break-words">
                                        {oldData[field] !== null && oldData[field] !== undefined
                                            ? String(oldData[field]) : '—'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // For UPDATE show before/after diff
                    <div>
                        <div className="grid grid-cols-3 px-3 py-2 bg-gray-50
                            border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Field</p>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Before</p>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">After</p>
                        </div>
                        <table className="w-full">
                            <tbody>
                                {allFields.map(field => (
                                    <DiffRow
                                        key={field}
                                        field={field}
                                        oldVal={oldData[field]}
                                        newVal={newData[field] ?? oldData[field]}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function PendingRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [message, setMessage] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    const fetchRequests = useCallback(() => {
        setLoading(true)
        api.get('/audit/', { params: { page: currentPage, page_size: 25 } })
            .then(res => {
                setRequests(res.data?.results ?? res.data)
                setTotalPages(res.data?.total_pages ?? 1)
                setTotalCount(res.data?.count ?? (res.data?.results ?? res.data).length)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [currentPage])

    useEffect(() => { fetchRequests() }, [fetchRequests])

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type })
        setTimeout(() => setMessage(null), 3000)
    }

    const handleApprove = async (id) => {
        setActionLoading(`approve-${id}`)
        try {
            await api.post(`/audit/${id}/approve/`)
            showMessage('Request approved and changes applied', 'success')
            fetchRequests()
        } catch (err) {
            showMessage(
                err.response?.data?.detail || 'Approval failed',
                'error'
            )
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id) => {
        setActionLoading(`reject-${id}`)
        try {
            await api.post(`/audit/${id}/reject/`)
            showMessage('Request rejected — record unchanged', 'error')
            fetchRequests()
        } catch (err) {
            showMessage(
                err.response?.data?.detail || 'Rejection failed',
                'error'
            )
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div>
            <PageHeader
                title="Pending Requests"
                subtitle="Review and authorize all pending changes"
            />

            {/* Toast message */}
            {message && (
                <div className={`
          fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg text-sm font-medium
          ${message.type === 'success'
                        ? 'bg-gray-800 text-white'
                        : 'bg-primary-600 text-white'
                    }
        `}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8
                          border-b-2 border-primary-600" />
                </div>
            ) : requests.length === 0 ? (
                <EmptyState message="All caught up — no pending requests" />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 tabular-nums">
                        {totalCount} pending request{totalCount !== 1 ? 's' : ''}
                    </p>
                    {requests.map(req => (
                        <AuditCard
                            key={req.id}
                            request={req}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            loading={actionLoading}
                        />
                    ))}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600 tabular-nums">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}