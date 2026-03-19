import { useState, useEffect } from 'react'
import useRecords  from '../../hooks/useRecords'
import useExport   from '../../hooks/useExport'
import useSchools  from '../../hooks/useSchools'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import Table       from '../../components/ui/Table'
import Modal       from '../../components/ui/Modal'
import FormInput   from '../../components/ui/FormInput'
import Badge       from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api         from '../../api/axios'

const empty = { school: '', semester: '', name: '', code: '' }

export default function SubjectsPage() {
  const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/academics/subjects/')
  const { schoolOptions }                = useSchools()
  const { exportFile, exporting }        = useExport('/export/academics/subjects/', 'subjects.xlsx')

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
        label: `${s.academic_year_detail?.course_code} — Year ${s.academic_year_detail?.year_number} Sem ${s.semester_number} (${s.academic_year_detail?.graduation_year})`
      })))
    })
  }, [])

  const openCreate = () => { setSelected(null); setForm(empty); setErrors({}); setShowForm(true) }
  const openEdit   = row => {
    setSelected(row)
    setForm({ school: row.school, semester: row.semester, name: row.name, code: row.code })
    setErrors({}); setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school)   e.school   = 'Required'
    if (!form.semester) e.semester = 'Required'
    if (!form.name)     e.name     = 'Required'
    if (!form.code)     e.code     = 'Required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/academics/subjects/${selected.id}/`, form)
        fetch()
      } else { await create(form) }
      setShowForm(false)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally { setSaving(false) }
  }

  const handleDeactivate = async () => {
    setSaving(true)
    try {
      await api.delete(`/academics/subjects/${selected.id}/`)
      fetch(); setShowConfirm(false)
    } finally { setSaving(false) }
  }

  const columns = [
    { key: 'school_name',    label: 'School' },
    { key: 'name',           label: 'Subject Name' },
    { key: 'code',           label: 'Code' },
    {
      key: 'semester_detail', label: 'Semester',
      render: row => row.semester_detail
        ? `${row.semester_detail.course_code} Y${row.semester_detail.year_number} S${row.semester_detail.semester_number}`
        : '—'
    },
    {
      key: 'is_active', label: 'Status', sortable: false,
      render: row => <Badge label={row.is_active ? 'Active' : 'Inactive'}
                            color={row.is_active ? 'green' : 'gray'} />
    },
    {
      key: 'actions', label: '', sortable: false,
      render: row => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          {row.is_active && (
            <Button size="sm" variant="danger"
              onClick={() => { setSelected(row); setShowConfirm(true) }}>
              Deactivate
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Subjects" subtitle="Manage subjects for each semester"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportFile()} disabled={exporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                         text-sm font-medium rounded-lg transition-colors
                         disabled:opacity-50 flex items-center gap-2">
              {exporting ? 'Exporting...' : '⬇ Export'}
            </button>
            <Button onClick={openCreate}>+ Add Subject</Button>
          </div>
        } />

      <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={isEdit ? 'Edit Subject' : 'Add Subject'}>
        <div className="space-y-4">
          <FormInput label="School" type="select" value={form.school}
            onChange={set('school')} options={schoolOptions}
            required error={errors.school} />
          <FormInput label="Semester" type="select" value={form.semester}
            onChange={set('semester')} options={semesterOptions}
            required error={errors.semester} />
          <FormInput label="Subject Name" value={form.name} onChange={set('name')}
            placeholder="e.g. Data Structures" required error={errors.name} />
          <FormInput label="Subject Code" value={form.code} onChange={set('code')}
            placeholder="e.g. CS101" required error={errors.code} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {isEdit ? 'Save Changes' : 'Add Subject'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={handleDeactivate} title="Deactivate Subject"
        message={`Deactivate "${selected?.name}"?`}
        confirmLabel="Deactivate" loading={saving} />
    </div>
  )
}
