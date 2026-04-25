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
    club: '', club_name: '', conducted_by: '', activity_type: 'club'
}

export default function StudentActivitiesPage({ readOnly = false }) {
    const { user } = useAuth()
    const { data, loading, create, fetch, totalPages, currentPage, goToPage } = useRecords('/records/student-activities/')
    const { schoolOptions } = useSchools()
    const { exportFile, exporting } = useExport('/export/student-activities/', 'student_activities.xlsx')

    const [clubOptions, setClubOptions] = useState([])
    const [showOther, setShowOther] = useState(false)

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    // Fetch clubs when school or activity_type changes
    useEffect(() => {
        if (!form.school || form.activity_type === 'other') {
            setClubOptions([])
            return
        }
        const clubType = form.activity_type // 'club' or 'committee'
        api.get(`/records/clubs/?school=${form.school}&type=${clubType}&is_active=true`)
            .then(res => {
                const clubs = res.data?.results ?? res.data
                setClubOptions([
                    ...clubs.map(c => ({ value: String(c.id), label: c.name })),
                    { value: 'other', label: 'Other (type below)' }
                ])
            })
            .catch(() => setClubOptions([{ value: 'other', label: 'Other (type below)' }]))
    }, [form.school, form.activity_type])

    const handleClubChange = e => {
        const val = e.target.value
        if (val === 'other') {
            setShowOther(true)
            setForm(p => ({ ...p, club: '', club_name: '' }))
        } else {
            setShowOther(false)
            const label = clubOptions.find(o => o.value === val)?.label || ''
            setForm(p => ({ ...p, club: val, club_name: label }))
        }
    }

    const openCreate = () => {
        setSelected(null); setForm(empty)
        setShowOther(false); setErrors({}); setShowForm(true)
    }

    const openEdit = row => {
        setSelected(row)
        const hasClubFK = !!row.club
        setForm({
            school: row.school,
            name: row.name,
            date: row.date,
            details: row.details,
            club: row.club ? String(row.club) : '',
            club_name: row.club_name || '',
            conducted_by: row.conducted_by || '',
            activity_type: row.activity_type,
        })
        setShowOther(!hasClubFK && (!!row.club_name || !!row.conducted_by))
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.name) e.name = 'Activity name is required'
        if (!form.date) e.date = 'Date is required'
        if (!form.details) e.details = 'Details are required'
        if (form.activity_type !== 'other' && !form.club && !showOther)
            e.club = 'Please select a club or committee'
        if (showOther && !form.club_name && !form.conducted_by)
            e.club_name = 'Please enter who conducted this activity'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            const payload = { ...form }
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
            const res = await api.delete(`/records/student-activities/${selected.id}/`)
            console.log('Delete response:', res.data)
            setShowDeleteConfirm(false)
            fetch()
        } catch (err) {
            console.error('Delete failed:', err)
        } finally {
            setSaving(false)
        }
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
            key: 'status', label: 'Status', sortable: false,
            render: row => row.pending_audit ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                    Pending Approval
                </span>
            ) : null
        },
        {
            key: 'actions', label: '', sortable: false,
            render: row => !readOnly && (
                <div className="flex gap-2">
                    {row.pending_audit ? (
                        <span className="text-xs text-yellow-600 italic">
                            Change pending...
                        </span>
                    ) : (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                                Edit
                            </Button>
                            <Button size="sm" variant="danger"
                                onClick={() => { setSelected(row); setShowDeleteConfirm(true) }}>
                                Delete
                            </Button>
                        </>
                    )}
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
                        onChange={e => {
                            set('school')(e)
                            setForm(p => ({ ...p, club: '', club_name: '' }))
                            setShowOther(false)
                        }}
                        options={schoolOptions}
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
                            setForm(p => ({ ...p, club: '', club_name: '', conducted_by: '' }))
                            setShowOther(false)
                        }}
                        options={typeOptions} />

                    {/* Club / Committee dropdown */}
                    {form.activity_type !== 'other' && (
                        <FormInput
                            label={form.activity_type === 'club' ? 'Club' : 'Committee'}
                            type="select"
                            value={showOther ? 'other' : form.club}
                            onChange={handleClubChange}
                            options={clubOptions}
                            error={errors.club}
                            required
                        />
                    )}

                    {/* Free text fallback */}
                    {(showOther || form.activity_type === 'other') && (
                        <FormInput label="Conducted By (name)"
                            value={form.activity_type === 'other' ? form.conducted_by : form.club_name}
                            onChange={form.activity_type === 'other' ? set('conducted_by') : set('club_name')}
                            placeholder="Enter name manually"
                            error={errors.club_name || errors.conducted_by} />
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