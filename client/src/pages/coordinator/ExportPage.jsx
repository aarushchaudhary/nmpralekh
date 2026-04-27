import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import useCoordinatorExport from '../../hooks/useCoordinatorExport'

export default function ExportPage() {
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo]     = useState('')
    const [format, setFormat]     = useState('excel')

    const { exportFile, exporting } = useCoordinatorExport()

    const handleExport = () => {
        exportFile({
            date_from: dateFrom || undefined,
            date_to:   dateTo   || undefined,
            format,
        })
    }

    return (
        <div>
            <PageHeader
                title="Data Export"
                subtitle="Export MIS records for your school within a date range"
            />

            <div className="max-w-2xl">
                {/* Export form card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Header stripe */}
                    <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-primary-800">Configure Export</h2>
                        <p className="text-xs text-primary-600/80 mt-0.5">
                            All 7 MIS modules will be included in the export
                        </p>
                    </div>

                    <div className="p-6 space-y-6">

                        {/* Date range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date-from"
                                       className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Start Date
                                </label>
                                <input
                                    id="date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                                               text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500
                                               focus:border-transparent transition-shadow"
                                />
                            </div>
                            <div>
                                <label htmlFor="date-to"
                                       className="block text-sm font-medium text-gray-700 mb-1.5">
                                    End Date
                                </label>
                                <input
                                    id="date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                                               text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500
                                               focus:border-transparent transition-shadow"
                                />
                            </div>
                        </div>

                        {/* Hint */}
                        <p className="text-xs text-gray-400">
                            Leave dates empty to export all available records.
                        </p>

                        {/* Format selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Export Format
                            </label>
                            <div className="flex gap-3">
                                <button
                                    id="format-excel"
                                    type="button"
                                    onClick={() => setFormat('excel')}
                                    className={`flex-1 flex items-center gap-3 rounded-lg border p-4 transition-all
                                        ${format === 'excel'
                                            ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${format === 'excel' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                        <svg className={`w-4 h-4 ${format === 'excel' ? 'text-emerald-600' : 'text-gray-500'}`}
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-sm font-medium ${format === 'excel' ? 'text-primary-800' : 'text-gray-700'}`}>
                                            Excel
                                        </p>
                                        <p className="text-xs text-gray-400">Multi-sheet .xlsx workbook</p>
                                    </div>
                                </button>

                                <button
                                    id="format-json"
                                    type="button"
                                    onClick={() => setFormat('json')}
                                    className={`flex-1 flex items-center gap-3 rounded-lg border p-4 transition-all
                                        ${format === 'json'
                                            ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${format === 'json' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                        <svg className={`w-4 h-4 ${format === 'json' ? 'text-amber-600' : 'text-gray-500'}`}
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-sm font-medium ${format === 'json' ? 'text-primary-800' : 'text-gray-700'}`}>
                                            JSON
                                        </p>
                                        <p className="text-xs text-gray-400">Structured .json file</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Modules included info */}
                        <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Modules Included
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    'School Activities', 'Student Activities',
                                    'FDP / Workshop / GL', 'Publications',
                                    'Patents', 'Certifications', 'Placements'
                                ].map(mod => (
                                    <span key={mod}
                                          className="inline-block px-2 py-0.5 text-xs rounded-full
                                                     bg-white border border-gray-200 text-gray-600">
                                        {mod}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Export button */}
                        <div className="pt-2">
                            <Button
                                onClick={handleExport}
                                loading={exporting}
                                disabled={exporting}
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {exporting ? 'Generating…' : 'Generate Report'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
