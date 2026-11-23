const linkClass = 'text-left font-medium text-primary-700 hover:underline rounded ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600'

// "Report No." and "Report Name" columns for Table; clicking either opens the report
export function reportColumns(onOpen) {
    return [
        {
            key: 'id', label: 'Report No.',
            render: r => <button type="button" onClick={() => onOpen(r)} className={linkClass}>#{r.id}</button>,
        },
        {
            key: 'title', label: 'Report Name',
            render: r => <button type="button" onClick={() => onOpen(r)} className={linkClass}>{r.title}</button>,
        },
    ]
}
