import { useState } from 'react'
import useRecords from '../../hooks/useRecords'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'Faculty' },
    { value: 'delete_auth', label: 'Delete Auth' },
]

const roleBadgeColor = {
    master: 'blue',
    super_admin: 'purple',
    admin: 'green',
    user: 'gray',
    delete_auth: 'yellow',
}

const emptyForm = {
    username: '', email: '', password: '',
    full_name: '', role: '', is_active: true,
}

export default function Users() {
    const { data, loading, create, update, remove } = useRecords('/users/')

    const [showForm, setShowForm] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const isEdit = !!selected

    const openCreate = () => {
        setSelected(null)
        setForm(emptyForm)
        setErrors({})
        setShowForm(true)
    }

    const openEdit = (user) => {
        setSelected(user)
        setForm({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        })
        setErrors({})
        setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.full_name?.trim()) e.full_name = 'Full name is required'
        if (!form.email?.trim()) e.email = 'Email is required'
        if (!form.role) e.role = 'Role is required'
        if (!isEdit && !form.username?.trim()) e.username = 'Username is required'
        if (!isEdit && !form.password?.trim()) e.password = 'Password is required'
        setErrors(e)
        return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (isEdit) {
                await update(selected.id, {
                    full_name: form.full_name,
                    email: form.email,
                    role: form.role,
                    is_active: form.is_active,
                })
            } else {
                await create(form)
            }
            setShowForm(false)
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
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

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const columns = [
        { key: 'full_name', label: 'Name' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        {
            key: 'role', label: 'Role',
            render: row => (
                <Badge
                    label={row.role?.replace('_', ' ')}
                    color={roleBadgeColor[row.role] ?? 'gray'}
                />
            )
        },
        {
            key: 'is_active', label: 'Status', sortable: false,
            render: row => (
                <Badge
                    label={row.is_active ? 'Active' : 'Inactive'}
                    color={row.is_active ? 'green' : 'red'}
                />
            )
        },
        {
            key: 'actions', label: '', sortable: false,
            render: row => row.role !== 'master' && (
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                        Edit
                    </Button>
                    {row.is_active && (
                        <Button size="sm" variant="danger"
                            onClick={() => { setSelected(row); setShowConfirm(true) }}>
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
                title="Users"
                subtitle="Manage all portal users"
                action={<Button onClick={openCreate}>+ Add User</Button>}
            />

            <Table columns={columns} data={data} loading={loading} />

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={isEdit ? 'Edit User' : 'Create New User'}
            >
                <div className="space-y-4">
                    {!isEdit && (
                        <FormInput
                            label="Username" value={form.username}
                            onChange={set('username')}
                            placeholder="e.g. dr_rahul"
                            required error={errors.username}
                        />
                    )}
                    <FormInput
                        label="Full Name" value={form.full_name}
                        onChange={set('full_name')}
                        placeholder="e.g. Dr. Rahul Koshti"
                        required error={errors.full_name}
                    />
                    <FormInput
                        label="Email" type="email" value={form.email}
                        onChange={set('email')}
                        placeholder="e.g. rahul@college.edu"
                        required error={errors.email}
                    />
                    {!isEdit && (
                        <FormInput
                            label="Password" type="password" value={form.password}
                            onChange={set('password')}
                            placeholder="Minimum 8 characters"
                            required error={errors.password}
                        />
                    )}
                    <FormInput
                        label="Role" type="select" value={form.role}
                        onChange={set('role')}
                        options={roleOptions}
                        required error={errors.role}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} loading={saving}>
                            {isEdit ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDeactivate}
                title="Deactivate User"
                message={`Are you sure you want to deactivate "${selected?.full_name}"?`}
                confirmLabel="Deactivate"
                loading={saving}
            />
        </div>
    )
}