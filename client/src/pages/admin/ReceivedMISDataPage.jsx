import { useState } from 'react'
import useRecords from '../../hooks/useRecords'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import { MISReportModal, ReportFilters } from '../../components/shared/MISReports'
import { reportColumns } from '../../components/shared/misReportColumns'

// when this viewer's copy arrived; shared by admin, MIS accumulator, super admin and chronicle master
const SENT_AT = {
    admin: 'sent_to_admin_at',
    mis_accumulator: 'sent_to_accumulator_at',
    super_admin: 'sent_to_super_admin_at',
    chronicle_master: 'sent_to_chronicle_master_at',
}

export default function ReceivedMISDataPage() {
    const { user } = useAuth()
    const [filters, setFilters] = useState({})
    const [openReport, setOpenReport] = useState(null)
    const { data, loading, error, totalPages, currentPage, goToPage } =
        useRecords('/export/reports/received/', { pageSize: 10, filters })

    const columns = [
        ...reportColumns(setOpenReport),
        { key: 'created_by_name', label: 'Sent by' },
        {
            key: 'sent_at', label: 'Received',
            render: r => r[SENT_AT[user?.role]] ? new Date(r[SENT_AT[user?.role]]).toLocaleString() : '—',
        },
    ]

    return (
        <div className="max-w-5xl mx-auto">
            <PageHeader title="Received MIS Data" subtitle="Review MIS data sent to you" />

            <ReportFilters searchLabel="Search school, campus or sender"
                onApply={f => { setFilters(f); goToPage(1) }} />

            <Table columns={columns} data={data} loading={loading} error={error}
                serverPagination totalPages={totalPages} currentPage={currentPage} onPageChange={goToPage} />

            <MISReportModal report={openReport} onClose={() => setOpenReport(null)} />
        </div>
    )
}
