import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import FormError from '../../components/ui/FormError'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import useExport from '../../hooks/useExport'
import api from '../../api/axios'

const modules = [
    { label: 'School activities', path: 'school-activities' },
    { label: 'Student activities', path: 'student-activities' },
    { label: 'FDP / Workshop / GL', path: 'fdp' },
    { label: 'Publications', path: 'publications' },
    { label: 'Patents', path: 'patents' },
    { label: 'Certifications', path: 'certifications' },
    { label: 'Placements', path: 'placements' },
]

export default function DashboardHome() {
    const { user } = useAuth()
    const [counts, setCounts] = useState({})
    const [schools, setSchools] = useState([])
    const { exportFile, exporting, exportError } = useExport('/export/all/', { filename: 'MIS_Dashboard.xlsx', background: true })

    useEffect(() => {
        api.get('/records/dashboard-counts/').then(res => {
            const data = res.data
            setCounts({
                'school-activities': data.school_activities,
                'student-activities': data.student_activities,
                'fdp': data.fdp,
                'publications': data.publications,
                'patents': data.patents,
                'certifications': data.certifications,
                'placements': data.placements
            })
        }).catch(err => {
            console.error("Failed to fetch dashboard counts:", err);
        })
        api.get('/schools/my-schools/').then(res => setSchools(res.data)).catch(err => {
            console.error("Failed to fetch schools:", err);
        })
    }, [])

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle={schools.map(s => s.name).join(', ') || 'Loading...'}
                action={
                    <Button
                        variant="secondary"
                        onClick={() => exportFile()}
                        loading={!!exporting}
                    >
                        {exporting ? 'Exporting...' : 'Export all'}
                    </Button>
                }
            />
            {exportError && <div className="mb-4"><FormError message={exportError} /></div>}

            {/* Module counts, each linking to its module */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
                {modules.map(mod => (
                    <StatCard
                        key={mod.path}
                        label={mod.label}
                        value={counts[mod.path]}
                        to={`/faculty/${mod.path}`}
                    />
                ))}
            </div>

            <p className="text-sm text-gray-600">
                You can <strong className="font-medium text-gray-800">create and view</strong> records for your school.
                Any updates or deletions require approval from the authorized reviewer.
            </p>
        </div>
    )
}
