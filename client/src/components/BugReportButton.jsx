import { useState, useEffect } from 'react'
import { BugAntIcon, CheckCircleIcon, MapPinIcon } from '@heroicons/react/20/solid'
import api from '../api/axios'
import Button from './ui/Button'

const fieldClass = 'w-full px-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-md transition-colors ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

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
        { value: 'low',      label: 'Low — Minor inconvenience' },
        { value: 'medium',   label: 'Medium — Feature is broken' },
        { value: 'high',     label: 'High — Cannot do my work' },
        { value: 'critical', label: 'Critical — Data loss / security' },
    ]

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => setOpen(true)}
                title="Report a bug"
                aria-label="Report issue"
                className="fixed bottom-6 right-6 z-40
                           inline-flex items-center gap-2 h-9 px-2.5 sm:px-3
                           rounded-md bg-gray-800 hover:bg-gray-900
                           text-white text-sm font-medium transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600"
            >
                <BugAntIcon aria-hidden="true" className="w-4 h-4" />
                <span className="hidden sm:inline">Report issue</span>
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white rounded-md border border-gray-200 shadow-lg">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Report a Bug
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Describe the problem and we'll investigate
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800
                                           transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-4">
                            {done ? (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <CheckCircleIcon aria-hidden="true" className="w-5 h-5 text-gray-800 mb-2" />
                                    <p className="text-sm font-medium text-gray-800">
                                        Report submitted — thank you!
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Our team will review it shortly.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Current page — auto-filled */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50
                                                    border border-gray-200 rounded-md px-3 py-2 font-mono">
                                        <MapPinIcon aria-hidden="true" className="w-4 h-4 shrink-0 text-gray-400" />
                                        <span className="truncate">{window.location.pathname}</span>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label htmlFor="bug-report-1" className="block text-sm font-medium text-gray-800 mb-1">
                                            Summary <span className="text-primary-600">*</span>
                                        </label>
                                        <input id="bug-report-1"
                                            type="text"
                                            value={form.title}
                                            onChange={set('title')}
                                            placeholder="Short description of the problem"
                                            className={`${fieldClass} h-9`}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="bug-report-2" className="block text-sm font-medium text-gray-800 mb-1">
                                            Details <span className="text-primary-600">*</span>
                                        </label>
                                        <textarea id="bug-report-2"
                                            value={form.description}
                                            onChange={set('description')}
                                            rows={4}
                                            placeholder="Steps to reproduce, what you expected vs what happened..."
                                            className={`${fieldClass} py-2 resize-none`}
                                        />
                                    </div>

                                    {/* Severity */}
                                    <div>
                                        <label htmlFor="bug-report-3" className="block text-sm font-medium text-gray-800 mb-1">
                                            Severity
                                        </label>
                                        <select id="bug-report-3"
                                            value={form.severity}
                                            onChange={set('severity')}
                                            className={`${fieldClass} h-9`}
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
                                        <Button variant="secondary" onClick={() => setOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            loading={saving}
                                            disabled={!form.title.trim() || !form.description.trim()}
                                        >
                                            Submit Report
                                        </Button>
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
