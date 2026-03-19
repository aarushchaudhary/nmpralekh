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

const empty = { school: '', course: '', name: '' }

export default function ClassGroupsPage() {
  const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/academics/class-groups/')
  const { schoolOptions }                = useSchools()
  const { exportFile, exporting }        = useExport('/export/academics/class-groups/', 'class_groups.xlsx')

  const [courseOptions, setCourseOptions] = useState([])
  const [showForm, setShowForm]           = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [selected, setSelected]           = useState(null)
  const [form, setForm]                   = useState(empty)
  const [saving, setSaving]               = useState(false)
  const [errors, setErrors]               = useState({})

  const set    = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const isEdit = !!selected

  useEffect(() => {
    api.get('/academics/courses/?is_active=true').then(res => {
      const data = res.data?.results ?? res.data
      setCourseOptions(data.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` })))
    })
  }, [])

  const openCreate = () => { setSelected(null); setForm(empty); setErrors({}); setShowForm(true) }
  const openEdit   = row => {
    setSelected(row)
    setForm({ school: row.school, course: row.course, name: row.name })
    setErrors({}); setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school) e.school = 'Required'
    if (!form.course) e.course = 'Required'
    if (!form.name)   e.name   = 'Required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/academics/class-groups/${selected.id}/`, form)
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
      await api.delete(`/academics/class-groups/${selected.id}/`)
      fetch(); setShowConfirm(false)
    } finally { setSaving(false) }
  }

  const columns = [
    { key: 'school_name', label: 'School' },
    { key: 'name',        label: 'Class Group',
      render: row => <span className="font-medium">{row.name}</span> },
    { key: 'course_name', label: 'Course' },
    { key: 'course_code', label: 'Code' },
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
      <PageHeader title="Class Groups" subtitle="Manage class divisions e.g. CSDS-A, CSE-B"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportFile()} disabled={exporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                         text-sm font-medium rounded-lg transition-colors
                         disabled:opacity-50 flex items-center gap-2">
              {exporting ? 'Exporting...' : '⬇ Export'}
            </button>
            <Button onClick={openCreate}>+ Add Class Group</Button>
          </div>
        } />

      <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={isEdit ? 'Edit Class Group' : 'Add Class Group'}>
        <div className="space-y-4">
          <FormInput label="School" type="select" value={form.school}
            onChange={set('school')} options={schoolOptions}
            required error={errors.school} />
          <FormInput label="Course" type="select" value={form.course}
            onChange={set('course')} options={courseOptions}
            required error={errors.course} />
          <FormInput label="Class Group Name" value={form.name} onChange={set('name')}
            placeholder="e.g. CSDS-A, CSE-B, CE-A"
            required error={errors.name} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Class Group'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={handleDeactivate} title="Deactivate Class Group"
        message={`Deactivate "${selected?.name}"?`}
        confirmLabel="Deactivate" loading={saving} />
    </div>
  )
}
