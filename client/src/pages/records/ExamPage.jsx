import { useState, useEffect } from 'react'
import useRecords from '../../hooks/useRecords'
import useSchools from '../../hooks/useSchools'
import useExport from '../../hooks/useExport'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const empty = {
    school: '', exam_group: '', subject: '',
    class_group: '', faculty: '', date: ''
}

export default function ExamsPage({ readOnly = false, facultyMode = false }) {
    const { user } = useAuth()
    const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/records/exams/')
    const { schoolOptions } = useSchools()
    const { exportFile, exporting } = useExport('/export/exams/', 'exams.xlsx')

    const [examGroupOptions, setExamGroupOptions] = useState([])
    const [subjectOptions, setSubjectOptions] = useState([])
    const [classGroupOptions, setClassGroupOptions] = useState([])
    const [facultyOptions, setFacultyOptions] = useState([])

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    // load dropdown options based on mode
    useEffect(() => {
        if (facultyMode) {
            // faculty mode — load only from approved assignments
            api.get('/academics/my-assignments/').then(res => {
                const data = res.data?.results ?? res.data

                // build unique subject options from assignments
                const subjects = [...new Map(data.map(a =>
                    [a.subject, { value: a.subject, label: `${a.subject_code} — ${a.subject_name}` }]
                )).values()]
                setSubjectOptions(subjects)

                // build unique class group options from assignments
                const classGroups = [...new Map(data.map(a =>
                    [a.class_group, { value: a.class_group, label: a.class_group_name }]
                )).values()]
                setClassGroupOptions(classGroups)
            })

            // still load exam groups from academics
            api.get('/academics/exam-groups/').then(res => {
                const data = res.data?.results ?? res.data
                setExamGroupOptions(data.map(g => ({ value: g.id, label: g.name })))
            })
        } else {
            // admin mode — load everything
            api.get('/academics/exam-groups/').then(res => {
                const data = res.data?.results ?? res.data
                setExamGroupOptions(data.map(g => ({ value: g.id, label: g.name })))
            })
            api.get('/academics/subjects/?is_active=true').then(res => {
                const data = res.data?.results ?? res.data
                setSubjectOptions(data.map(s => ({
                    value: s.id,
                    label: `${s.code} — ${s.name}`
                })))
            })
            api.get('/academics/class-groups/?is_active=true').then(res => {
                const data = res.data?.results ?? res.data
                setClassGroupOptions(data.map(g => ({ value: g.id, label: g.name })))
            })
            api.get('/academics/faculty/').then(res => {
                const data = res.data?.results ?? res.data
                setFacultyOptions(data.map(f => ({
                    value: f.id,
                    label: f.full_name
                })))
            })
        }
    }, [facultyMode])

    // faculty always auto-assigned to themselves — hide faculty dropdown in facultyMode
    // in the form remove the faculty field for facultyMode and auto-set it
    const handleFacultyAutoSet = () => {
        if (facultyMode) {
            const user = JSON.parse(localStorage.getItem('user'))
            setForm(f => ({ ...f, faculty: user.id }))
        }
    }

    // call this when form opens in faculty mode
    const openCreate = () => {
        setSelected(null)
        setForm(empty)
        setErrors({})
        if (facultyMode) handleFacultyAutoSet()
        setShowForm(true)
    }

    const openEdit = row => {
        setSelected(row)
        setForm({
            school: row.school,
            exam_group: row.exam_group,
            subject: row.subject,
            class_group: row.class_group,
            faculty: row.faculty || '',
            date: row.date,
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.exam_group) e.exam_group = 'Exam group is required'
        if (!form.subject) e.subject = 'Subject is required'
        if (!form.class_group) e.class_group = 'Class group is required'
        if (!form.date) e.date = 'Date is required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            if (selected) {
                await api.put(`/records/exams/${selected.id}/`, form)
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
            await api.delete(`/records/exams/${selected.id}/`)
            setShowDeleteConfirm(false); fetch()
        } finally { setSaving(false) }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'exam_group_name', label: 'Exam Group' },
        { key: 'subject_name', label: 'Subject' },
        { key: 'subject_code', label: 'Code' },
        { key: 'class_group_name', label: 'Class Group' },
        {
            key: 'faculty_name', label: 'Faculty',
            render: row => row.faculty_name || '—'
        },
        {
            key: 'course_name', label: 'Course',
            render: row => row.course_name || '—'
        },
        { key: 'date', label: 'Date' },
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
                            <button
                                onClick={() => exportFile()}
                                disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700
                           text-white text-sm font-medium rounded-lg
                           transition-colors disabled:opacity-50
                           flex items-center gap-2"
                            >
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {/* Faculty can create but not edit/delete */}
                        {(!readOnly || facultyMode) && (
                            <Button onClick={openCreate}>+ Add Exam</Button>
                        )}
                    </div>
                }
            />

            <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit Exam Record' : 'Add Exam Record'} size="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions}
                        required error={errors.school} />
                    <FormInput label="Date" type="date" value={form.date}
                        onChange={set('date')} required error={errors.date} />
                    <FormInput label="Exam Group" type="select" value={form.exam_group}
                        onChange={set('exam_group')} options={examGroupOptions}
                        required error={errors.exam_group} />
                    <FormInput label="Subject" type="select" value={form.subject}
                        onChange={set('subject')} options={subjectOptions}
                        required error={errors.subject} />
                    <FormInput label="Class Group" type="select" value={form.class_group}
                        onChange={set('class_group')} options={classGroupOptions}
                        required error={errors.class_group} />
                    {/* Only show faculty dropdown in admin mode */}
                    {!facultyMode && (
                        <FormInput label="Faculty (optional)" type="select" value={form.faculty}
                            onChange={set('faculty')} options={facultyOptions} />
                    )}
                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
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
                message="This delete request will be sent for approval before the record is removed."
                confirmLabel="Submit for Approval" loading={saving} />
        </div>
    )
}