import { useState } from 'react'
import EmptyState from './EmptyState'

export default function Table({ columns, data, loading, onRowClick }) {
    const [page, setPage] = useState(1)
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState('asc')
    const perPage = 10

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
        setPage(1)
    }

    const sorted = [...(data || [])].sort((a, b) => {
        if (!sortKey) return 0
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        return sortDir === 'asc'
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av))
    })

    const totalPages = Math.ceil(sorted.length / perPage)
    const paginated = sorted.slice((page - 1) * perPage, page * perPage)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    if (!data?.length) return <EmptyState />

    return (
        <div>
            {/* Table — hidden on mobile, shown on md+ */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    className={`
                    px-4 py-3 text-left text-xs font-medium text-gray-500
                    uppercase tracking-wide
                    ${col.sortable !== false ? 'cursor-pointer hover:text-gray-700 select-none' : ''}
                  `}
                                >
                                    {col.label}
                                    {sortKey === col.key && (
                                        <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {paginated.map((row, i) => (
                            <tr
                                key={row.id ?? i}
                                onClick={() => onRowClick?.(row)}
                                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  transition-colors
                `}
                            >
                                {columns.map(col => (
                                    <td key={col.key} className="px-4 py-3 text-gray-700">
                                        {col.render ? col.render(row) : row[col.key] ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Card view — mobile only */}
            <div className="md:hidden space-y-3">
                {paginated.map((row, i) => (
                    <div
                        key={row.id ?? i}
                        onClick={() => onRowClick?.(row)}
                        className="bg-white rounded-xl border border-gray-100 p-4 space-y-2"
                    >
                        {columns.map(col => (
                            <div key={col.key} className="flex justify-between text-sm">
                                <span className="text-gray-400 font-medium">{col.label}</span>
                                <span className="text-gray-700 text-right ml-4">
                                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>
                        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)} of {sorted.length}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}