import { useState } from 'react'
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

const empty = { school: '', name: '', code: '' }

export default function CoursesPage() {
  const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/academics/courses/')
  const { schoolOptions }                = useSchools()
  const { exportFile, exporting }        = useExport('/export/academics/courses/', 'courses.xlsx')

  const [showForm, setShowForm]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(empty)
  const [saving, setSaving]           = useState(false)
  const [errors, setErrors]           = useState({})

  const set    = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const isEdit = !!selected

  const openCreate = () => {
    setSelected(null); setForm(empty); setErrors({}); setShowForm(true)
  }

  const openEdit = row => {
    setSelected(row)
    setForm({ school: row.school, name: row.name, code: row.code })
    setErrors({}); setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school) e.school = 'School is required'
    if (!form.name)   e.name   = 'Course name is required'
    if (!form.code)   e.code   = 'Course code is required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/academics/courses/${selected.id}/`, form)
        fetch()
      } else {
        await create(form)
      }
      setShowForm(false)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally { setSaving(false) }
  }

  const handleDeactivate = async () => {
    setSaving(true)
    try {
      const res = await api.delete(`/academics/courses/${selected.id}/`)
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
    { key: 'name',        label: 'Course Name' },
    { key: 'code',        label: 'Code' },
    {
      key: 'is_active', label: 'Status', sortable: false,
      render: row => <Badge label={row.is_active ? 'Active' : 'Inactive'}
                            color={row.is_active ? 'green' : 'gray'} />
    },
    {
      key: 'audit_status', label: 'Approval Status', sortable: false,
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
              <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                Edit
              </Button>
              {row.is_active && (
                <Button size="sm" variant="danger"
                  onClick={() => { setSelected(row); setShowConfirm(true) }}>
                  Deactivate
                </Button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Courses" subtitle="Manage all courses offered by your school"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportFile()} disabled={exporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                         text-sm font-medium rounded-lg transition-colors
                         disabled:opacity-50 flex items-center gap-2">
              {exporting ? 'Exporting...' : '⬇ Export'}
            </button>
            <Button onClick={openCreate}>+ Add Course</Button>
          </div>
        } />

      <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={isEdit ? 'Edit Course' : 'Add Course'}>
        <div className="space-y-4">
          <FormInput label="School" type="select" value={form.school}
            onChange={set('school')} options={schoolOptions}
            required error={errors.school} />
          <FormInput label="Course Name" value={form.name} onChange={set('name')}
            placeholder="e.g. B.Tech Computer Science"
            required error={errors.name} />
          <FormInput label="Course Code" value={form.code} onChange={set('code')}
            placeholder="e.g. BTECH-CS"
            required error={errors.code} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={handleDeactivate} title="Deactivate Course"
        message={`Deactivate "${selected?.name}"? This will hide it from all dropdowns.`}
        confirmLabel="Deactivate" loading={saving} />
    </div>
  )
}
