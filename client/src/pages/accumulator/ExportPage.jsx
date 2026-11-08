import { useState } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Panel from '../../components/ui/Panel'
import { ArrowDownTrayIcon, CheckIcon, CodeBracketIcon, TableCellsIcon } from '@heroicons/react/20/solid'

const inputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 ' +
    'focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'

export default function ExportPage() {
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo]     = useState('')
    const [format, setFormat]     = useState('excel')
    const [exportType, setExportType] = useState('coordinator_data')
    const [dateError, setDateError] = useState('')
    const [exporting, setExporting] = useState(false)

    const handleExport = async () => {
        if (dateFrom && dateTo && dateTo < dateFrom) {
            setDateError('End date cannot be before start date')
            return
        }
        setDateError('')
        setExporting(true)
        
        try {
            const params = {
                format,
                export_type: exportType,
                ...(dateFrom && { date_from: dateFrom }),
                ...(dateTo && { date_to: dateTo })
            }

            const res = await api.get('/export/accumulator/export/', {
                responseType: 'blob',
                params,
            })

            let mimeType, filename
            if (format === 'json') {
                mimeType = 'application/json'
                filename = 'Accumulator_Data_Export.json'
            } else {
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                filename = 'Accumulator_Data_Export.xlsx'
            }

            const blob = new Blob([res.data], { type: mimeType })
            const url  = window.URL.createObjectURL(blob)
            const a    = document.createElement('a')
            a.href     = url
            a.download = filename
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Accumulator export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="Accumulator Export"
                subtitle="Export all received MIS reports for your campus within a date range"
            />

            <div className="max-w-2xl">
                <Panel
                    title="Configure Export"
                    description="Data collected from all your campus coordinators will be included"
                >
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="export-source" className="block text-sm font-medium text-gray-800 mb-1">
                                Data Source
                            </label>
                            <select
                                id="export-source"
                                value={exportType}
                                onChange={e => setExportType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="coordinator_data">Received Coordinator Data</option>
                                <option value="campus_data">Finalized Campus Data</option>
                            </select>
                        </div>

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

                        {dateError && (
                            <p className="text-xs text-primary-700 -mt-2">{dateError}</p>
                        )}

                        <p className="text-xs text-gray-500">
                            Leave dates empty to export all available reports.
                        </p>

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

                        <div className="pt-1">
                            <Button
                                onClick={handleExport}
                                loading={exporting}
                                disabled={exporting}
                                className="w-full sm:w-auto"
                            >
                                {!exporting && <ArrowDownTrayIcon className="h-4 w-4" />}
                                {exporting ? 'Exporting...' : 'Export Data'}
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    )
}
