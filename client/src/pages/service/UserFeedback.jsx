import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import FormError from '../../components/ui/FormError'
import PageHeader from '../../components/ui/PageHeader'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const STATUS_PIPELINE = ['open', 'planning', 'fixing', 'testing', 'closed']

// open = needs attention, planning/fixing/testing = in progress, closed = done
const STATUS_BADGE = { open: 'red', planning: 'outline', fixing: 'outline', testing: 'outline', closed: 'dark' }
const SEVERITY_BADGE = { critical: 'red', high: 'red', medium: 'outline', low: 'gray' }
const statusLabel = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

export default function UserFeedback() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [pageError, setPageError] = useState('')
    const [expandedReportId, setExpandedReportId] = useState(null)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await api.get('/service/bug-reports/')
            setReports(res.data.results || res.data)
        } catch (err) {
            console.error("Failed to load reports", err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await api.patch(`/service/bug-reports/${reportId}/`, { status: newStatus })
            setPageError('')
            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r))
        } catch (err) {
            setPageError(err.response?.data?.detail || "Failed to update status")
        }
    }

    const toggleExpand = (reportId) => {
        setExpandedReportId(expandedReportId === reportId ? null : reportId)
    }

    const formatRole = (roleStr) => {
        if (!roleStr || roleStr === 'Unknown') return 'Unknown'
        return roleStr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader title="User Bug Reports" />
            <FormError message={pageError} />

            <Panel padded={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Status</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Severity</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Title</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Reported By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.map(r => (
                            <React.Fragment key={r.id}>
                                <tr onClick={() => toggleExpand(r.id)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedReportId === r.id ? 'bg-gray-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Badge label={statusLabel(r.status)} color={STATUS_BADGE[r.status] || 'gray'} />
                                            {STATUS_PIPELINE.indexOf(r.status) < STATUS_PIPELINE.length - 1 && (
                                                <Button
                                                    size="sm" variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        const idx = STATUS_PIPELINE.indexOf(r.status)
                                                        handleStatusChange(r.id, STATUS_PIPELINE[idx + 1])
                                                    }}
                                                >
                                                    <span>Move to {STATUS_PIPELINE[STATUS_PIPELINE.indexOf(r.status) + 1]}</span>
                                                    <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge label={r.severity.toUpperCase()} color={SEVERITY_BADGE[r.severity] || 'gray'} />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 text-sm max-w-md truncate">{r.title}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-medium text-gray-800">{r.user_name || 'Anonymous'}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{formatRole(r.user_role)}</div>
                                    </td>
                                </tr>
                                {expandedReportId === r.id && (
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <td colSpan={4} className="p-0">
                                            <div className="px-4 py-4">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</h4>
                                                            <p className="mt-1 text-sm text-gray-800 bg-white p-3 rounded-md border border-gray-200 whitespace-pre-wrap">{r.description || 'No description provided.'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL Path Affected</h4>
                                                                <p className="mt-1 text-sm text-gray-800">{r.url_path || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted At</h4>
                                                                <p className="mt-1 text-sm text-gray-800 tabular-nums">{new Date(r.submitted_at).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin Note</h4>
                                                            <p className="mt-1 text-sm text-gray-800 bg-white p-3 rounded-md border border-gray-200 whitespace-pre-wrap">{r.admin_note || 'No admin notes.'}</p>
                                                        </div>
                                                        {r.linked_ticket && (
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Linked Automated Ticket</h4>
                                                                <div className="mt-1 text-sm text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
                                                                    <span className="font-semibold">Ticket #{r.linked_ticket}:</span> {r.linked_ticket_title}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                </div>
                {reports.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-600">No bug reports found.</div>
                )}
            </Panel>
        </div>
    )
}
