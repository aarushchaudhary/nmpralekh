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
    const { exportFile, exporting } = useExport('/export/all/', 'MIS_Dashboard.xlsx')

    useEffect(() => {
        // fetch school names
        api.get('/schools/my-schools/').then(res => setSchools(res.data))

        // fetch counts for each module
        modules.forEach(mod => {
            api.get(mod.endpoint).then(res => {
                const data = res.data?.results ?? res.data
                setCounts(prev => ({ ...prev, [mod.path]: data.length }))
            }).catch(() => { })
        })
    }, [])

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle={schools.map(s => s.name).join(', ') || 'Loading schools...'}
                action={
                    <button
                        onClick={() => exportFile()}
                        disabled={exporting}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700
                                   text-white text-sm font-medium rounded-lg
                                   transition-colors disabled:opacity-50
                                   disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Exporting...
                            </>
                        ) : '⬇ Export All'}
                    </button>
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