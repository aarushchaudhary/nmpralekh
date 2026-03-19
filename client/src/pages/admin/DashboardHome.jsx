import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import useExport from '../../hooks/useExport'
import { Link } from 'react-router-dom'

function StatCard({ label, value, color = 'blue' }) {
    const colors = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
    }
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${colors[color]}`}>{value ?? '—'}</p>
        </div>
    )
}

const modules = [
    { label: 'Exams Conducted', path: 'exams', endpoint: '/records/exams/' },
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
    const { exportFile: exportRecords,   exporting: exportingRecords }   = useExport('/export/all/',           'MIS_Dashboard.xlsx')
    const { exportFile: exportAcademics, exporting: exportingAcademics } = useExport('/export/academics/all/', 'Academics_All.xlsx')

    useEffect(() => {
        api.get('/records/dashboard-counts/').then(res => {
            const data = res.data
            setCounts({
                'exams': data.exams,
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
                subtitle={schools.map(s => s.name).join(', ') || 'Loading schools...'}
                action={
                    <div className="flex gap-2">
                        <button
                            onClick={() => exportAcademics()}
                            disabled={!!exportingAcademics}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700
                                       text-white text-sm font-medium rounded-lg
                                       transition-colors disabled:opacity-50
                                       disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {exportingAcademics ? 'Exporting...' : '⬇ Academics'}
                        </button>
                        <button
                            onClick={() => exportRecords()}
                            disabled={!!exportingRecords}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700
                                       text-white text-sm font-medium rounded-lg
                                       transition-colors disabled:opacity-50
                                       disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {exportingRecords ? 'Exporting...' : '⬇ Records'}
                        </button>
                    </div>
                }
            />

            {/* Module counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Exams" value={counts['exams']} color="blue" />
                <StatCard label="School Acts" value={counts['school-activities']} color="green" />
                <StatCard label="Student Acts" value={counts['student-activities']} color="purple" />
                <StatCard label="FDP/WS/GL" value={counts['fdp']} color="orange" />
                <StatCard label="Publications" value={counts['publications']} color="red" />
                <StatCard label="Patents" value={counts['patents']} color="yellow" />
                <StatCard label="Certifications" value={counts['certifications']} color="blue" />
                <StatCard label="Placements" value={counts['placements']} color="green" />
            </div>

            {/* Quick links to all modules */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">All Modules</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {modules.map(mod => (
                        <Link
                            key={mod.path}
                            to={`/admin/${mod.path}`}
                            className="block p-4 rounded-lg border border-gray-100
                         hover:border-primary-200 hover:bg-primary-50
                         text-sm text-gray-600 hover:text-primary-700
                         transition-colors"
                        >
                            {mod.label} →
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}