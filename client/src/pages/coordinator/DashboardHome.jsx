import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'
import { Link } from 'react-router-dom'

export default function DashboardHome() {
    const { user } = useAuth()
    const [requests, setRequests] = useState([])

    useEffect(() => {
        api.get('/export/data-requests/')
            .then(res => {
                const data = res.data?.results ?? res.data
                // Filter only pending requests
                setRequests(data.filter(req => req.status === 'pending'))
            })
            .catch(err => console.error(err))
    }, [])

    const linkButton = 'inline-flex items-center justify-center h-8 px-3 text-xs font-medium whitespace-nowrap rounded-md ' +
        'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1'

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="MIS Coordinator Portal — Read-only access to school data"
            />

            {requests.length > 0 && (
                <Panel title="Pending data requests" padded={false}>
                    <ul className="divide-y divide-gray-100">
                        {requests.map(req => (
                            <li key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">Request from {req.accumulator_name}</span>
                                        <Badge label="Pending" color="outline" />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Please send MIS Data for the period: <strong className="font-medium text-gray-800 tabular-nums">{req.date_from}</strong> to <strong className="font-medium text-gray-800 tabular-nums">{req.date_to}</strong>
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Link to="/coordinator/send-mis-data" className={linkButton}>
                                        Fulfill request
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Panel title="Your role">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        As an MIS Coordinator, you have <span className="font-medium text-gray-800">read-only access</span> to
                        all MIS records for your assigned school. You can export accumulated data in
                        Excel or JSON format for any date range.
                    </p>
                </Panel>

                <Panel
                    title="Data export"
                    action={
                        <Link to="/coordinator/export" className={linkButton}>
                            Go to export
                        </Link>
                    }
                >
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Generate and download MIS reports for your school.
                        Choose from <span className="font-medium text-gray-800">Excel</span> (multi-sheet workbook)
                        or <span className="font-medium text-gray-800">JSON</span> formats.
                    </p>
                </Panel>
            </div>
        </div>
    )
}
