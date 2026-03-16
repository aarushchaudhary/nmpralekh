import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar — mobile only */}
                <header className="md:hidden flex items-center px-4 py-3
                           bg-white border-b border-gray-100">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        {/* Hamburger icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-3 text-sm font-semibold text-gray-800">
                        MIS Portal
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