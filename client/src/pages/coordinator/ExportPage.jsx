import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import FormError from '../../components/ui/FormError'
import Button from '../../components/ui/Button'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'
import { ArrowDownTrayIcon, CheckIcon, CodeBracketIcon, TableCellsIcon } from '@heroicons/react/20/solid'
import useExport from '../../hooks/useExport'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function ExportPage() {
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo]     = useState('')
    const [format, setFormat]     = useState('excel')
    const [dateError, setDateError] = useState('')
    const { exportFile, exporting, exportError } = useExport('/export/coordinator/', {
        filename: format === 'json' ? 'MIS_Coordinator_Export' : 'MIS_Coordinator_Export',
        mimeType: format === 'json' ? 'application/json' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: format === 'json' ? '.json' : '.xlsx'
    })
    const handleExport = () => {
        if (dateFrom && dateTo && dateTo < dateFrom) {
            setDateError('End date cannot be before start date')
            return
        }
        setDateError('')
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
            {exportError && <div className="mb-4"><FormError message={exportError} /></div>}

            <div className="max-w-2xl">
                <Panel
                    title="Configure Export"
                    description="All 7 MIS modules will be included in the export"
                >
                    <div className="space-y-5">

                        {/* Date range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date-from"
                                       className="block text-sm font-medium text-gray-800 mb-1">
                                    Start Date
                                </label>
                                <input
                                    id="date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="date-to"
                                       className="block text-sm font-medium text-gray-800 mb-1">
                                    End Date
                                </label>
                                <input
                                    id="date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Date range error */}
                        {dateError && (
                            <p className="text-xs text-primary-700 -mt-2">{dateError}</p>
                        )}

                        {/* Hint */}
                        <p className="text-xs text-gray-500">
                            Leave dates empty to export all available records.
                        </p>

                        {/* Format selector */}
                        <div>
                            <p id="export-format-label" className="block text-sm font-medium text-gray-800 mb-1">
                                Export Format
                            </p>
                            <div role="group" aria-labelledby="export-format-label" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    id="format-excel"
                                    type="button"
                                    onClick={() => setFormat('excel')}
                                    className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600
                                        ${format === 'excel'
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <TableCellsIcon className={`h-4 w-4 shrink-0 ${format === 'excel' ? 'text-primary-700' : 'text-gray-500'}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">Excel</p>
                                        <p className="text-xs text-gray-500">Multi-sheet .xlsx workbook</p>
                                    </div>
                                    {format === 'excel' && <CheckIcon className="h-4 w-4 shrink-0 text-primary-700" />}
                                </button>

                                <button
                                    id="format-json"
                                    type="button"
                                    onClick={() => setFormat('json')}
                                    className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600
                                        ${format === 'json'
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <CodeBracketIcon className={`h-4 w-4 shrink-0 ${format === 'json' ? 'text-primary-700' : 'text-gray-500'}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">JSON</p>
                                        <p className="text-xs text-gray-500">Structured .json file</p>
                                    </div>
                                    {format === 'json' && <CheckIcon className="h-4 w-4 shrink-0 text-primary-700" />}
                                </button>
                            </div>
                        </div>

                        {/* Modules included info */}
                        <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                Modules Included
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    'School Activities', 'Student Activities',
                                    'FDP / Workshop / GL', 'Publications',
                                    'Patents', 'Certifications', 'Placements'
                                ].map(mod => (
                                    <Badge key={mod} label={mod} color="gray" />
                                ))}
                            </div>
                        </div>

                        {/* Export button */}
                        <div className="pt-1">
                            <Button
                                onClick={handleExport}
                                loading={exporting}
                                disabled={exporting}
                                className="w-full sm:w-auto"
                            >
                                {!exporting && <ArrowDownTrayIcon className="h-4 w-4" />}
                                {exporting ? 'Generating…' : 'Generate Report'}
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    )
}
