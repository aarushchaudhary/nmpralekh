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

const applicantTypeOptions = [
    { value: 'faculty', label: 'Faculty' },
    { value: 'student', label: 'Student' },
]

const statusOptions = [
    { value: 'filed', label: 'Filed' },
    { value: 'published', label: 'Published' },
    { value: 'granted', label: 'Granted' },
]

const statusColor = { filed: 'yellow', published: 'blue', granted: 'green' }

const empty = {
    school: '', applicant_name: '', applicant_type: 'faculty',
    title_of_patent: '', details: '', date_of_publication: '',
    journal_number: '', patent_status: 'filed'
}

export default function PatentsPage({ readOnly = false }) {
    const { user } = useAuth()
    const { exportFile, exporting } = useExport('/export/patents/', 'patents.xlsx')
    const { data, loading, create, fetch } = useRecords('/records/patents/')
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
            school: row.school, applicant_name: row.applicant_name,
            applicant_type: row.applicant_type, title_of_patent: row.title_of_patent,
            details: row.details || '', date_of_publication: row.date_of_publication,
            journal_number: row.journal_number, patent_status: row.patent_status
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.applicant_name) e.applicant_name = 'Applicant name is required'
        if (!form.title_of_patent) e.title_of_patent = 'Title is required'
        if (!form.date_of_publication) e.date_of_publication = 'Date is required'
        if (!form.journal_number) e.journal_number = 'Journal number is required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                await api.put(`/records/patents/${selected.id}/`, form)
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
            await api.delete(`/records/patents/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'applicant_name', label: 'Applicant' },
        {
            key: 'title_of_patent', label: 'Title',
            render: row => <span className="max-w-xs truncate block">{row.title_of_patent}</span>
        },
        { key: 'date_of_publication', label: 'Date' },
        { key: 'journal_number', label: 'Journal No.' },
        {
            key: 'patent_status', label: 'Status', sortable: false,
            render: row => <Badge label={row.patent_status}
                color={statusColor[row.patent_status]} />
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
            <PageHeader title="Patents" subtitle="Faculty and student patent records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Patent</Button>}
                    </div>
                } />

            <Table columns={columns} data={data} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit Patent' : 'Add Patent'} size="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions} required error={errors.school} />
                    <FormInput label="Applicant Name" value={form.applicant_name}
                        onChange={set('applicant_name')} required error={errors.applicant_name} />
                    <FormInput label="Applicant Type" type="select" value={form.applicant_type}
                        onChange={set('applicant_type')} options={applicantTypeOptions} />
                    <FormInput label="Date of Publication" type="date" value={form.date_of_publication}
                        onChange={set('date_of_publication')} required error={errors.date_of_publication} />
                    <div className="md:col-span-2">
                        <FormInput label="Title of Patent" value={form.title_of_patent}
                            onChange={set('title_of_patent')} required error={errors.title_of_patent} />
                    </div>
                    <FormInput label="Journal Number" value={form.journal_number}
                        onChange={set('journal_number')} placeholder="e.g. 22/2025"
                        required error={errors.journal_number} />
                    <FormInput label="Patent Status" type="select" value={form.patent_status}
                        onChange={set('patent_status')} options={statusOptions} />
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