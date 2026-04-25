import { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Button     from '../../components/ui/Button'
import FormInput  from '../../components/ui/FormInput'
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

  // Manual backup scope
  const [manualScope, setManualScope] = useState('full')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')

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
        setManualScope(d.backup_scope || 'full')
        setDateFrom(d.date_from || '')
        setDateTo(d.date_to || '')
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
        backup_scope: manualScope,
        date_from: manualScope === 'date_range' ? dateFrom : null,
        date_to:   manualScope === 'date_range' ? dateTo   : null,
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
      await api.post('/records/backup-manual/', {
        backup_scope: manualScope,
        date_from: manualScope === 'date_range' ? dateFrom : null,
        date_to:   manualScope === 'date_range' ? dateTo   : null,
      })
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
        <div className={`mb-4 p-3 rounded-xl text-sm
          ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* ── Automated Backup ── */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium mb-4">Automated Backup</h3>
            <div className="space-y-4">

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={autoConfig.is_active}
                  onChange={handleAutoChange}
                  className="h-4 w-4 text-indigo-600"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable Automated Backups
                </label>
              </div>

              {/* Schedule Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Type
                </label>
                <SearchableSelect
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <SearchableSelect
                    options={DAYS_OF_WEEK}
                    value={autoConfig.schedule_day}
                    onChange={e => handleAutoChange({ target: { name: 'schedule_day', value: e.target.value } })}
                    placeholder="Select day"
                  />
                  <p className="text-xs text-gray-400 mt-1">
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
          </div>

          {/* ── Manual Backup ── */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium mb-4">Manual Backup</h3>
            <div className="space-y-4">

              {/* Scope selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Scope
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="backup_scope"
                      value="full"
                      checked={manualScope === 'full'}
                      onChange={() => setManualScope('full')}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-800">
                      From Beginning (Full Backup)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="backup_scope"
                      value="date_range"
                      checked={manualScope === 'date_range'}
                      onChange={() => setManualScope('date_range')}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-800">Date Range</span>
                  </label>
                </div>
              </div>

              {/* Date range fields */}
              {manualScope === 'date_range' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <FormInput
                    label="From"
                    name="date_from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <FormInput
                    label="To"
                    name="date_to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              )}

              {/* Status */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600">Last Backup Run:</p>
                <p className="font-semibold">
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
                Creates a compressed database dump in the server's /backups directory.
              </p>
            </div>
          </div>
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
