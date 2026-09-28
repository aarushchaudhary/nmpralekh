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
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar — visible on all screens */}
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] z-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 mr-3 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                            aria-label="Open sidebar"
                        >
                            {/* Hamburger icon */}
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                            {pageTitle}
                        </h2>
                    </div>
                    {/* Optional Right Side Header Content */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-sm text-gray-500">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}