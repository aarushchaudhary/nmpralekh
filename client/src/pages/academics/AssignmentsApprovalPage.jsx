import { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Button     from '../../components/ui/Button'
import Badge      from '../../components/ui/Badge'
import Modal      from '../../components/ui/Modal'
import FormInput  from '../../components/ui/FormInput'
import api        from '../../api/axios'

const statusColor = { pending: 'yellow', approved: 'green', rejected: 'red' }

const tabs = ['all', 'pending', 'approved', 'rejected']

export default function AssignmentsApprovalPage() {
  const [assignments, setAssignments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('pending')
  const [showModal,   setShowModal]   = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [action,      setAction]      = useState(null)
  const [notes,       setNotes]       = useState('')
  const [saving,      setSaving]      = useState(false)

  const fetchAssignments = () => {
    setLoading(true)
    const params = tab !== 'all' ? `?status=${tab}` : ''
    api.get(`/academics/assignments/${params}`).then(res => {
      setAssignments(res.data?.results ?? res.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAssignments() }, [tab])

  const openAction = (assignment, actionType) => {
    setSelected(assignment)
    setAction(actionType)
    setNotes('')
    setShowModal(true)
  }

  const handleAction = async () => {
    setSaving(true)
    try {
      await api.post(
        `/academics/assignments/${selected.id}/${action}/`,
        { notes }
      )
      setShowModal(false)
      fetchAssignments()
    } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Faculty Teaching Assignments"
        subtitle="Review and approve assignment requests from faculty"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize
                        transition-colors
                        ${tab === t
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8
                          border-b-2 border-primary-600" />
        </div>
      ) : assignments.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          No {tab === 'all' ? '' : tab} assignments
        </p>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id}
              className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {a.faculty_name}
                    </span>
                    <Badge label={a.status} color={statusColor[a.status]} />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{a.subject_name}</span>
                    {' '}({a.subject_code}) ·{' '}
                    <span className="font-medium">{a.class_group_name}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {a.semester_detail?.course_name} ·{' '}
                    Year {a.semester_detail?.year_number} ·{' '}
                    Sem {a.semester_detail?.semester_number} ·{' '}
                    {a.school_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Requested {a.requested_at?.slice(0, 10)}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Note: {a.notes}
                    </p>
                  )}
                </div>
                {a.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="danger"
                      onClick={() => openAction(a, 'reject')}>
                      Reject
                    </Button>
                    <Button size="sm"
                      onClick={() => openAction(a, 'approve')}>
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={action === 'approve' ? 'Approve Assignment' : 'Reject Assignment'}
        size="sm">
        <div className="space-y-4">
          {selected && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium">{selected.faculty_name}</p>
              <p>{selected.subject_name} · {selected.class_group_name}</p>
            </div>
          )}
          <FormInput
            label="Notes (optional)"
            type="textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={action === 'reject'
              ? 'Reason for rejection...'
              : 'Any notes for the faculty...'}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'primary' : 'danger'}
              onClick={handleAction}
              loading={saving}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
