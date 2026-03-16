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
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api from '../../api/axios'

const empty = {
    school: '', course: '', examination: '',
    date: '', expected_graduation_year: ''
}

export default function ExamsPage({ readOnly = false }) {
    const { user } = useAuth()
    const { exportFile, exporting } = useExport('/export/exams/', 'exams.xlsx')
    const { data, loading, create, fetch } = useRecords('/records/exams/')
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
        setSelected(null)
        setForm(empty)
        setErrors({})
        setShowForm(true)
    }

    const openEdit = (row) => {
        setSelected(row)
        setForm({
            school: row.school,
            course: row.course,
            examination: row.examination,
            date: row.date,
            expected_graduation_year: row.expected_graduation_year,
        })
        setErrors({})
        setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.course) e.course = 'Course is required'
        if (!form.examination) e.examination = 'Examination name is required'
        if (!form.date) e.date = 'Date is required'
        if (!form.expected_graduation_year)
            e.expected_graduation_year = 'Graduation year is required'
        setErrors(e)
        return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                // goes through audit workflow
                await api.put(`/records/exams/${selected.id}/`, form)
                setShowEditConfirm(false)
            } else {
                await create(form)
            }
            setShowForm(false)
            fetch()
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            await api.delete(`/records/exams/${selected.id}/`)
            setShowDeleteConfirm(false)
            fetch()
        } finally {
            setSaving(false)
        }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'course', label: 'Course' },
        { key: 'examination', label: 'Examination' },
        { key: 'date', label: 'Date' },
        { key: 'expected_graduation_year', label: 'Grad Year' },
        {
            key: 'actions', label: '', sortable: false,
            render: row => !readOnly && (
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                        Edit
                    </Button>
                    <Button size="sm" variant="danger"
                        onClick={() => { setSelected(row); setShowDeleteConfirm(true) }}>
                        Delete
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div>
            <PageHeader
                title="Exams Conducted"
                subtitle="Manage examination records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Exam</Button>}
                    </div>
                }
            />

            <Table columns={columns} data={data} loading={loading} />

            {/* Create / Edit Form */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={selected ? 'Edit Exam Record' : 'Add Exam Record'}
            >
                <div className="space-y-4">
                    <FormInput
                        label="School" type="select"
                        value={form.school} onChange={set('school')}
                        options={schoolOptions} required error={errors.school}
                    />
                    <FormInput
                        label="Course" value={form.course}
                        onChange={set('course')}
                        placeholder="e.g. B.Tech CSEDS (I and III Sem)"
                        required error={errors.course}
                    />
                    <FormInput
                        label="Examination" value={form.examination}
                        onChange={set('examination')}
                        placeholder="e.g. Mid Term Test II"
                        required error={errors.examination}
                    />
                    <FormInput
                        label="Date" type="date"
                        value={form.date} onChange={set('date')}
                        required error={errors.date}
                    />
                    <FormInput
                        label="Expected Graduation Year"
                        type="number"
                        value={form.expected_graduation_year}
                        onChange={set('expected_graduation_year')}
                        placeholder="e.g. 2027"
                        required error={errors.expected_graduation_year}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={selected ? () => { setShowForm(false); setShowEditConfirm(true) } : handleSubmit}
                            loading={saving}
                        >
                            {selected ? 'Request Update' : 'Save Record'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit goes through audit */}
            <ConfirmDialog
                isOpen={showEditConfirm}
                onClose={() => setShowEditConfirm(false)}
                onConfirm={handleSubmit}
                title="Submit Update Request"
                message="This update will be sent for approval before being applied. Continue?"
                confirmLabel="Submit for Approval"
                loading={saving}
            />

            {/* Delete goes through audit */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Submit Delete Request"
                message="This delete request will be sent for approval before the record is removed. Continue?"
                confirmLabel="Submit for Approval"
                loading={saving}
            />
        </div>
    )
}