import { useState } from 'react'
import useRecords  from '../../hooks/useRecords'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import Table       from '../../components/ui/Table'
import Modal       from '../../components/ui/Modal'
import FormInput   from '../../components/ui/FormInput'
import Badge       from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api         from '../../api/axios'

const empty = { name: '', code: '', city: '' }

export default function Campuses() {
  const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/schools/campuses/')

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
    setForm({ name: row.name, code: row.code, city: row.city })
    setErrors({}); setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Campus name is required'
    if (!form.code) e.code = 'Campus code is required'
    if (!form.city) e.city = 'City is required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/schools/campuses/${selected.id}/`, form)
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
      await api.delete(`/schools/campuses/${selected.id}/`)
      fetch(); setShowConfirm(false)
    } finally { setSaving(false) }
  }

  const columns = [
    { key: 'name',  label: 'Campus Name',
      render: row => <span className="font-medium">{row.name}</span> },
    { key: 'code',  label: 'Code' },
    { key: 'city',  label: 'City' },
    { key: 'school_count', label: 'Schools' },
    { key: 'user_count',   label: 'Users' },
    {
      key: 'is_active', label: 'Status', sortable: false,
      render: row => <Badge label={row.is_active ? 'Active' : 'Inactive'}
                            color={row.is_active ? 'green' : 'gray'} />
    },
    {
      key: 'actions', label: '', sortable: false,
      render: row => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
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
      <PageHeader
        title="Campuses"
        subtitle="Manage all 9 NMIMS campuses"
        action={<Button onClick={openCreate}>+ Add Campus</Button>}
      />

      <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={isEdit ? 'Edit Campus' : 'Add Campus'}>
        <div className="space-y-4">
          <FormInput label="Campus Name" value={form.name} onChange={set('name')}
            placeholder="e.g. NMIMS Hyderabad"
            required error={errors.name} />
          <FormInput label="Campus Code" value={form.code} onChange={set('code')}
            placeholder="e.g. HYD"
            required error={errors.code} />
          <FormInput label="City" value={form.city} onChange={set('city')}
            placeholder="e.g. Hyderabad"
            required error={errors.city} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Campus'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={handleDeactivate} title="Deactivate Campus"
        message={`Deactivate "${selected?.name}"? All schools and users under this campus will lose access.`}
        confirmLabel="Deactivate" loading={saving} />
    </div>
  )
}
