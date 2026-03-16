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

const typeOptions = [
    { value: 'FDP', label: 'FDP' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Guest_Lecture', label: 'Guest Lecture' },
]

const typeBadgeColor = { FDP: 'blue', Workshop: 'green', Guest_Lecture: 'purple' }

const empty = {
    school: '', faculty_name: '', date_start: '', date_end: '',
    name: '', details: '', type: 'FDP', organizing_body: ''
}

export default function FDPPage({ readOnly = false }) {
    const { user } = useAuth()
    const { exportFile, exporting } = useExport('/export/fdp/', 'fdp.xlsx')
    const { data, loading, create, fetch } = useRecords('/records/fdp/')
    const { schoolOptions } = useSchools()

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

    const openCreate = () => { setSelected(null); setForm(empty); setErrors({}); setShowForm(true) }
    const openEdit = row => {
        setSelected(row)
        setForm({
            school: row.school, faculty_name: row.faculty_name,
            date_start: row.date_start, date_end: row.date_end || '',
            name: row.name, details: row.details,
            type: row.type, organizing_body: row.organizing_body || ''
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.faculty_name) e.faculty_name = 'Faculty name is required'
        if (!form.date_start) e.date_start = 'Start date is required'
        if (!form.name) e.name = 'Name is required'
        if (!form.details) e.details = 'Details are required'
        if (!form.type) e.type = 'Type is required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                await api.put(`/records/fdp/${selected.id}/`, form)
                setShowEditConfirm(false)
            } else { await create(form) }
            setShowForm(false); fetch()
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            await api.delete(`/records/fdp/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'faculty_name', label: 'Faculty' },
        { key: 'name', label: 'Name' },
        { key: 'date_start', label: 'Date' },
        {
            key: 'type', label: 'Type', sortable: false,
            render: row => <Badge label={row.type?.replace('_', ' ')}
                color={typeBadgeColor[row.type]} />
        },
        { key: 'organizing_body', label: 'Organized By' },
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
            <PageHeader title="FDP / Workshop / Guest Lecture"
                subtitle="Faculty development and training records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Record</Button>}
                    </div>
                } />

            <Table columns={columns} data={data} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit FDP Record' : 'Add FDP Record'} size="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions} required error={errors.school} />
                    <FormInput label="Faculty Name" value={form.faculty_name}
                        onChange={set('faculty_name')} placeholder="e.g. Dr. V Vidyasagar"
                        required error={errors.faculty_name} />
                    <FormInput label="Date Start" type="date" value={form.date_start}
                        onChange={set('date_start')} required error={errors.date_start} />
                    <FormInput label="Date End (optional)" type="date" value={form.date_end}
                        onChange={set('date_end')} />
                    <div className="md:col-span-2">
                        <FormInput label="Name / Title" value={form.name} onChange={set('name')}
                            placeholder="e.g. Python for Data Science" required error={errors.name} />
                    </div>
                    <FormInput label="Type" type="select" value={form.type}
                        onChange={set('type')} options={typeOptions} required error={errors.type} />
                    <FormInput label="Organizing Body" value={form.organizing_body}
                        onChange={set('organizing_body')} placeholder="e.g. NPTEL, Coursera" />
                    <div className="md:col-span-2">
                        <FormInput label="Details" type="textarea" value={form.details}
                            onChange={set('details')} required error={errors.details} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
                message="This update will be sent for approval before being applied."
                confirmLabel="Submit for Approval" loading={saving} />
            <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete} title="Submit Delete Request"
                message="This delete request will be sent for approval before the record is removed."
                confirmLabel="Submit for Approval" loading={saving} />
        </div>
    )
}