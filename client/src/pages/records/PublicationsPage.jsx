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

const authorTypeOptions = [
    { value: 'faculty', label: 'Faculty' },
    { value: 'student', label: 'Student' },
]

const empty = {
    school: '', author_name: '', author_type: 'faculty',
    title_of_paper: '', journal_or_conference_name: '',
    date: '', venue: '', publication: '', doi_or_link: ''
}

export default function PublicationsPage({ readOnly = false }) {
    const { user } = useAuth()
    const { exportFile, exporting } = useExport('/export/publications/', 'publications.xlsx')
    const { data, loading, create, fetch } = useRecords('/records/publications/')
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
            school: row.school, author_name: row.author_name,
            author_type: row.author_type, title_of_paper: row.title_of_paper,
            journal_or_conference_name: row.journal_or_conference_name,
            date: row.date, venue: row.venue || '',
            publication: row.publication || '', doi_or_link: row.doi_or_link || ''
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.author_name) e.author_name = 'Author name is required'
        if (!form.title_of_paper) e.title_of_paper = 'Title is required'
        if (!form.journal_or_conference_name) e.journal_or_conference_name = 'Journal/Conference is required'
        if (!form.date) e.date = 'Date is required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                await api.put(`/records/publications/${selected.id}/`, form)
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
            await api.delete(`/records/publications/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'author_name', label: 'Author' },
        {
            key: 'author_type', label: 'Type', sortable: false,
            render: row => <Badge label={row.author_type}
                color={row.author_type === 'faculty' ? 'blue' : 'purple'} />
        },
        {
            key: 'title_of_paper', label: 'Title',
            render: row => <span className="max-w-xs truncate block">{row.title_of_paper}</span>
        },
        {
            key: 'journal_or_conference_name', label: 'Journal/Conference',
            render: row => <span className="max-w-xs truncate block">{row.journal_or_conference_name}</span>
        },
        { key: 'date', label: 'Date' },
        { key: 'publication', label: 'Publication' },
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
            <PageHeader title="Faculty Publications"
                subtitle="Research papers and conference publications"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Publication</Button>}
                    </div>
                } />

            <Table columns={columns} data={data} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit Publication' : 'Add Publication'} size="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions} required error={errors.school} />
                    <FormInput label="Author Name" value={form.author_name}
                        onChange={set('author_name')} placeholder="e.g. Dr. Rahul Koshti"
                        required error={errors.author_name} />
                    <FormInput label="Author Type" type="select" value={form.author_type}
                        onChange={set('author_type')} options={authorTypeOptions} />
                    <FormInput label="Date" type="date" value={form.date}
                        onChange={set('date')} required error={errors.date} />
                    <div className="md:col-span-2">
                        <FormInput label="Title of Paper" value={form.title_of_paper}
                            onChange={set('title_of_paper')} required error={errors.title_of_paper} />
                    </div>
                    <div className="md:col-span-2">
                        <FormInput label="Journal / Conference Name"
                            value={form.journal_or_conference_name}
                            onChange={set('journal_or_conference_name')}
                            required error={errors.journal_or_conference_name} />
                    </div>
                    <FormInput label="Venue" value={form.venue}
                        onChange={set('venue')} placeholder="e.g. Indore, MP" />
                    <FormInput label="Publication" value={form.publication}
                        onChange={set('publication')} placeholder="e.g. IEEE Xplore" />
                    <div className="md:col-span-2">
                        <FormInput label="DOI / Link (optional)" value={form.doi_or_link}
                            onChange={set('doi_or_link')} placeholder="https://..." />
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