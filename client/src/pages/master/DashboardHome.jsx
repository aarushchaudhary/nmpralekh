import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'

function StatCard({ label, value, icon, accent = 'primary' }) {
    const accentStyles = {
        primary: 'bg-primary-50 text-primary-700',
        gray: 'bg-gray-100 text-gray-700',
        black: 'bg-gray-900 text-white',
    }
    
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                {icon && <span className={`p-2 rounded-lg ${accentStyles[accent]}`}>{icon}</span>}
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900">
                    {value ?? '—'}
                </p>
            </div>
        </div>
    )
}

export default function DashboardHome() {
    const [stats, setStats] = useState({})

    useEffect(() => {
        Promise.all([
            api.get('/schools/campuses/'),
            api.get('/schools/'),
            api.get('/users/'),
        ]).then(([campuses, schools, users]) => {
            const campusData = campuses.data?.results ?? campuses.data
            const schoolData = schools.data?.results ?? schools.data
            const userData = users.data?.results ?? users.data

            setStats({
                campuses: campusData.length,
                schools: schoolData.length,
                users: userData.length,
                admins: userData.filter(u => u.role === 'admin').length,
                faculty: userData.filter(u => u.role === 'user').length,
                super_admins: userData.filter(u => u.role === 'super_admin').length,
            })
        }).catch(() => { })
    }, [])

    return (
        <div className="space-y-8">
            <PageHeader
                title="Master Dashboard"
                subtitle="Overview of the entire MIS portal"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Total Campuses" 
                    value={stats.campuses} 
                    accent="primary"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                />
                <StatCard 
                    label="Total Schools" 
                    value={stats.schools} 
                    accent="gray"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
                />
                <StatCard 
                    label="Super Admins" 
                    value={stats.super_admins} 
                    accent="black"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                />
                <StatCard 
                    label="School Admins" 
                    value={stats.admins} 
                    accent="primary"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">
                        Quick Actions
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Add a new campus', path: '/master/campuses', desc: 'Create a new campus entity' },
                        { label: 'Add a new school', path: '/master/schools', desc: 'Register a new school' },
                        { label: 'Create a new user', path: '/master/users', desc: 'Add admins and faculty' },
                        { label: 'Assign user to school', path: '/master/assignments', desc: 'Manage user permissions' },
                    ].map(action => (
                        <Link
                            key={action.path}
                            to={action.path}
                            className="group block p-5 rounded-xl border border-gray-100
                                hover:border-primary-500 hover:ring-1 hover:ring-primary-500
                                transition-all bg-gray-50/50 hover:bg-white"
                        >
                            <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                                {action.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {action.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}