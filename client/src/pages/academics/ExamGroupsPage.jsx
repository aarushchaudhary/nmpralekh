import { useState, useEffect } from 'react'
import useRecords  from '../../hooks/useRecords'
import useExport   from '../../hooks/useExport'
import useSchools  from '../../hooks/useSchools'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import Table       from '../../components/ui/Table'
import Modal       from '../../components/ui/Modal'
import FormInput   from '../../components/ui/FormInput'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api         from '../../api/axios'

const empty = { school: '', semester: '', name: '' }

export default function ExamGroupsPage() {
  const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/academics/exam-groups/')
  const { schoolOptions }                = useSchools()
  const { exportFile, exporting }        = useExport('/export/academics/exam-groups/', 'exam_groups.xlsx')

  const [semesterOptions, setSemesterOptions] = useState([])
  const [showForm, setShowForm]               = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [selected, setSelected]               = useState(null)
  const [form, setForm]                       = useState(empty)
  const [saving, setSaving]                   = useState(false)
  const [errors, setErrors]                   = useState({})

  const set    = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const isEdit = !!selected

  useEffect(() => {
    api.get('/academics/semesters/').then(res => {
      const data = res.data?.results ?? res.data
      setSemesterOptions(data.map(s => ({
        value: s.id,
        label: `${s.academic_year_detail?.course_code} Y${s.academic_year_detail?.year_number} S${s.semester_number} (${s.academic_year_detail?.graduation_year})`
      })))
    })
  }, [])

  const openCreate = () => { setSelected(null); setForm(empty); setErrors({}); setShowForm(true) }
  const openEdit   = row => {
    setSelected(row)
    setForm({ school: row.school, semester: row.semester, name: row.name })
    setErrors({}); setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school)   e.school   = 'Required'
    if (!form.semester) e.semester = 'Required'
    if (!form.name)     e.name     = 'Required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/academics/exam-groups/${selected.id}/`, form)
        fetch()
      } else { await create(form) }
      setShowForm(false)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await api.delete(`/academics/exam-groups/${selected.id}/`)
      console.log('Delete response:', res.data)
      setShowConfirm(false)
      fetch()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'school_name', label: 'School' },
    { key: 'name',        label: 'Exam Group Name',
      render: row => <span className="font-medium">{row.name}</span> },
    {
      key: 'semester_detail', label: 'Semester',
      render: row => row.semester_detail
        ? `${row.semester_detail.course_code} Y${row.semester_detail.year_number} S${row.semester_detail.semester_number} (${row.semester_detail.graduation_year})`
        : '—'
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
      render: row => (
        <div className="flex gap-2">
          {row.pending_audit ? (
            <span className="text-xs text-yellow-600 italic">
              Change pending...
            </span>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
              <Button size="sm" variant="danger"
                onClick={() => { setSelected(row); setShowConfirm(true) }}>
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
      <PageHeader title="Exam Groups"
        subtitle="Group exams together e.g. Mid Term 1, End Semester"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportFile()} disabled={exporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                         text-sm font-medium rounded-lg transition-colors
                         disabled:opacity-50 flex items-center gap-2">
              {exporting ? 'Exporting...' : '⬇ Export'}
            </button>
            <Button onClick={openCreate}>+ Add Exam Group</Button>
          </div>
        } />

      <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={isEdit ? 'Edit Exam Group' : 'Add Exam Group'}>
        <div className="space-y-4">
          <FormInput label="School" type="select" value={form.school}
            onChange={set('school')} options={schoolOptions}
            required error={errors.school} />
          <FormInput label="Semester" type="select" value={form.semester}
            onChange={set('semester')} options={semesterOptions}
            required error={errors.semester} />
          <FormInput label="Exam Group Name" value={form.name} onChange={set('name')}
            placeholder="e.g. Mid Term 1, End Semester"
            required error={errors.name} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Exam Group'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete} title="Delete Exam Group"
        message={`Delete "${selected?.name}"? All exams under this group will lose their grouping.`}
        confirmLabel="Delete" loading={saving} />
    </div>
  )
}
