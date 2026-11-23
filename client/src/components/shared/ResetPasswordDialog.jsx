import { useState } from 'react'
import api from '../../api/axios'
import { apiErrors } from '../../api/errors'
import Modal from '../ui/Modal'
import FormInput from '../ui/FormInput'
import FormError from '../ui/FormError'
import Button from '../ui/Button'

const empty = { temporary_password: '', confirm: '', password: '' }

// The person one level above types a one-time password for `user` (the server checks who may).
// The user must choose their own at next sign-in, and is signed out everywhere now.
// The person resetting re-enters their own password, so an unattended screen can't be used to take over an account.
export default function ResetPasswordDialog({ user, onClose }) {
    const [form, setForm] = useState(empty)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState('')
    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

    const close = () => { setForm(empty); setErrors({}); setDone(''); onClose() }

    const submit = async () => {
        if (form.temporary_password !== form.confirm) {
            setErrors({ confirm: 'The passwords do not match.' })
            return
        }
        setSaving(true)
        try {
            const res = await api.post(`/users/${user.id}/reset-password/`,
                { temporary_password: form.temporary_password, password: form.password })
            setErrors({}); setDone(res.data.detail)
        } catch (err) {
            setErrors(apiErrors(err))
        } finally { setSaving(false) }
    }

    return (
        <Modal isOpen={!!user} onClose={close} title={`Reset password — ${user?.full_name ?? ''}`} size="sm">
            {done ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-700">{done} Give them the one-time password in person or by phone.</p>
                    <div className="flex justify-end"><Button onClick={close}>Done</Button></div>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit() }}>
                    <p className="text-sm text-gray-700">
                        Type a one-time password for them. They will be signed out everywhere and must choose
                        their own password the next time they sign in.
                    </p>
                    <FormInput label="One-time password" type="password" value={form.temporary_password}
                        onChange={set('temporary_password')} required error={errors.temporary_password} />
                    <FormInput label="Confirm one-time password" type="password" value={form.confirm}
                        onChange={set('confirm')} required error={errors.confirm} />
                    <FormInput label="Your password" type="password" value={form.password}
                        onChange={set('password')} required error={errors.password} />
                    <FormError message={errors._form} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={close}>Cancel</Button>
                        <Button type="submit" loading={saving}
                            disabled={!form.temporary_password || !form.confirm || !form.password}>
                            Reset password
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
