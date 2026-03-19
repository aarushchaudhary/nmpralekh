import { useState, useEffect } from 'react'
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

const personTypeOptions = [
    { value: 'faculty', label: 'Faculty' },
    { value: 'student', label: 'Student' },
]

const empty = {
    school: '', date: '', name: '', title_of_course: '',
    details: '', agency: '', credly_or_proof_link: '', person_type: 'faculty'
}

export default function CertificationsPage({ readOnly = false, selfOnly = false }) {
    const { user } = useAuth()
    const { exportFile, exporting } = useExport('/export/certifications/', 'certifications.xlsx')
    const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/records/certifications/')
    const { schoolOptions } = useSchools()

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

    const isEdit = !!selected

    useEffect(() => {
        if (selfOnly && !isEdit) {
            setForm(f => ({ ...f, name: user?.full_name || '' }))
        }
    }, [selfOnly, user, showForm])

    const openCreate = () => {
        setSelected(null)
        setForm({
            ...empty,
            name: selfOnly ? (user?.full_name || '') : '',
        })
        setErrors({})
        setShowForm(true)
    }
    const openEdit = row => {
        setSelected(row)
        setForm({
            school: row.school, date: row.date, name: row.name,
            title_of_course: row.title_of_course, details: row.details || '',
            agency: row.agency, credly_or_proof_link: row.credly_or_proof_link || '',
            person_type: row.person_type
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.date) e.date = 'Date is required'
        if (!form.name) e.name = 'Name is required'
        if (!form.title_of_course) e.title_of_course = 'Course title is required'
        if (!form.agency) e.agency = 'Agency is required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                await api.put(`/records/certifications/${selected.id}/`, form)
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
            await api.delete(`/records/certifications/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const canEdit = row => {
        if (selfOnly) return row.created_by === user?.id
        return !readOnly
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'name', label: 'Name' },
        { key: 'title_of_course', label: 'Course' },
        { key: 'agency', label: 'Agency' },
        { key: 'date', label: 'Date' },
        {
            key: 'person_type', label: 'Type', sortable: false,
            render: row => <Badge label={row.person_type}
                color={row.person_type === 'faculty' ? 'blue' : 'purple'} />
        },
        {
            key: 'credly_or_proof_link', label: 'Link', sortable: false,
            render: row => row.credly_or_proof_link
                ? <a href={row.credly_or_proof_link} target="_blank" rel="noreferrer"
                    className="text-primary-600 hover:underline text-xs">View</a>
                : '—'
        },
        {
            key: 'actions', label: '', sortable: false,
            render: row => canEdit(row) && (
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
            <PageHeader title="Certifications" subtitle="Faculty and student certification records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {(selfOnly || !readOnly) && <Button onClick={openCreate}>+ Add Certification</Button>}
                    </div>
                } />

            <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit Certification' : 'Add Certification'} size="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions} required error={errors.school} />
                    <FormInput label="Date" type="date" value={form.date}
                        onChange={set('date')} required error={errors.date} />
                    <FormInput label="Name (Faculty/Student)" value={form.name}
                        onChange={set('name')} placeholder="e.g. Dr. Naresh Vurukonda"
                        disabled={selfOnly}
                        required error={errors.name} />
                    <FormInput label="Person Type" type="select" value={form.person_type}
                        onChange={set('person_type')} options={personTypeOptions} />
                    <div className="md:col-span-2">
                        <FormInput label="Title of Course" value={form.title_of_course}
                            onChange={set('title_of_course')}
                            placeholder="e.g. Python for Data Science AI and Development"
                            required error={errors.title_of_course} />
                    </div>
                    <FormInput label="Agency" value={form.agency}
                        onChange={set('agency')} placeholder="e.g. Coursera, Google"
                        required error={errors.agency} />
                    <FormInput label="Credly / Proof Link (optional)" value={form.credly_or_proof_link}
                        onChange={set('credly_or_proof_link')} placeholder="https://..." />
                    <div className="md:col-span-2">
                        <FormInput label="Details (optional)" type="textarea" value={form.details}
                            onChange={set('details')} />
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
                message="This delete request will be sent for approval."
                confirmLabel="Submit for Approval" loading={saving} />
        </div>
    )
}