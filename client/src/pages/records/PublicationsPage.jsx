import { useState, useEffect } from 'react'
import useRecords        from '../../hooks/useRecords'
import useSchools        from '../../hooks/useSchools'
import useExport         from '../../hooks/useExport'
import PageHeader        from '../../components/ui/PageHeader'
import Button            from '../../components/ui/Button'
import Table             from '../../components/ui/Table'
import Modal             from '../../components/ui/Modal'
import FormInput         from '../../components/ui/FormInput'
import Badge             from '../../components/ui/Badge'
import ConfirmDialog     from '../../components/ui/ConfirmDialog'
import MultiPersonPicker from '../../components/ui/MultiPersonPicker'
import { useAuth }       from '../../context/AuthContext'
import api               from '../../api/axios'

const authorTypeOptions = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
]

const empty = {
  school: '', author_name: '', author_type: 'faculty',
  title_of_paper: '', journal_or_conference_name: '',
  date: '', venue: '', publication: '', doi_or_link: '',
  is_own_work: true,
}

export default function PublicationsPage({ readOnly = false, selfOnly = false }) {
  const { user }                         = useAuth()
  const { data, loading, create, fetch } = useRecords('/records/publications/')
  const { schoolOptions }                = useSchools()
  const { exportFile, exporting }        = useExport('/export/publications/', 'publications.xlsx')

  const [showForm,          setShowForm]          = useState(false)
  const [showEditConfirm,   setShowEditConfirm]   = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selected,          setSelected]          = useState(null)
  const [form,              setForm]              = useState(empty)
  const [coAuthors,         setCoAuthors]         = useState([])
  const [saving,            setSaving]            = useState(false)
  const [errors,            setErrors]            = useState({})

  const set    = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const isEdit = !!selected

  // auto fill author name for faculty
  useEffect(() => {
    if (selfOnly && !isEdit) {
      setForm(f => ({ ...f, author_name: user?.full_name || '', is_own_work: true }))
    }
  }, [selfOnly, user, showForm])

  const openCreate = () => {
    setSelected(null)
    setCoAuthors([])
    setForm({
      ...empty,
      author_name: selfOnly ? (user?.full_name || '') : '',
    })
    setErrors({}); setShowForm(true)
  }

  const openEdit = async row => {
    setSelected(row)
    setForm({
      school:                     row.school,
      author_name:                row.author_name,
      author_type:                row.author_type,
      title_of_paper:             row.title_of_paper,
      journal_or_conference_name: row.journal_or_conference_name,
      date:                       row.date,
      venue:                      row.venue || '',
      publication:                row.publication || '',
      doi_or_link:                row.doi_or_link || '',
      is_own_work:                row.is_own_work,
    })
    // load existing co-authors
    const res  = await api.get(`/records/publications/${row.id}/authors/`)
    const data = res.data?.results ?? res.data
    setCoAuthors(data)
    setErrors({}); setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school)                     e.school = 'School is required'
    if (!form.author_name)                e.author_name = 'Author name is required'
    if (!form.title_of_paper)             e.title_of_paper = 'Title is required'
    if (!form.journal_or_conference_name) e.journal_or_conference_name = 'Journal/Conference is required'
    if (!form.date)                       e.date = 'Date is required'
    setErrors(e); return !Object.keys(e).length
  }

  const saveCoAuthors = async (publicationId) => {
    for (const author of coAuthors) {
      if (!author.name) continue
      if (author.id) {
        await api.put(
          `/records/publications/${publicationId}/authors/${author.id}/`,
          author
        )
      } else {
        await api.post(
          `/records/publications/${publicationId}/authors/`,
          author
        )
      }
    }
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/records/publications/${selected.id}/`, form)
        await saveCoAuthors(selected.id)
        setShowEditConfirm(false)
      } else {
        const res = await create(form)
        if (res?.id) await saveCoAuthors(res.id)
      }
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

  // for faculty selfOnly mode — they can edit their own only
  const canEdit = row => {
    if (selfOnly) return row.created_by === user?.id
    return !readOnly
  }

  const columns = [
    { key: 'school_name',  label: 'School' },
    { key: 'author_name',  label: 'Author' },
    {
      key: 'author_type', label: 'Type', sortable: false,
      render: row => <Badge label={row.author_type}
                            color={row.author_type === 'faculty' ? 'blue' : 'purple'} />
    },
    {
      key: 'title_of_paper', label: 'Title',
      render: row => (
        <div>
          <p className="max-w-xs truncate">{row.title_of_paper}</p>
          {row.authors?.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              +{row.authors.length} co-author{row.authors.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'journal_or_conference_name', label: 'Journal/Conference',
      render: row => <span className="max-w-xs truncate block">
                       {row.journal_or_conference_name}
                     </span>
    },
    { key: 'date',        label: 'Date' },
    { key: 'publication', label: 'Published In',
      render: row => row.publication || '—' },
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
      <PageHeader
        title={selfOnly ? 'My Publications' : 'Faculty Publications'}
        subtitle={selfOnly
          ? 'Your research papers and publications'
          : 'All faculty and student publications'}
        action={
          <div className="flex gap-2">
            {['super_admin', 'admin', 'user'].includes(user?.role) && (
              <button onClick={() => exportFile()} disabled={exporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                           text-sm font-medium rounded-lg transition-colors
                           disabled:opacity-50 flex items-center gap-2">
                {exporting ? 'Exporting...' : '⬇ Export'}
              </button>
            )}
            {(selfOnly || !readOnly) && (
              <Button onClick={openCreate}>+ Add Publication</Button>
            )}
          </div>
        }
      />

      {selfOnly && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            You can only view and manage your own publications.
            Add co-authors to link other faculty or students to your publication.
          </p>
        </div>
      )}

      <Table columns={columns} data={data} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={isEdit ? 'Edit Publication' : 'Add Publication'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="School" type="select" value={form.school}
              onChange={set('school')} options={schoolOptions}
              required error={errors.school} />
            <FormInput label="Date" type="date" value={form.date}
              onChange={set('date')} required error={errors.date} />
            <FormInput label="Primary Author Name" value={form.author_name}
              onChange={set('author_name')}
              placeholder="e.g. Dr. Rahul Koshti"
              disabled={selfOnly}
              required error={errors.author_name} />
            <FormInput label="Author Type" type="select" value={form.author_type}
              onChange={set('author_type')} options={authorTypeOptions} />
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
            <FormInput label="Venue" value={form.venue} onChange={set('venue')}
              placeholder="e.g. Indore, MP" />
            <FormInput label="Publication" value={form.publication}
              onChange={set('publication')} placeholder="e.g. IEEE Xplore" />
            <div className="md:col-span-2">
              <FormInput label="DOI / Link (optional)" value={form.doi_or_link}
                onChange={set('doi_or_link')} placeholder="https://..." />
            </div>
          </div>

          {/* Multi-person picker for co-authors */}
          <div className="border-t border-gray-100 pt-4">
            <MultiPersonPicker
              label="Co-Authors"
              people={coAuthors}
              onChange={setCoAuthors}
              personKey="author_type"
              showOrder
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button loading={saving}
              onClick={isEdit
                ? () => { setShowForm(false); setShowEditConfirm(true) }
                : handleSubmit}>
              {isEdit ? 'Request Update' : 'Save Record'}
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