import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import api from '../../api/axios'

function DiffRow({ field, oldVal, newVal }) {
    const changed = String(oldVal) !== String(newVal)
    return (
        <tr className={changed ? 'bg-yellow-50' : ''}>
            <td className="px-3 py-2 text-xs font-medium text-gray-500 capitalize w-1/4">
                {field.replace(/_/g, ' ')}
            </td>
            <td className="px-3 py-2 text-xs text-red-600 w-3/8">
                {oldVal !== null && oldVal !== undefined ? String(oldVal) : '—'}
            </td>
            <td className="px-3 py-2 text-xs text-green-600 w-3/8">
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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-4
                      border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            label={request.action}
                            color={isDelete ? 'red' : 'yellow'}
                        />
                        <span className="text-sm font-semibold text-gray-800 capitalize">
                            {request.table_name?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                            Record #{request.record_id}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
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
                    <div className="p-5">
                        <p className="text-xs font-semibold text-red-500 uppercase mb-3">
                            Record to be deleted
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allFields.map(field => (
                                <div key={field}
                                    className="bg-red-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 capitalize mb-0.5">
                                        {field.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-sm text-red-700 font-medium break-words">
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
                            border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase">Field</p>
                            <p className="text-xs font-semibold text-red-400 uppercase">Before</p>
                            <p className="text-xs font-semibold text-green-500 uppercase">After</p>
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

    const fetchRequests = useCallback(() => {
        setLoading(true)
        api.get('/audit/')
            .then(res => setRequests(res.data?.results ?? res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

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
          fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${message.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
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
                <div className="flex flex-col items-center justify-center
                        py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100
                          flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-green-500" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-400">
                        All caught up — no pending requests
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        {requests.length} pending request{requests.length !== 1 ? 's' : ''}
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
                </div>
            )}
        </div>
    )
}