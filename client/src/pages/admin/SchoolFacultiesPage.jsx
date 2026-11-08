import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Panel from '../../components/ui/Panel'
import api from '../../api/axios'

const PAGE_SIZE = 25

export default function SchoolFacultiesPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    // Filters
    const [search, setSearch] = useState('')
    const [schoolCode, setSchoolCode] = useState('')
    const [debounced, setDebounced] = useState({ search: '', schoolCode: '' })

    // Debounce search & schoolCode inputs
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced({ search, schoolCode })
            setCurrentPage(1) // reset page on filter change
        }, 400)
        return () => clearTimeout(timer)
    }, [search, schoolCode])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', currentPage)
            if (debounced.search) params.append('search', debounced.search)
            if (debounced.schoolCode) params.append('school_code', debounced.schoolCode)

            const res = await api.get(`/users/school-faculties/?${params.toString()}`)
            setData(res.data?.results ?? [])
            setTotalPages(res.data?.total_pages ?? 1)
        } catch {
            setData([])
        } finally {
            setLoading(false)
        }
    }, [currentPage, debounced])

    useEffect(() => { fetchData() }, [fetchData])

    const columns = [
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'username', label: 'Username' },
        { key: 'school_code', label: 'School Code' },
        {
            key: 'is_active', label: 'Status', sortable: false,
            render: row => (
                <Badge
                    label={row.is_active ? 'Active' : 'Inactive'}
                    color={row.is_active ? 'dark' : 'gray'}
                />
            )
        },
    ]

    return (
        <div>
            <PageHeader
                title="School Faculties"
                subtitle="Faculty members assigned to your school(s)"
            />

            <Panel className="mb-6">
                <p className="text-sm text-gray-700">
                    Showing all faculty members who are assigned to the same school(s) as you.
                    This is a <strong>read-only</strong> view.
                </p>
            </Panel>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, username or email..."
                    aria-label="Search faculty"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[220px] px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md
                               placeholder:text-gray-400 transition-colors focus:outline-none
                               focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
                />
                <input
                    type="text"
                    placeholder="Filter by School Code..."
                    aria-label="Filter by school code"
                    value={schoolCode}
                    onChange={e => setSchoolCode(e.target.value)}
                    className="w-48 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md
                               placeholder:text-gray-400 transition-colors focus:outline-none
                               focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
                />
            </div>

            <Table
                columns={columns}
                data={data}
                loading={loading}
                serverPagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
