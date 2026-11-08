import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// eslint-disable-next-line react-refresh/only-export-components
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

    useEffect(() => {
        if (!isOpen) return
        const onKey = e => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [isOpen, onClose])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const portal = user?.is_service_admin ? 'Service Portal' : user?.is_chronicle_master ? 'Chronicle Portal' : 'MIS Portal'

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-60 bg-gray-800 text-gray-300
                z-30 flex flex-col transition-[transform,visibility] duration-200 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full invisible'}
                md:translate-x-0 md:visible md:static md:z-auto
            `}>

                {/* Brand */}
                <div className="h-14 px-5 flex items-center gap-2.5 border-b border-white/10 flex-shrink-0">
                    <span className="w-1.5 h-6 bg-primary-600" aria-hidden="true" />
                    <div className="leading-tight">
                        <p className="text-[15px] font-semibold text-white">NMPralekh</p>
                        <p className="text-[11px] text-gray-400">{portal}</p>
                    </div>
                </div>

                {/* Nav links */}
                <nav aria-label="Main" className="flex-1 overflow-y-auto px-2.5 py-3">
                    {links.map((link, i) => (
                        link.path === null ? (
                            <p key={i} className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                {link.label.replace('— ', '')}
                            </p>
                        ) : (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path.split('/').length === 2}
                                onClick={onClose}
                                className={({ isActive }) => `
                                    flex items-center px-3 py-2 my-px rounded-md text-sm border-l-[3px]
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                                    ${isActive
                                        ? 'bg-white/10 text-white font-medium border-primary-600'
                                        : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                {link.label}
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* User + sign out */}
                <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-400 capitalize truncate">{user?.role?.replace(/_/g, ' ')}</p>
                    </div>
                    <button onClick={handleLogout}
                        className="flex-shrink-0 px-2.5 h-8 text-xs font-medium text-gray-200 rounded-md border border-white/20
                                   hover:bg-white/10 hover:text-white
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    )
}
