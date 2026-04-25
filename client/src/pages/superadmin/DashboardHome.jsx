import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
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

const exportEndpoints = [
    { label: 'School Activities', endpoint: '/export/school-activities/', file: 'school_activities.xlsx' },
    { label: 'Student Activities', endpoint: '/export/student-activities/', file: 'student_activities.xlsx' },
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

    useEffect(() => {
        api.get('/schools/').then(res => {
            setSchools(res.data?.results ?? res.data)
        })
        modules.forEach(mod => {
            api.get(mod.endpoint).then(res => {
                const data = res.data?.results ?? res.data
                setCounts(prev => ({ ...prev, [mod.path]: data.length }))
            }).catch(() => { })
        })
    }, [])

    const handleExport = async (endpoint, filename) => {
        setExporting(filename)
        try {
            const res = await api.get(endpoint, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            window.URL.revokeObjectURL(url)
        } catch {
        } finally {
            setExporting(null)
        }
    }

    const handleExportAll = async () => {
        setExporting('all')
        try {
            const res = await api.get('/export/all/', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = 'MIS_Dashboard.xlsx'
            a.click()
            window.URL.revokeObjectURL(url)
        } catch {
        } finally {
            setExporting(null)
        }
    }

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.full_name}`}
                subtitle="Read-only view across all schools"
            />

            {/* Info banner */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-700">
                    You have <strong>read-only access</strong> to all records across all schools.
                    Use the export buttons to download data as Excel files.
                </p>
            </div>

            {/* Schools overview */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    Active Schools ({schools.filter(s => s.is_active).length})
                </h2>
                <div className="flex flex-wrap gap-2">
                    {schools.filter(s => s.is_active).map(school => (
                        <span key={school.id}
                            className="px-3 py-1 rounded-full bg-gray-100
                         text-sm text-gray-600 font-medium">
                            {school.name}
                        </span>
                    ))}
                    {schools.length === 0 && (
                        <p className="text-sm text-gray-400">No schools found</p>
                    )}
                </div>
            </div>

            {/* Module counts + links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {modules.map(mod => (
                    <Link
                        key={mod.path}
                        to={`/superadmin/${mod.path}`}
                        className="bg-white rounded-xl border border-gray-100 p-5
                       hover:border-primary-200 hover:shadow-sm
                       transition-all group"
                    >
                        <p className="text-2xl font-bold text-gray-800
                          group-hover:text-primary-600">
                            {counts[mod.path] ?? '—'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{mod.label}</p>
                        <p className="text-xs text-primary-500 mt-2 opacity-0
                          group-hover:opacity-100 transition-opacity">
                            View all →
                        </p>
                    </Link>
                ))}
            </div>

            {/* Export section */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Export Data
                    </h2>
                    <button
                        onClick={handleExportAll}
                        disabled={!!exporting}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700
                       text-white text-sm font-medium rounded-lg
                       transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {exporting === 'all' ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Exporting...
                            </>
                        ) : '⬇ Export All Modules'}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {exportEndpoints.map(exp => (
                        <button
                            key={exp.file}
                            onClick={() => handleExport(exp.endpoint, exp.file)}
                            disabled={!!exporting}
                            className="px-3 py-2 text-sm text-left rounded-lg
                         border border-gray-100 hover:border-primary-200
                         hover:bg-primary-50 hover:text-primary-700
                         text-gray-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-between gap-2"
                        >
                            <span className="truncate">{exp.label}</span>
                            {exporting === exp.file ? (
                                <svg className="animate-spin w-3.5 h-3.5 shrink-0"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <span className="text-gray-400 shrink-0">⬇</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}