import { useState, useEffect } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormError from '../../components/ui/FormError'
import api from '../../api/axios'
import { exportErrorMessage } from '../../hooks/useExport'

const modules = [
    { label: 'School activities', path: 'school-activities' },
    { label: 'Student activities', path: 'student-activities' },
    { label: 'FDP / Workshop / GL', path: 'fdp' },
    { label: 'Publications', path: 'publications' },
    { label: 'Patents', path: 'patents' },
    { label: 'Certifications', path: 'certifications' },
    { label: 'Placements', path: 'placements' },
]

const exportEndpoints = [
    { label: 'School activities', endpoint: '/export/school-activities/', file: 'school_activities.xlsx' },
    { label: 'Student activities', endpoint: '/export/student-activities/', file: 'student_activities.xlsx' },
    { label: 'FDP / Workshop / GL', endpoint: '/export/fdp/', file: 'fdp.xlsx' },
    { label: 'Publications', endpoint: '/export/publications/', file: 'publications.xlsx' },
    { label: 'Patents', endpoint: '/export/patents/', file: 'patents.xlsx' },
    { label: 'Certifications', endpoint: '/export/certifications/', file: 'certifications.xlsx' },
    { label: 'Placements', endpoint: '/export/placements/', file: 'placements.xlsx' },
]

export default function DashboardHome() {
    const { user } = useAuth()
    const [counts, setCounts] = useState({})
    const [schools, setSchools] = useState([])
    const [exporting, setExporting] = useState(null)
    const [exportError, setExportError] = useState('')

    useEffect(() => {
        api.get('/schools/').then(res => {
            setSchools(res.data?.results ?? res.data)
        })
        api.get('/records/dashboard-counts/').then(res => {
            setCounts(Object.fromEntries(modules.map(mod => [mod.path, res.data[mod.path.replaceAll('-', '_')]])))
        }).catch(() => { })
    }, [])

    const handleExport = async (endpoint, filename, key = filename) => {
        setExporting(key)
        setExportError('')
        try {
            const res = await api.get(endpoint, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setExportError(await exportErrorMessage(err))
        } finally {
            setExporting(null)
        }
    }

    const handleExportAll = () => handleExport('/export/all/', 'MIS_Dashboard.xlsx', 'all')

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="Read-only view across all schools"
            />
            <FormError message={exportError} />

            {/* Module counts, each linking to its module */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
                {modules.map(mod => (
                    <StatCard
                        key={mod.path}
                        label={mod.label}
                        value={counts[mod.path]}
                        to={`/superadmin/${mod.path}`}
                    />
                ))}
            </div>

            <p className="text-sm text-gray-600">
                You have <strong className="font-medium text-gray-800">read-only access</strong> to all records across all schools.
                Use the export buttons to download data as Excel files.
            </p>

            {/* Schools overview */}
            <Panel title={`Active schools (${schools.filter(s => s.is_active).length})`}>
                <div className="flex flex-wrap gap-2">
                    {schools.filter(s => s.is_active).map(school => (
                        <Badge key={school.id} label={school.name} color="gray" />
                    ))}
                    {schools.length === 0 && (
                        <p className="text-sm text-gray-500">No schools found</p>
                    )}
                </div>
            </Panel>

            {/* Export section */}
            <Panel
                title="Export data"
                description="Download records as Excel files"
                action={
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExportAll}
                        disabled={!!exporting}
                        loading={exporting === 'all'}
                    >
                        {exporting === 'all' ? 'Exporting...' : 'Export all modules'}
                    </Button>
                }
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {exportEndpoints.map(exp => (
                        <Button
                            key={exp.file}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => handleExport(exp.endpoint, exp.file)}
                            disabled={!!exporting}
                            loading={exporting === exp.file}
                        >
                            {exporting !== exp.file && (
                                <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="truncate">{exp.label}</span>
                        </Button>
                    ))}
                </div>
            </Panel>
        </div>
    )
}
