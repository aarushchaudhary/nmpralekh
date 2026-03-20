import { useState, useEffect } from 'react'
import { Link }    from 'react-router-dom'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import FormInput   from '../../components/ui/FormInput'
import api         from '../../api/axios'

export default function ManualExport() {
  const [campusOptions, setCampusOptions] = useState([])
  const [form,      setForm]      = useState({
    campus_id: '', date_from: '', date_to: ''
  })
  const [triggering, setTriggering] = useState(false)
  const [taskId,     setTaskId]     = useState(null)
  const [status,     setStatus]     = useState(null)
  const [message,    setMessage]    = useState(null)

  useEffect(() => {
    api.get('/schools/campuses/').then(res => {
      const data = res.data?.results ?? res.data
      setCampusOptions([
        { value: '', label: 'All Campuses' },
        ...data
          .filter(c => c.is_active)
          .map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))
      ])
    })
  }, [])

  // poll for task status
  useEffect(() => {
    if (!taskId) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/export/status/${taskId}/`)
        setStatus(res.data.status)
        if (res.data.status === 'completed') {
          clearInterval(interval)
          setMessage({
            type: 'success',
            text: `Export completed. Go to Export History to download.`
          })
          setTaskId(null)
        } else if (res.data.status === 'failed') {
          clearInterval(interval)
          setMessage({ type: 'error', text: 'Export failed.' })
          setTaskId(null)
        }
      } catch {
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [taskId])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleExport = async () => {
    setTriggering(true)
    setMessage(null)
    setStatus(null)
    try {
      const res = await api.post('/export/manual/', form)
      setTaskId(res.data.task_id)
      setStatus('processing')
    } catch {
      setMessage({ type: 'error', text: 'Failed to start export.' })
    } finally {
      setTriggering(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Manual Export"
        subtitle="Generate an on-demand export for any campus and date range"
        action={
          <Link to="/master/exports">
            <Button variant="secondary">← Export History</Button>
          </Link>
        }
      />

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm
          ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
          {message.text}
          {message.type === 'success' && (
            <Link to="/master/exports"
              className="ml-2 underline font-medium">
              Go to Export History
            </Link>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100
                      p-6 max-w-lg">
        <div className="space-y-4">
          <FormInput
            label="Campus"
            type="select"
            value={form.campus_id}
            onChange={set('campus_id')}
            options={campusOptions}
          />
          <FormInput
            label="Date From (optional)"
            type="date"
            value={form.date_from}
            onChange={set('date_from')}
          />
          <FormInput
            label="Date To (optional)"
            type="date"
            value={form.date_to}
            onChange={set('date_to')}
          />

          <Button
            onClick={handleExport}
            loading={triggering}
            className="w-full"
          >
            Generate Export
          </Button>

          {status === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4
                              border-b-2 border-primary-600" />
              Export is running in background...
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Export runs in the background. You will be notified
            when it is ready to download.
          </p>
        </div>
      </div>
    </div>
  )
}
