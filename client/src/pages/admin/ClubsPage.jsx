import { useState, useEffect } from 'react'
import useRecords from '../../hooks/useRecords'
import useSchools from '../../hooks/useSchools'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'

const typeOptions = [
    { value: 'club', label: 'Club' },
    { value: 'committee', label: 'Committee' },
    { value: 'placecom', label: 'Placement Committee' },
]

const typeBadgeColor = { club: 'blue', committee: 'purple', placecom: 'green' }

const empty = { name: '', type: 'club', school: '', is_active: true }

export default function ClubsPage() {
    const { data, loading, create, fetch, totalPages, currentPage, goToPage } = useRecords('/records/clubs/')
    const { schoolOptions } = useSchools()

    const [showForm, setShowForm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
    const isEdit = !!selected

    const openCreate = () => {
        setSelected(null); setForm(empty)
        setErrors({}); setShowForm(true)
    }

    const openEdit = row => {
        setSelected(row)
        setForm({
            name: row.name,
            type: row.type,
            school: row.school,
            is_active: row.is_active,
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.name) e.name = 'Name is required'
        if (!form.school) e.school = 'School is required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (isEdit) {
                await api.put(`/records/clubs/${selected.id}/`, form)
            } else {
                await create(form)
            }
            setShowForm(false); fetch()
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally { setSaving(false) }
    }

    const handleDelete = async (row) => {
        if (!confirm(`Delete "${row.name}"?`)) return
        try {
            await api.delete(`/records/clubs/${row.id}/`)
            fetch()
        } catch (err) {
            console.error('Delete failed:', err)
        }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'name', label: 'Name' },
        {
            key: 'type', label: 'Type', sortable: false,
            render: row => <Badge label={row.type} color={typeBadgeColor[row.type]} />
        },
        {
            key: 'is_active', label: 'Active', sortable: false,
            render: row => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${row.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'actions', label: '', sortable: false,
            render: row => (
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                        Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>
                        Delete
                    </Button>
                </div>
            )
        },
    ]

    return (
        <div>
            <PageHeader
                title="Clubs & Committees"
                subtitle="Manage clubs, committees, and placement committees for your school"
                action={<Button onClick={openCreate}>+ Add Club</Button>}
            />

            <Table columns={columns} data={data}
                serverPagination totalPages={totalPages}
                currentPage={currentPage} onPageChange={goToPage}
                loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={isEdit ? 'Edit Club' : 'Add Club'}>
                <div className="space-y-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions}
                        required error={errors.school} />
                    <FormInput label="Name" value={form.name} onChange={set('name')}
                        placeholder="e.g. Coding Club, IEEE Committee"
                        required error={errors.name} />
                    <FormInput label="Type" type="select" value={form.type}
                        onChange={set('type')} options={typeOptions} />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_active"
                            checked={form.is_active}
                            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                            className="rounded border-gray-300 text-primary-600
                                       focus:ring-primary-500" />
                        <label htmlFor="is_active" className="text-sm text-gray-700">
                            Active
                        </label>
                    </div>
                    {errors.non_field_errors && (
                        <p className="text-sm text-red-500">{errors.non_field_errors}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button loading={saving} onClick={handleSubmit}>
                            {isEdit ? 'Save Changes' : 'Create Club'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
