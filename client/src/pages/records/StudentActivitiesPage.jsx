import { useState, useEffect } from 'react'
import useRecords from '../../hooks/useRecords'
import useSchools from '../../hooks/useSchools'
import useExport from '../../hooks/useExport'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const typeOptions = [
    { value: 'club', label: 'Club' },
    { value: 'committee', label: 'Committee' },
    { value: 'other', label: 'Other' },
]

const typeBadgeColor = { club: 'blue', committee: 'purple', other: 'gray' }

const empty = {
    school: '', name: '', date: '', details: '',
    club: '', conducted_by: '', activity_type: 'club'
}

export default function StudentActivitiesPage({ readOnly = false }) {
    const { user } = useAuth()
    const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/records/student-activities/')
    const { schoolOptions } = useSchools()
    const { exportFile, exporting } = useExport('/export/student-activities/', 'student_activities.xlsx')

    const [clubOptions, setClubOptions] = useState([])
    const [committeeOptions, setCommitteeOptions] = useState([])
    const [showOtherInput, setShowOtherInput] = useState(false)

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    useEffect(() => {
        // load clubs
        api.get('/academics/clubs/?type=club&is_active=true').then(res => {
            const data = res.data?.results ?? res.data
            setClubOptions([
                ...data.map(c => ({ value: c.id, label: c.name })),
                { value: 'other', label: 'Other (type below)' }
            ])
        })
        // load committees
        api.get('/academics/clubs/?type=committee&is_active=true').then(res => {
            const data = res.data?.results ?? res.data
            setCommitteeOptions([
                ...data.map(c => ({ value: c.id, label: c.name })),
                { value: 'other', label: 'Other (type below)' }
            ])
        })
    }, [])

    // show free text field when Other is selected
    const handleClubChange = e => {
        const val = e.target.value
        setForm(p => ({ ...p, club: val === 'other' ? '' : val, conducted_by: '' }))
        setShowOtherInput(val === 'other')
    }

    const currentOptions = form.activity_type === 'club'
        ? clubOptions
        : form.activity_type === 'committee'
            ? committeeOptions
            : []

    const openCreate = () => {
        setSelected(null); setForm(empty)
        setShowOtherInput(false); setErrors({}); setShowForm(true)
    }

    const openEdit = row => {
        setSelected(row)
        setForm({
            school: row.school,
            name: row.name,
            date: row.date,
            details: row.details,
            club: row.club || '',
            conducted_by: row.conducted_by || '',
            activity_type: row.activity_type,
        })
        setShowOtherInput(!row.club && !!row.conducted_by)
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.name) e.name = 'Activity name is required'
        if (!form.date) e.date = 'Date is required'
        if (!form.details) e.details = 'Details are required'
        if (form.activity_type !== 'other' && !form.club && !form.conducted_by)
            e.club = 'Please select or enter who conducted this activity'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            const payload = { ...form }
            // if club is empty string set to null
            if (!payload.club) payload.club = null
            if (selected) {
                await api.put(`/records/student-activities/${selected.id}/`, payload)
                setShowEditConfirm(false)
            } else { await create(payload) }
            setShowForm(false); fetch()
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            await api.delete(`/records/student-activities/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'name', label: 'Activity' },
        { key: 'date', label: 'Date' },
        {
            key: 'conducted_by_display', label: 'Conducted By',
            render: row => row.club_name || row.conducted_by || '—'
        },
        {
            key: 'activity_type', label: 'Type', sortable: false,
            render: row => <Badge label={row.activity_type}
                color={typeBadgeColor[row.activity_type]} />
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
            <PageHeader title="Student Activities"
                subtitle="Club and committee activity records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                           text-sm font-medium rounded-lg transition-colors
                           disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Activity</Button>}
                    </div>
                }
            />

            <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit Student Activity' : 'Add Student Activity'} size="lg">
                <div className="space-y-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions}
                        required error={errors.school} />
                    <FormInput label="Activity Name" value={form.name} onChange={set('name')}
                        placeholder="e.g. MongoDB Learnathon" required error={errors.name} />
                    <FormInput label="Date" type="date" value={form.date}
                        onChange={set('date')} required error={errors.date} />

                    {/* Activity type selector */}
                    <FormInput label="Activity Type" type="select"
                        value={form.activity_type}
                        onChange={e => {
                            set('activity_type')(e)
                            setForm(p => ({ ...p, club: '', conducted_by: '' }))
                            setShowOtherInput(false)
                        }}
                        options={typeOptions} />

                    {/* Club / Committee dropdown — only show for club or committee type */}
                    {form.activity_type !== 'other' && (
                        <FormInput
                            label={form.activity_type === 'club' ? 'Club' : 'Committee'}
                            type="select"
                            value={showOtherInput ? 'other' : form.club}
                            onChange={handleClubChange}
                            options={currentOptions}
                            error={errors.club}
                        />
                    )}

                    {/* Free text fallback when Other selected */}
                    {(showOtherInput || form.activity_type === 'other') && (
                        <FormInput label="Conducted By (free text)"
                            value={form.conducted_by} onChange={set('conducted_by')}
                            placeholder="Enter club or committee name"
                            error={errors.conducted_by} />
                    )}

                    <FormInput label="Details" type="textarea" value={form.details}
                        onChange={set('details')} required error={errors.details} />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button loading={saving}
                            onClick={selected
                                ? () => { setShowForm(false); setShowEditConfirm(true) }
                                : handleSubmit}>
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
                message="This delete request will be sent for approval."
                confirmLabel="Submit for Approval" loading={saving} />
        </div>
    )
}