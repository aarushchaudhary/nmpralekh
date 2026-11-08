import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'

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
        <div className="space-y-6">
            <PageHeader
                title="Master Dashboard"
                subtitle="Overview of the entire MIS portal"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
                <StatCard label="Campuses" value={stats.campuses} to="/master/campuses" />
                <StatCard label="Schools" value={stats.schools} to="/master/schools" />
                <StatCard label="Super admins" value={stats.super_admins} to="/master/users" />
                <StatCard label="School admins" value={stats.admins} to="/master/users" />
            </div>
        </div>
    )
}
