import { useState } from 'react'
import Modal from '../ui/Modal'
import Panel from '../ui/Panel'
import Button from '../ui/Button'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export function MISReportModal({ report, onClose }) {
    return (
        <Modal isOpen={!!report} onClose={onClose} size="xl" title={report ? `#${report.id} ${report.title}` : ''}>
            {report && (
                <>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mb-4 tabular-nums">
                        <span>By: <strong className="font-medium text-gray-800">{report.created_by_name}</strong></span>
                        <span>Period: <strong className="font-medium text-gray-800">{report.date_from}</strong> to <strong className="font-medium text-gray-800">{report.date_to}</strong></span>
                        <span>Created: {new Date(report.created_at).toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-200">
                        {report.data_content}
                    </div>
                </>
            )}
        </Modal>
    )
}

// Search + period filter; onApply gets the query params for /export/reports/ endpoints
export function ReportFilters({ onApply, searchLabel = 'Search school, campus or name' }) {
    const empty = { search: '', date_from: '', date_to: '' }
    const [form, setForm] = useState(empty)
    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

    return (
        <Panel className="mb-4">
            <form className="flex flex-wrap gap-3 items-end" onSubmit={e => { e.preventDefault(); onApply(form) }}>
                <div className="w-full sm:w-auto">
                    <label htmlFor="report-filter-search" className="block text-xs font-medium text-gray-600 mb-1">{searchLabel}</label>
                    <input id="report-filter-search" type="text" value={form.search} onChange={set('search')}
                        placeholder="Search..." className={`${inputClass} sm:w-72`} />
                </div>
                <div>
                    <label htmlFor="report-filter-from" className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                    <input id="report-filter-from" type="date" value={form.date_from} onChange={set('date_from')} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="report-filter-to" className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input id="report-filter-to" type="date" value={form.date_to} onChange={set('date_to')} className={inputClass} />
                </div>
                <div className="flex gap-2">
                    <Button type="submit">Apply Filters</Button>
                    <Button variant="ghost" onClick={() => { setForm(empty); onApply(empty) }}>Clear</Button>
                </div>
            </form>
        </Panel>
    )
}
