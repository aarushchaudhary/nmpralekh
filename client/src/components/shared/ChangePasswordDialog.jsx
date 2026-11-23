import { useState } from 'react'
import api from '../../api/axios'
import { apiErrors } from '../../api/errors'
import Modal from '../ui/Modal'
import FormInput from '../ui/FormInput'
import FormError from '../ui/FormError'
import Button from '../ui/Button'

const empty = { current_password: '', new_password: '', confirm: '' }

// Signed-in user changes their own password; the server signs out their other devices.
// forced: after a reset by the person above — can't be dismissed until a new password is saved.
export default function ChangePasswordDialog({ isOpen, onClose, onChanged, forced = false }) {
    const [form, setForm] = useState(empty)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

    const close = () => { setForm(empty); setErrors({}); setDone(false); onClose() }

    const submit = async () => {
        if (form.new_password !== form.confirm) {
            setErrors({ confirm: 'The new passwords do not match.' })
            return
        }
        setSaving(true)
        try {
            await api.post('/auth/change-password/', {
                current_password: form.current_password, new_password: form.new_password,
            })
            setErrors({})
            if (forced) { setForm(empty); onChanged?.(); return }
            setDone(true)
            onChanged?.()
        } catch (err) {
            setErrors(apiErrors(err))
        } finally { setSaving(false) }
    }

    return (
        <Modal isOpen={isOpen} onClose={forced ? () => {} : close} dismissible={!forced}
            title={forced ? 'Choose a new password' : 'Change password'} size="sm">
            {done ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                        Your password has been changed. Any other devices signed in to your account have been signed out.
                    </p>
                    <div className="flex justify-end"><Button onClick={close}>Done</Button></div>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit() }}>
                    {forced && <p className="text-sm text-gray-700">
                        Your password was reset. Enter the one-time password you were given, then choose your own.
                    </p>}
                    <FormInput label={forced ? 'One-time password' : 'Current password'} type="password" value={form.current_password}
                        onChange={set('current_password')} required error={errors.current_password} />
                    <FormInput label="New password" type="password" value={form.new_password}
                        onChange={set('new_password')} required error={errors.new_password} />
                    <FormInput label="Confirm new password" type="password" value={form.confirm}
                        onChange={set('confirm')} required error={errors.confirm} />
                    <p className="text-xs text-gray-500">
                        At least 8 characters, not only numbers, not a common password, and not like your name or username.
                    </p>
                    <FormError message={errors._form} />
                    <div className="flex justify-end gap-3 pt-2">
                        {!forced && <Button variant="secondary" onClick={close}>Cancel</Button>}
                        <Button type="submit" loading={saving}
                            disabled={!form.current_password || !form.new_password || !form.confirm}>
                            Change password
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
