import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
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

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="MIS Coordinator Portal — Read-only access to school data"
            />

            {requests.length > 0 && (
                <div className="mt-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Pending Data Requests</h3>
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-orange-800 font-medium">Request from {req.accumulator_name}</span>
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">Pending</span>
                                    </div>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Please send MIS Data for the period: <strong>{req.date_from}</strong> to <strong>{req.date_to}</strong>
                                    </p>
                                </div>
                                <div>
                                    <Link to="/coordinator/send-mis-data" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Fulfill Request
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Quick Info Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Your Role</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        As an MIS Coordinator, you have <span className="font-medium text-gray-800">read-only access</span> to
                        all MIS records for your assigned school. You can export accumulated data in
                        Excel or JSON format for any date range.
                    </p>
                </div>

                {/* Quick Action Card */}
                <Link to="/coordinator/export"
                   className="group bg-white rounded-xl border border-gray-100 p-6 shadow-sm
                              hover:border-primary-200 hover:shadow-md transition-all cursor-pointer block">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center
                                        group-hover:bg-emerald-100 transition-colors">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Data Export</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Generate and download MIS reports for your school.
                        Choose from <span className="font-medium text-gray-800">Excel</span> (multi-sheet workbook)
                        or <span className="font-medium text-gray-800">JSON</span> formats.
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary-600
                                     group-hover:text-primary-700 transition-colors">
                        Go to Export
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </Link>
            </div>
        </div>
    )
}
