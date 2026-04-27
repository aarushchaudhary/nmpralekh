import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'

export default function DashboardHome() {
    const { user } = useAuth()

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="MIS Coordinator Portal — Read-only access to school data"
            />

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
                <a href="/coordinator/export"
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
                </a>
            </div>
        </div>
    )
}
