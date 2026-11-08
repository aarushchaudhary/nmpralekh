import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import useExport from '../../hooks/useExport'

const modules = [
    { label: 'School activities', path: 'school-activities', endpoint: '/records/school-activities/' },
    { label: 'Student activities', path: 'student-activities', endpoint: '/records/student-activities/' },
    { label: 'FDP / Workshop / GL', path: 'fdp', endpoint: '/records/fdp/' },
    { label: 'Publications', path: 'publications', endpoint: '/records/publications/' },
    { label: 'Patents', path: 'patents', endpoint: '/records/patents/' },
    { label: 'Certifications', path: 'certifications', endpoint: '/records/certifications/' },
    { label: 'Placements', path: 'placements', endpoint: '/records/placements/' },
]

export default function DashboardHome() {
    const { user } = useAuth()
    const [counts, setCounts] = useState({})
    const [schools, setSchools] = useState([])
    const { exportFile: exportRecords, exporting: exportingRecords } = useExport('/export/all/', { filename: 'MIS_Dashboard.xlsx' })

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
        })
        api.get('/schools/my-schools/').then(res => setSchools(res.data))
    }, [])

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle={schools.map(s => s.name).join(', ') || 'Loading schools...'}
                action={
                    <Button
                        variant="secondary"
                        onClick={() => exportRecords()}
                        loading={!!exportingRecords}
                    >
                        {exportingRecords ? 'Exporting...' : 'Export all'}
                    </Button>
                }
            />

            {/* Module counts, each linking to its module */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
                {modules.map(mod => (
                    <StatCard
                        key={mod.path}
                        label={mod.label}
                        value={counts[mod.path]}
                        to={`/admin/${mod.path}`}
                    />
                ))}
            </div>
        </div>
    )
}
