import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function BugReportButton() {
    const [open, setOpen]       = useState(false)
    const [saving, setSaving]   = useState(false)
    const [done, setDone]       = useState(false)
    const [form, setForm]       = useState({
        title: '', description: '', severity: 'medium'
    })

    // Allow ErrorBoundary to trigger this via window._openBugReport()
    useEffect(() => {
        window._openBugReport = () => setOpen(true)
        return () => { delete window._openBugReport }
    }, [])

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.description.trim()) return
        setSaving(true)
        try {
            await api.post('/service/bug-reports/submit/', {
                ...form,
                url_path: window.location.pathname,
            })
            setDone(true)
            setTimeout(() => {
                setOpen(false)
                setDone(false)
                setForm({ title: '', description: '', severity: 'medium' })
            }, 2000)
        } catch {
            // fail silently — don't punish the user for trying to report a bug
        } finally {
            setSaving(false)
        }
    }

    const severityOptions = [
        { value: 'low',      label: '🟢 Low — Minor inconvenience' },
        { value: 'medium',   label: '🟡 Medium — Feature is broken' },
        { value: 'high',     label: '🔴 High — Cannot do my work' },
        { value: 'critical', label: '🚨 Critical — Data loss / security' },
    ]

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => setOpen(true)}
                title="Report a bug"
                className="fixed bottom-6 right-6 z-40
                           w-11 h-11 rounded-full shadow-lg
                           bg-gray-800 hover:bg-gray-700
                           text-white transition-colors
                           flex items-center justify-center"
            >
                {/* Bug icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8v4m0 4h.01M9 3h6M3 8l3 2m12-2l-3 2M3 16l3-2m12 2l-3-2M6 6l-1-1m14 1l1-1M6 18l-1 1m14-1l1 1M12 21c-3.866 0-7-3.134-7-7V8a7 7 0 0114 0v6c0 3.866-3.134 7-7 7z" />
                </svg>
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-40"
                        onClick={() => setOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Report a Bug
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Describe the problem and we'll investigate
                                </p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            {done ? (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <div className="w-12 h-12 rounded-full bg-green-100
                                                    flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-green-500" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">
                                        Report submitted — thank you!
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Our team will review it shortly.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Current page — auto-filled */}
                                    <div className="text-xs text-gray-400 bg-gray-50
                                                    rounded-lg px-3 py-2 font-mono">
                                        📍 {window.location.pathname}
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Summary <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={set('title')}
                                            placeholder="Short description of the problem"
                                            className="w-full px-3 py-2 text-sm border border-gray-200
                                                       rounded-lg focus:outline-none focus:ring-2
                                                       focus:ring-primary-500"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Details <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={form.description}
                                            onChange={set('description')}
                                            rows={4}
                                            placeholder="Steps to reproduce, what you expected vs what happened..."
                                            className="w-full px-3 py-2 text-sm border border-gray-200
                                                       rounded-lg focus:outline-none focus:ring-2
                                                       focus:ring-primary-500 resize-none"
                                        />
                                    </div>

                                    {/* Severity */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Severity
                                        </label>
                                        <select
                                            value={form.severity}
                                            onChange={set('severity')}
                                            className="w-full px-3 py-2 text-sm border border-gray-200
                                                       rounded-lg focus:outline-none focus:ring-2
                                                       focus:ring-primary-500"
                                        >
                                            {severityOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-1">
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-2 text-sm text-gray-600
                                                       border border-gray-200 rounded-lg
                                                       hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={saving || !form.title.trim() || !form.description.trim()}
                                            className="px-4 py-2 text-sm font-medium text-white
                                                       bg-primary-600 hover:bg-primary-700 rounded-lg
                                                       transition-colors disabled:opacity-50
                                                       disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {saving && (
                                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                            )}
                                            Submit Report
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
