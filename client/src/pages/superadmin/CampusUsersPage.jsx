import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import SearchableSelect from '../../components/ui/SearchableSelect'
import api from '../../api/axios'

const PAGE_SIZE = 25

const roleBadgeColor = {
    admin: 'blue',
    user: 'purple',
    super_admin: 'green',
    delete_auth: 'yellow',
}

const roleLabel = {
    admin: 'Admin',
    user: 'Faculty',
    super_admin: 'Super Admin',
    delete_auth: 'Delete Auth',
}

const roleFilterOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'Faculty' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'delete_auth', label: 'Delete Auth' },
]

export default function CampusUsersPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    // Filters
    const [search, setSearch] = useState('')
    const [role, setRole] = useState('')
    const [schoolCode, setSchoolCode] = useState('')
    const [debounced, setDebounced] = useState({ search: '', schoolCode: '' })

    // Debounce search & schoolCode
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced({ search, schoolCode })
            setCurrentPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search, schoolCode])

    // Reset page when role changes
    useEffect(() => { setCurrentPage(1) }, [role])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', currentPage)
            if (debounced.search) params.append('search', debounced.search)
            if (role) params.append('role', role)
            if (debounced.schoolCode) params.append('school_code', debounced.schoolCode)

            const res = await api.get(`/users/campus-users/?${params.toString()}`)
            setData(res.data?.results ?? [])
            setTotalPages(res.data?.total_pages ?? 1)
        } catch {
            setData([])
        } finally {
            setLoading(false)
        }
    }, [currentPage, role, debounced])

    useEffect(() => { fetchData() }, [fetchData])

    const columns = [
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'username', label: 'Username' },
        {
            key: 'role', label: 'Role', sortable: false,
            render: row => (
                <Badge
                    label={roleLabel[row.role] || row.role}
                    color={roleBadgeColor[row.role] || 'gray'}
                />
            )
        },
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
                title="Campus Users"
                subtitle="All users in your campus"
            />

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-700">
                    Showing all active users assigned to your campus.
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
                <div className="w-48">
                    <SearchableSelect
                        options={roleFilterOptions}
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="All Roles"
                    />
                </div>
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
