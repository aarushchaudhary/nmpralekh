import { useState, useEffect } from 'react'
import { Link }    from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import FormInput   from '../../components/ui/FormInput'
import FormError   from '../../components/ui/FormError'
import Panel       from '../../components/ui/Panel'
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
            <Button variant="secondary">
              <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
              Export History
            </Button>
          </Link>
        }
      />

      {message && (
        <div className="mb-4 max-w-lg">
          {message.type === 'success' ? (
            <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              {message.text}
              <Link to="/master/exports"
                className="ml-2 font-medium text-primary-700 underline hover:text-primary-800">
                Go to Export History
              </Link>
            </p>
          ) : (
            <FormError message={message.text} />
          )}
        </div>
      )}

      <Panel className="max-w-lg">
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
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4
                              border-b-2 border-primary-600" />
              Export is running in background...
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            Export runs in the background. You will be notified
            when it is ready to download.
          </p>
        </div>
      </Panel>
    </div>
  )
}
