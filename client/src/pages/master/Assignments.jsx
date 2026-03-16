import { useState } from 'react'
import useRecords from '../../hooks/useRecords'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api from '../../api/axios'
import { useEffect } from 'react'

export default function Assignments() {
    const { data, loading, create, remove } = useRecords('/schools/assign/')

    const [showForm, setShowForm] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState({ user: '', school: '' })
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const [userOptions, setUserOptions] = useState([])
    const [schoolOptions, setSchoolOptions] = useState([])

    // load users and schools for dropdowns
    useEffect(() => {
        api.get('/users/').then(res => {
            const users = res.data?.results ?? res.data
            setUserOptions(users
                .filter(u => u.is_active && u.role !== 'master')
                .map(u => ({ value: u.id, label: `${u.full_name} (${u.role})` }))
            )
        })
        api.get('/schools/').then(res => {
            const schools = res.data?.results ?? res.data
            setSchoolOptions(schools
                .filter(s => s.is_active)
                .map(s => ({ value: s.id, label: s.name }))
            )
        })
    }, [])

    const handleSubmit = async () => {
        const e = {}
        if (!form.user) e.user = 'Please select a user'
        if (!form.school) e.school = 'Please select a school'
        setErrors(e)
        if (Object.keys(e).length) return

        setSaving(true)
        try {
            await create(form)
            setShowForm(false)
            setForm({ user: '', school: '' })
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async () => {
        setSaving(true)
        try {
            await remove(selected.id)
            setShowConfirm(false)
        } finally {
            setSaving(false)
        }
    }

    const columns = [
        { key: 'user', label: 'User', render: row => row.user?.full_name },
        { key: 'role', label: 'Role', render: row => row.user?.role?.replace('_', ' ') },
        { key: 'school', label: 'School', render: row => row.school?.name },
        { key: 'assigned_at', label: 'Assigned', render: row => row.assigned_at?.slice(0, 10) },
        {
            key: 'actions', label: '', sortable: false,
            render: row => (
                <Button
                    size="sm" variant="danger"
                    onClick={() => { setSelected(row); setShowConfirm(true) }}
                >
                    Remove
                </Button>
            )
        }
    ]

    return (
        <div>
            <PageHeader
                title="School Assignments"
                subtitle="Assign users to schools to control their data access"
                action={
                    <Button onClick={() => { setForm({ user: '', school: '' }); setShowForm(true) }}>
                        + Assign User
                    </Button>
                }
            />

            <Table columns={columns} data={data} loading={loading} />

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Assign User to School"
            >
                <div className="space-y-4">
                    <FormInput
                        label="User" type="select"
                        value={form.user}
                        onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                        options={userOptions}
                        required error={errors.user}
                    />
                    <FormInput
                        label="School" type="select"
                        value={form.school}
                        onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                        options={schoolOptions}
                        required error={errors.school}
                    />
                    {errors.non_field_errors && (
                        <p className="text-sm text-red-500">{errors.non_field_errors}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} loading={saving}>
                            Assign
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleRemove}
                title="Remove Assignment"
                message={`Remove ${selected?.user?.full_name} from ${selected?.school?.name}?`}
                confirmLabel="Remove"
                loading={saving}
            />
        </div>
    )
}