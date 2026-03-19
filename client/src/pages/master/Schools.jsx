import { useState, useEffect } from 'react'
import useRecords from '../../hooks/useRecords'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api from '../../api/axios'

const empty = { campus: '', name: '', code: '' }

export default function Schools() {
    const { data, loading, create, update, remove , totalPages, currentPage, goToPage} = useRecords('/schools/')

    const [campusOptions, setCampusOptions] = useState([])

    useEffect(() => {
        api.get('/schools/campuses/').then(res => {
            const data = res.data?.results ?? res.data
            setCampusOptions(data
                .filter(c => c.is_active)
                .map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))
            )
        })
    }, [])

    const [showForm, setShowForm] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const isEdit = !!selected

    const openCreate = () => {
        setSelected(null)
        setForm(empty)
        setErrors({})
        setShowForm(true)
    }

    const openEdit = (school) => {
        setSelected(school)
        setForm({ campus: school.campus, name: school.name, code: school.code })
        setErrors({})
        setShowForm(true)
    }

    const openDeactivate = (school) => {
        setSelected(school)
        setShowConfirm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.campus) e.campus = 'Campus is required'
        if (!form.name.trim()) e.name = 'School name is required'
        if (!form.code.trim()) e.code = 'School code is required'
        setErrors(e)
        return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (isEdit) {
                await update(selected.id, form)
            } else {
                await create(form)
            }
            setShowForm(false)
        } catch (err) {
            const data = err.response?.data
            if (data) setErrors(data)
        } finally {
            setSaving(false)
        }
    }

    const handleDeactivate = async () => {
        setSaving(true)
        try {
            await remove(selected.id)
            setShowConfirm(false)
        } finally {
            setSaving(false)
        }
    }

    const columns = [
        { key: 'campus_name', label: 'Campus' },
        { key: 'name', label: 'School Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'is_active', label: 'Status', sortable: false,
            render: row => (
                <Badge
                    label={row.is_active ? 'Active' : 'Inactive'}
                    color={row.is_active ? 'green' : 'gray'}
                />
            )
        },
        { key: 'created_at', label: 'Created', render: row => row.created_at?.slice(0, 10) },
        {
            key: 'actions', label: '', sortable: false,
            render: row => (
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                        Edit
                    </Button>
                    {row.is_active && (
                        <Button size="sm" variant="danger" onClick={() => openDeactivate(row)}>
                            Deactivate
                        </Button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div>
            <PageHeader
                title="Schools"
                subtitle="Manage all schools in the portal"
                action={
                    <Button onClick={openCreate}>+ Add School</Button>
                }
            />

            <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

            {/* Create / Edit Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={isEdit ? 'Edit School' : 'Add New School'}
            >
                <div className="space-y-4">
                    <FormInput
                        label="Campus"
                        type="select"
                        value={form.campus}
                        onChange={e => setForm(f => ({ ...f, campus: e.target.value }))}
                        options={campusOptions}
                        required
                        error={errors.campus}
                    />
                    <FormInput
                        label="School Name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. School of Technology"
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="School Code"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                        placeholder="e.g. SOT"
                        required
                        error={errors.code}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} loading={saving}>
                            {isEdit ? 'Save Changes' : 'Create School'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Deactivate Confirm */}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDeactivate}
                title="Deactivate School"
                message={`Are you sure you want to deactivate "${selected?.name}"? Users assigned to this school will lose access.`}
                confirmLabel="Deactivate"
                loading={saving}
            />
        </div>
    )
}