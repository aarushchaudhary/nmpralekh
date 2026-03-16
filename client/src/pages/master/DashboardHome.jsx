import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'

function StatCard({ label, value, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
        orange: 'bg-orange-50 text-orange-700',
    }
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${colors[color].split(' ')[1]}`}>
                {value ?? '—'}
            </p>
        </div>
    )
}

export default function DashboardHome() {
    const [stats, setStats] = useState({})

    useEffect(() => {
        Promise.all([
            api.get('/schools/'),
            api.get('/users/'),
            api.get('/schools/assign/'),
        ]).then(([schools, users, assignments]) => {
            const schoolData = schools.data?.results ?? schools.data
            const userData = users.data?.results ?? users.data
            const assignmentData = assignments.data?.results ?? assignments.data

            setStats({
                schools: schoolData.length,
                users: userData.length,
                admins: userData.filter(u => u.role === 'admin').length,
                faculty: userData.filter(u => u.role === 'user').length,
                assignments: assignmentData.length,
            })
        }).catch(() => { })
    }, [])

    return (
        <div>
            <PageHeader
                title="Master Dashboard"
                subtitle="Overview of the entire portal"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Schools" value={stats.schools} color="blue" />
                <StatCard label="Total Users" value={stats.users} color="green" />
                <StatCard label="Admins" value={stats.admins} color="purple" />
                <StatCard label="Faculty" value={stats.faculty} color="orange" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        { label: 'Add a new school', path: '/master/schools' },
                        { label: 'Create a new user', path: '/master/users' },
                        { label: 'Assign user to school', path: '/master/assignments' },
                    ].map(action => (
                        <a
                            key={action.path}
                            href={action.path}
                            className="block p-4 rounded-lg border border-gray-100
                                hover:border-primary-200 hover:bg-primary-50
                                text-sm text-gray-600 hover:text-primary-700
                                transition-colors"
                        >
                            {action.label} →
                        </a>
                    ))}
                </div>
            </div>
        </div >
    )
}