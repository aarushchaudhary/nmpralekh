import { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Button     from '../../components/ui/Button'
import Panel      from '../../components/ui/Panel'
import FormError  from '../../components/ui/FormError'
import SearchableSelect from '../../components/ui/SearchableSelect'
import api        from '../../api/axios'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

export default function BackupSettings() {
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [message,    setMessage]    = useState(null)
  const [lastRun,    setLastRun]    = useState(null)

  // Automated backup config
  const [autoConfig, setAutoConfig] = useState({
    is_active: true,
    schedule_type: 'weekly',
    schedule_day: 6,
  })

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  useEffect(() => {
    api.get('/records/backup-config/')
      .then(res => {
        const d = res.data
        setAutoConfig({
          is_active:     d.is_active,
          schedule_type: d.schedule_type || 'weekly',
          schedule_day:  d.schedule_day ?? 6,
        })
        setLastRun(d.last_run)
      })
      .catch(() => showMessage('Failed to load backup config', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleAutoChange = (e) => {
    const { name, value, type, checked } = e.target
    setAutoConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/records/backup-config/', {
        ...autoConfig,
        schedule_day: autoConfig.schedule_type === 'weekly'
          ? Number(autoConfig.schedule_day) : null,
      })
      showMessage('Settings updated successfully')
    } catch {
      showMessage('Failed to update settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerBackup = async () => {
    setTriggering(true)
    try {
      await api.post('/records/backup-manual/', {})
      showMessage('Backup task queued successfully! Check server logs.')
    } catch {
      showMessage('Failed to queue backup', 'error')
    } finally {
      setTriggering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8
                        border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Database Backup Settings"
        subtitle="Configure automated and manual database backups"
      />

      {message && (
        <div className="mb-4">
          {message.type === 'success' ? (
            <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              {message.text}
            </p>
          ) : (
            <FormError message={message.text} />
          )}
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* ── Automated Backup ── */}
          <Panel title="Automated Backup">
            <div className="space-y-4">

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backup-auto-active"
                  name="is_active"
                  checked={autoConfig.is_active}
                  onChange={handleAutoChange}
                  className="h-4 w-4 rounded border-gray-300 accent-primary-600"
                />
                <label htmlFor="backup-auto-active" className="ml-2 block text-sm text-gray-800">
                  Enable Automated Backups
                </label>
              </div>

              {/* Schedule Type */}
              <div>
                <label id="backup-settings-1-label" className="block text-sm font-medium text-gray-800 mb-1">
                  Schedule Type
                </label>
                <SearchableSelect id="backup-settings-1" labelId="backup-settings-1-label"
                  options={[
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly (End of Month)' },
                  ]}
                  value={autoConfig.schedule_type}
                  onChange={e => handleAutoChange({ target: { name: 'schedule_type', value: e.target.value } })}
                  placeholder="Select schedule"
                />
              </div>

              {/* Day of Week — only for weekly */}
              {autoConfig.schedule_type === 'weekly' && (
                <div>
                  <label id="backup-settings-2-label" className="block text-sm font-medium text-gray-800 mb-1">
                    Day of Week
                  </label>
                  <SearchableSelect id="backup-settings-2" labelId="backup-settings-2-label"
                    options={DAYS_OF_WEEK}
                    value={autoConfig.schedule_day}
                    onChange={e => handleAutoChange({ target: { name: 'schedule_day', value: e.target.value } })}
                    placeholder="Select day"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Backup will run at the end of the selected day each week.
                  </p>
                </div>
              )}

              {autoConfig.schedule_type === 'monthly' && (
                <p className="text-xs text-gray-500">
                  Backup will automatically run on the last day of every month.
                </p>
              )}
            </div>
          </Panel>

          {/* ── Manual Backup ── */}
          <Panel title="Manual Backup">
            <div className="space-y-4">

              {/* Status */}
              <div>
                <p className="text-xs text-gray-500">Last backup run</p>
                <p className="text-sm font-semibold text-gray-800 tabular-nums">
                  {lastRun ? new Date(lastRun).toLocaleString() : 'Never'}
                </p>
              </div>

              <Button
                variant="secondary"
                type="button"
                onClick={handleTriggerBackup}
                loading={triggering}
              >
                {triggering ? 'Queuing...' : 'Trigger Manual Backup Now'}
              </Button>
              <p className="text-xs text-gray-500">
                Creates a full compressed database dump in the server's /backups directory.
              </p>
            </div>
          </Panel>
        </div>

        {/* Save button */}
        <div className="mt-6">
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
