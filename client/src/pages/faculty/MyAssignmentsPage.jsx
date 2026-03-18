import { useState, useEffect } from 'react'
import useSchools  from '../../hooks/useSchools'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import Badge       from '../../components/ui/Badge'
import Modal       from '../../components/ui/Modal'
import FormInput   from '../../components/ui/FormInput'
import api         from '../../api/axios'

const statusColor = { pending: 'yellow', approved: 'green', rejected: 'red' }

const empty = { school: '', subject: '', class_group: '', semester: '' }

export default function MyAssignmentsPage() {
  const { schoolOptions }   = useSchools()

  const [assignments,       setAssignments]       = useState([])
  const [loading,           setLoading]           = useState(true)
  const [showForm,          setShowForm]          = useState(false)
  const [form,              setForm]              = useState(empty)
  const [saving,            setSaving]            = useState(false)
  const [errors,            setErrors]            = useState({})

  const [semesterOptions,   setSemesterOptions]   = useState([])
  const [subjectOptions,    setSubjectOptions]    = useState([])
  const [classGroupOptions, setClassGroupOptions] = useState([])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const fetchAssignments = () => {
    setLoading(true)
    api.get('/academics/assignments/').then(res => {
      setAssignments(res.data?.results ?? res.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAssignments() }, [])

  // load semesters when school selected
  useEffect(() => {
    if (!form.school) return
    api.get(`/academics/semesters/?school_id=${form.school}`).then(res => {
      const data = res.data?.results ?? res.data
      setSemesterOptions(data.map(s => ({
        value: s.id,
        label: `${s.academic_year_detail?.course_code} Y${s.academic_year_detail?.year_number} S${s.semester_number}`
      })))
    })
  }, [form.school])

  // load subjects and class groups when semester selected
  useEffect(() => {
    if (!form.semester) return
    api.get(`/academics/subjects/?semester_id=${form.semester}&is_active=true`).then(res => {
      const data = res.data?.results ?? res.data
      setSubjectOptions(data.map(s => ({ value: s.id, label: `${s.code} — ${s.name}` })))
    })
    api.get(`/academics/class-groups/?is_active=true&school_id=${form.school}`).then(res => {
      const data = res.data?.results ?? res.data
      setClassGroupOptions(data.map(g => ({ value: g.id, label: g.name })))
    })
  }, [form.semester])

  const validate = () => {
    const e = {}
    if (!form.school)      e.school      = 'Required'
    if (!form.semester)    e.semester    = 'Required'
    if (!form.subject)     e.subject     = 'Required'
    if (!form.class_group) e.class_group = 'Required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await api.post('/academics/assignments/', form)
      setShowForm(false); setForm(empty); fetchAssignments()
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await api.delete(`/academics/assignments/${id}/`)
    fetchAssignments()
  }

  return (
    <div>
      <PageHeader
        title="My Teaching Assignments"
        subtitle="Select the subjects and class groups you teach. Requires admin approval."
        action={<Button onClick={() => { setForm(empty); setErrors({}); setShowForm(true) }}>
          + Add Assignment
        </Button>}
      />

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          Add the subjects and class groups you are currently teaching.
          Each request needs admin approval before you can create exams for it.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No teaching assignments yet. Add your subjects to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id}
              className="bg-white rounded-xl border border-gray-100 p-5
                         flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800">
                    {a.subject_name}
                  </span>
                  <span className="text-xs text-gray-400">{a.subject_code}</span>
                  <Badge label={a.status} color={statusColor[a.status]} />
                </div>
                <p className="text-xs text-gray-500">
                  {a.class_group_name} ·{' '}
                  {a.semester_detail?.course_code}{' '}
                  Y{a.semester_detail?.year_number}{' '}
                  S{a.semester_detail?.semester_number} ·{' '}
                  {a.school_name}
                </p>
                {a.status === 'rejected' && a.notes && (
                  <p className="text-xs text-red-500 mt-1">
                    Reason: {a.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {a.status === 'pending' && (
                  <span className="text-xs text-yellow-600">Awaiting approval</span>
                )}
                {a.status !== 'approved' && (
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title="Add Teaching Assignment">
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            This request will be sent to your admin for approval.
          </div>
          <FormInput label="School" type="select" value={form.school}
            onChange={set('school')} options={schoolOptions}
            required error={errors.school} />
          <FormInput label="Semester" type="select" value={form.semester}
            onChange={set('semester')} options={semesterOptions}
            disabled={!form.school} required error={errors.semester} />
          <FormInput label="Subject" type="select" value={form.subject}
            onChange={set('subject')} options={subjectOptions}
            disabled={!form.semester} required error={errors.subject} />
          <FormInput label="Class Group" type="select" value={form.class_group}
            onChange={set('class_group')} options={classGroupOptions}
            disabled={!form.semester} required error={errors.class_group} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              Submit for Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
