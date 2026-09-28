import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export const roleNavLinks = {
    master: [
        { label: 'Dashboard', path: '/master' },
        { label: 'Campuses', path: '/master/campuses' },
        { label: 'Schools', path: '/master/schools' },
        { label: 'Users', path: '/master/users' },
        { label: 'Assignments', path: '/master/assignments' },
        { label: '— Exports', path: null },
        { label: 'Export History', path: '/master/exports' },
        { label: 'Manual Export', path: '/master/exports/manual' },
        { label: '— System', path: null },
        { label: 'Backup Settings', path: '/master/backup-settings' },
        { label: 'Special Users', path: '/master/special-users' },
    ],
    super_admin: [
        { label: 'Dashboard', path: '/superadmin' },
        { label: '— Management', path: null },
        { label: 'Campus Users', path: '/superadmin/campus-users' },
        { label: '— Records', path: null },
        { label: 'School Activities', path: '/superadmin/school-activities' },
        { label: 'Student Activities', path: '/superadmin/student-activities' },
        { label: 'FDP / Workshop / GL', path: '/superadmin/fdp' },
        { label: 'Publications', path: '/superadmin/publications' },
        { label: 'Patents', path: '/superadmin/patents' },
        { label: 'Certifications', path: '/superadmin/certifications' },
        { label: 'Placements', path: '/superadmin/placements' },
        { label: '— Export', path: null },
        { label: 'Received MIS Data', path: '/superadmin/received-mis-data' },
    ],
    admin: [
        { label: 'Dashboard', path: '/admin' },
        { label: '— Management', path: null },
        { label: 'Clubs & Committees', path: '/admin/clubs' },
        { label: 'View Faculties', path: '/admin/faculties' },
        { label: '— Records', path: null },
        { label: 'School Activities', path: '/admin/school-activities' },
        { label: 'Student Activities', path: '/admin/student-activities' },
        { label: 'FDP / Workshop / GL', path: '/admin/fdp' },
        { label: 'Publications', path: '/admin/publications' },
        { label: 'Patents', path: '/admin/patents' },
        { label: 'Certifications', path: '/admin/certifications' },
        { label: 'Placements', path: '/admin/placements' },
        { label: '— Export', path: null },
        { label: 'Received MIS Data', path: '/admin/received-mis-data' },
    ],
    user: [
        { label: 'Dashboard',           path: '/faculty' },
        { label: '— Activities',        path: null },
        { label: 'School Activities',   path: '/faculty/school-activities' },
        { label: 'Student Activities',  path: '/faculty/student-activities' },
        { label: 'FDP / Workshop / GL', path: '/faculty/fdp' },
        { label: 'Placements',          path: '/faculty/placements' },
        { label: '— My Research',       path: null },
        { label: 'My Publications',     path: '/faculty/publications' },
        { label: 'My Patents',          path: '/faculty/patents' },
        { label: 'My Certifications',   path: '/faculty/certifications' },
    ],
    delete_auth: [
        { label: 'Dashboard', path: '/deleteauth' },
        { label: 'Pending Requests', path: '/deleteauth/pending' },
        { label: 'History', path: '/deleteauth/history' },
    ],
    mis_coordinator: [
        { label: 'Dashboard', path: '/coordinator' },
        { label: '— Export', path: null },
        { label: 'Data Export', path: '/coordinator/export' },
        { label: '— MIS Data', path: null },
        { label: 'Send MIS Data', path: '/coordinator/send-mis-data' },
        { label: '— AI Tools', path: null },
        { label: 'AI Summarizer', path: '/coordinator/ai-summarizer' },
    ],
    mis_accumulator: [
        { label: 'Dashboard', path: '/accumulator' },
        { label: '— Coordinators', path: null },
        { label: 'Received Data', path: '/accumulator/received-data' },
        { label: 'Finalize MIS', path: '/accumulator/finalize' },
        { label: '— Export', path: null },
        { label: 'Export Data', path: '/accumulator/export' },
        { label: '— AI Tools', path: null },
        { label: 'AI Summarizer', path: '/accumulator/ai-summarizer' },
    ],
    service_admin: [
        { label: 'Dashboard', path: '/service-dashboard' },
        { label: '— Monitoring', path: null },
        { label: 'API Status', path: '/service-dashboard/api-status' },
        { label: 'Error Tickets', path: '/service-dashboard/errors' },
        { label: 'User Feedback', path: '/service-dashboard/feedback' },
    ],
    chronicle_master: [
        { label: 'Dashboard', path: '/chronicle-dashboard' },
        { label: '— Requests', path: null },
        { label: 'Initiate Request', path: '/chronicle-dashboard/initiate-request' },
        { label: '— Export', path: null },
        { label: 'Export Data', path: '/chronicle-dashboard/export' },
        { label: 'Received MIS Data', path: '/chronicle-dashboard/received-mis-data' },
        { label: '— AI Tools', path: null },
        { label: 'AI Summarizer', path: '/chronicle-dashboard/ai-summarizer' },
    ],
}

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    
    let roleKey = user?.role
    if (user?.is_service_admin) {
        roleKey = 'service_admin'
    } else if (user?.is_chronicle_master) {
        roleKey = 'chronicle_master'
    }
    const links = roleNavLinks[roleKey] || []

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden transition-opacity"
                    onClick={onClose} />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
                z-30 flex flex-col transition-transform duration-300 ease-in-out shadow-sm
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:z-auto
            `}>

                {/* Logo */}
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="w-2.5 h-6 bg-primary-600 rounded-full"></span>
                            NMPralekh
                        </h1>
                        <p className="text-[11px] text-gray-500 mt-1 font-semibold ml-4 tracking-wider uppercase">
                            {user?.is_service_admin ? 'Service Portal' : user?.is_chronicle_master ? 'Chronicle Portal' : 'MIS Portal'}
                        </p>
                    </div>
                </div>

                {/* User info */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.full_name}
                    </p>
                    <span className="inline-flex mt-1.5 text-[10px] px-2 py-0.5 rounded
                           bg-gray-900 text-white font-bold capitalize tracking-wide">
                        {user?.role?.replace(/_/g, ' ')}
                    </span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scrollbar">
                    {links.map((link, i) => (
                        link.path === null ? (
                            <p key={i} className="px-3 pt-5 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {link.label.replace('— ', '')}
                            </p>
                        ) : (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path.split('/').length === 2}
                                onClick={onClose}
                                className={({ isActive }) => `
                                    group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border-l-4
                                    ${isActive
                                        ? 'bg-primary-50 text-primary-700 border-primary-600'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                                    }
                                `}
                            >
                                {link.label}
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600
                       hover:bg-red-50 hover:text-red-600 rounded-md transition-colors border border-gray-200 hover:border-red-200 bg-white shadow-sm">
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}
