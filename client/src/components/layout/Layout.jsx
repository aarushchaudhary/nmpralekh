import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar, { roleNavLinks } from './Sidebar'

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { pathname } = useLocation()
    const { user } = useAuth()

    const pageTitle = useMemo(() => {
        let roleKey = user?.role
        if (user?.is_service_admin) roleKey = 'service_admin'
        else if (user?.is_chronicle_master) roleKey = 'chronicle_master'

        const links = roleNavLinks[roleKey] || []
        let currentLink = links.find(l => l.path && pathname === l.path)
        if (!currentLink) {
            const sortedLinks = [...links].filter(l => l.path).sort((a, b) => b.path.length - a.path.length)
            currentLink = sortedLinks.find(l => pathname.startsWith(l.path + '/'))
        }
        return currentLink ? currentLink.label : 'NMPralekh'
    }, [pathname, user])

    useEffect(() => {
        document.title = `${pageTitle} | NMPralekh`
    }, [pageTitle])

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar — visible on all screens */}
                <header className="flex items-center px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 mr-3 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        {/* Hamburger icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-lg font-semibold text-gray-800">
                        {pageTitle}
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>

            </div>
        </div>
    )
}