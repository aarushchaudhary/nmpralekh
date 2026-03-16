import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const roleNavLinks = {
    master: [
        { label: 'Dashboard', path: '/master' },
        { label: 'Schools', path: '/master/schools' },
        { label: 'Users', path: '/master/users' },
        { label: 'Assignments', path: '/master/assignments' },
    ],
    super_admin: [
        { label: 'Dashboard', path: '/superadmin' },
        { label: 'Exams', path: '/superadmin/exams' },
        { label: 'School Activities', path: '/superadmin/school-activities' },
        { label: 'Student Activities', path: '/superadmin/student-activities' },
        { label: 'FDP / Workshop / GL', path: '/superadmin/fdp' },
        { label: 'Publications', path: '/superadmin/publications' },
        { label: 'Patents', path: '/superadmin/patents' },
        { label: 'Certifications', path: '/superadmin/certifications' },
        { label: 'Placements', path: '/superadmin/placements' },
    ],
    admin: [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Exams', path: '/admin/exams' },
        { label: 'School Activities', path: '/admin/school-activities' },
        { label: 'Student Activities', path: '/admin/student-activities' },
        { label: 'FDP / Workshop / GL', path: '/admin/fdp' },
        { label: 'Publications', path: '/admin/publications' },
        { label: 'Patents', path: '/admin/patents' },
        { label: 'Certifications', path: '/admin/certifications' },
        { label: 'Placements', path: '/admin/placements' },
    ],
    user: [
        { label: 'Dashboard', path: '/faculty' },
        { label: 'Exams', path: '/faculty/exams' },
        { label: 'School Activities', path: '/faculty/school-activities' },
        { label: 'Student Activities', path: '/faculty/student-activities' },
        { label: 'FDP / Workshop / GL', path: '/faculty/fdp' },
        { label: 'Publications', path: '/faculty/publications' },
        { label: 'Patents', path: '/faculty/patents' },
        { label: 'Certifications', path: '/faculty/certifications' },
        { label: 'Placements', path: '/faculty/placements' },
    ],
    delete_auth: [
        { label: 'Dashboard', path: '/deleteauth' },
        { label: 'Pending Requests', path: '/deleteauth/pending' },
        { label: 'History', path: '/deleteauth/history' },
    ],
}

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const links = roleNavLinks[user?.role] || []

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100
        z-30 flex flex-col transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>

                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <h1 className="text-lg font-bold text-primary-700">MIS Portal</h1>
                    <p className="text-xs text-gray-400 mt-0.5">NMPralekh</p>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">
                        {user?.full_name}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full
                           bg-primary-50 text-primary-700 font-medium capitalize">
                        {user?.role?.replace('_', ' ')}
                    </span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    {links.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path.split('/').length === 2}
                            onClick={onClose}
                            className={({ isActive }) => `
                block px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-sm text-left text-red-500
                       hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}