import { useState } from 'react'
import EmptyState from './EmptyState'

export default function Table({
  columns, data, loading,
  // server-side pagination props
  serverPagination = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}) {
  const [localPage, setLocalPage] = useState(1)
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState('asc')
  const perPage = 25

  // Paged tables only hold 25 rows, so sorting them would only reorder the current page
  const canSort = col => !serverPagination && col.sortable !== false

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })

  // client-side pagination only used when not server paginated
  const activeTotalPages = serverPagination ? totalPages
    : Math.ceil(sorted.length / perPage)
  const activePage       = serverPagination ? currentPage : localPage
  const paginated        = serverPagination ? sorted
    : sorted.slice((localPage - 1) * perPage, localPage * perPage)

  const handlePageChange = (page) => {
    if (serverPagination && onPageChange) {
      onPageChange(page)
    } else {
      setLocalPage(page)
    }
  }

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading records"
        className="bg-white border border-gray-200 rounded-md divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="h-3.5 w-2/3 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!data?.length) return <EmptyState />

  const pageButton = 'h-8 px-3 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600'

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} scope="col"
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  {canSort(col) ? (
                    <button type="button" onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 uppercase tracking-wide font-semibold
                                 hover:text-gray-900 select-none rounded
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                      {col.label}
                      {sortKey === col.key && (
                        <span aria-hidden="true">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2.5 text-gray-800 align-middle tabular-nums">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
        {paginated.map((row, i) => (
          <div key={row.id ?? i} className="p-4 space-y-1.5">
            {columns.map(col => (
              col.key !== 'actions' && (
                <div key={col.key}
                  className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide pt-0.5">{col.label}</span>
                  <span className="text-gray-800 text-right tabular-nums">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </span>
                </div>
              )
            ))}
            {/* actions row on mobile */}
            {columns.find(c => c.key === 'actions') && (
              <div className="pt-2">
                {columns.find(c => c.key === 'actions').render(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {activeTotalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <span className="tabular-nums">
            Page {activePage} of {activeTotalPages}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => handlePageChange(1)} disabled={activePage === 1}
              className={`${pageButton} hidden sm:inline-flex items-center`}>
              First
            </button>
            <button onClick={() => handlePageChange(activePage - 1)} disabled={activePage === 1}
              className={pageButton}>
              Previous
            </button>
            <button onClick={() => handlePageChange(activePage + 1)} disabled={activePage === activeTotalPages}
              className={pageButton}>
              Next
            </button>
            <button onClick={() => handlePageChange(activeTotalPages)} disabled={activePage === activeTotalPages}
              className={`${pageButton} hidden sm:inline-flex items-center`}>
              Last
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
