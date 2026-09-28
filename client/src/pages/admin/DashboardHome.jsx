import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard';
import useExport from '../../hooks/useExport'
import { Link } from 'react-router-dom'
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
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle={schools.map(s => s.name).join(', ') || 'Loading schools...'}
                action={
                    <button
                        onClick={() => exportRecords()}
                        disabled={!!exportingRecords}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 shadow-sm active:scale-95
                                   text-white text-sm font-medium rounded-lg
                                   transition-colors disabled:opacity-50
                                   disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {exportingRecords ? 'Exporting...' : '⬇ Export All'}
                    </button>
                }
            />

            {/* Module counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="School Acts" value={counts['school-activities']} accent="green" />
                <StatCard label="Student Acts" value={counts['student-activities']} accent="purple" />
                <StatCard label="FDP/WS/GL" value={counts['fdp']} accent="orange" />
                <StatCard label="Publications" value={counts['publications']} accent="red" />
                <StatCard label="Patents" value={counts['patents']} accent="yellow" />
                <StatCard label="Certifications" value={counts['certifications']} accent="blue" />
                <StatCard label="Placements" value={counts['placements']} accent="green" />
            </div>

            {/* Quick links to all modules */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">All Modules</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {modules.map(mod => (
                        <Link
                            key={mod.path}
                            to={`/admin/${mod.path}`}
                            className="block p-4 rounded-lg border border-gray-100
                         hover:border-primary-500 hover:ring-1 hover:ring-primary-500 bg-gray-50/50 hover:bg-white
                         text-sm font-medium text-gray-900 hover:text-primary-700
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