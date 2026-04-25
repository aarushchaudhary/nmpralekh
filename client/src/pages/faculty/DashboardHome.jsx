import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import useExport from '../../hooks/useExport'
import api from '../../api/axios'

const modules = [
    { label: 'School Activities', path: 'school-activities', endpoint: '/records/school-activities/' },
    { label: 'Student Activities', path: 'student-activities', endpoint: '/records/student-activities/' },
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
    const { exportFile, exporting } = useExport('/export/all/', 'MIS_Dashboard.xlsx')

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
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle={schools.map(s => s.name).join(', ') || 'Loading...'}
                action={
                    <button
                        onClick={() => exportFile()}
                        disabled={exporting}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700
                                   text-white text-sm font-medium rounded-lg
                                   transition-colors disabled:opacity-50
                                   disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {exporting ? 'Exporting...' : '⬇ Export All'}
                    </button>
                }
            />

            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-700">
                    You can <strong>create and view</strong> records for your school.
                    Any updates or deletions require approval from the authorized reviewer.
                </p>
            </div>

            {/* Module cards with counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {modules.map(mod => (
                    <Link
                        key={mod.path}
                        to={`/faculty/${mod.path}`}
                        className="bg-white rounded-xl border border-gray-100 p-5
                       hover:border-primary-200 hover:shadow-sm
                       transition-all group"
                    >
                        <p className="text-2xl font-bold text-gray-800 group-hover:text-primary-600">
                            {counts[mod.path] ?? '—'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{mod.label}</p>
                        <p className="text-xs text-primary-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            View all →
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    )
}