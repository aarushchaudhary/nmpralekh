import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
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
                    color={row.is_active ? 'green' : 'gray'}
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

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-700">
                    Showing all faculty members who are assigned to the same school(s) as you.
                    This is a <strong>read-only</strong> view.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, username or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[220px] px-4 py-2 border border-gray-200 rounded-lg
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary-200
                               focus:border-primary-400 transition-all bg-white"
                />
                <input
                    type="text"
                    placeholder="Filter by School Code..."
                    value={schoolCode}
                    onChange={e => setSchoolCode(e.target.value)}
                    className="w-48 px-4 py-2 border border-gray-200 rounded-lg
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary-200
                               focus:border-primary-400 transition-all bg-white"
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
