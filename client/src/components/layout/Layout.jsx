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

                {/* Top bar: the page's own h1 carries the title, this just orients */}
                <header className="h-14 flex-shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white border-b border-gray-200">
                    <div className="flex items-center min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 mr-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                            aria-label="Open sidebar"
                        >
                            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <p className="text-sm text-gray-500 truncate">
                            <span className="hidden sm:inline">NMIMS University</span>
                            <span className="hidden sm:inline mx-2 text-gray-300" aria-hidden="true">/</span>
                            <span className="text-gray-900 font-medium">{pageTitle}</span>
                        </p>
                    </div>
                    <p className="hidden sm:block text-sm text-gray-500 tabular-nums whitespace-nowrap">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}
