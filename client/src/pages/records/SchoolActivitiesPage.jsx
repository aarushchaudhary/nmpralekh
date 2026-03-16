import { useState } from 'react'
import useRecords from '../../hooks/useRecords'
import useSchools from '../../hooks/useSchools'
import { useAuth } from '../../context/AuthContext'
import useExport from '../../hooks/useExport'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api from '../../api/axios'

const empty = {
    school: '', name: '', date: '',
    details: '', is_school_wide: false
}

export default function SchoolActivitiesPage({ readOnly = false }) {
    const { user } = useAuth()
    const { exportFile, exporting } = useExport('/export/school-activities/', 'school_activities.xlsx')
    const { data, loading, create, fetch } = useRecords('/records/school-activities/')
    const { schoolOptions } = useSchools()

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

    const openCreate = () => {
        setSelected(null); setForm(empty); setErrors({}); setShowForm(true)
    }

    const openEdit = row => {
        setSelected(row)
        setForm({
            school: row.school, name: row.name,
            date: row.date, details: row.details,
            is_school_wide: row.is_school_wide,
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.name) e.name = 'Activity name is required'
        if (!form.date) e.date = 'Date is required'
        if (!form.details) e.details = 'Details are required'
        setErrors(e)
        return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                await api.put(`/records/school-activities/${selected.id}/`, form)
                setShowEditConfirm(false)
            } else {
                await create(form)
            }
            setShowForm(false); fetch()
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            await api.delete(`/records/school-activities/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'name', label: 'Activity Name' },
        { key: 'date', label: 'Date' },
        {
            key: 'is_school_wide', label: 'School Wide', sortable: false,
            render: row => <Badge label={row.is_school_wide ? 'Yes' : 'No'}
                color={row.is_school_wide ? 'green' : 'gray'} />
        },
        {
            key: 'actions', label: '', sortable: false,
            render: row => !readOnly && (
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
                    <Button size="sm" variant="danger"
                        onClick={() => { setSelected(row); setShowDeleteConfirm(true) }}>Delete</Button>
                </div>
            )
        }
    ]

    return (
        <div>
            <PageHeader title="School Activities" subtitle="Manage school activity records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Activity</Button>}
                    </div>
                } />

            <Table columns={columns} data={data} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit School Activity' : 'Add School Activity'}>
                <div className="space-y-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions} required error={errors.school} />
                    <FormInput label="Activity Name" value={form.name} onChange={set('name')}
                        placeholder="e.g. Industry Expert Talk" required error={errors.name} />
                    <FormInput label="Date" type="date" value={form.date}
                        onChange={set('date')} required error={errors.date} />
                    <FormInput label="Details" type="textarea" value={form.details}
                        onChange={set('details')} placeholder="Describe the activity"
                        required error={errors.details} />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="school_wide" checked={form.is_school_wide}
                            onChange={e => setForm(f => ({ ...f, is_school_wide: e.target.checked }))}
                            className="rounded" />
                        <label htmlFor="school_wide" className="text-sm text-gray-700">
                            Conducted for entire school
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button loading={saving}
                            onClick={selected ? () => { setShowForm(false); setShowEditConfirm(true) } : handleSubmit}>
                            {selected ? 'Request Update' : 'Save Record'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog isOpen={showEditConfirm} onClose={() => setShowEditConfirm(false)}
                onConfirm={handleSubmit} title="Submit Update Request"
                message="This update will be sent for approval before being applied. Continue?"
                confirmLabel="Submit for Approval" loading={saving} />

            <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete} title="Submit Delete Request"
                message="This delete request will be sent for approval before the record is removed."
                confirmLabel="Submit for Approval" loading={saving} />
        </div>
    )
}