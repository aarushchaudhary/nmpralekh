import { useState } from 'react'
import { apiErrors } from '../../api/errors'
import Modal from '../ui/Modal'
import FormInput from '../ui/FormInput'
import FormError from '../ui/FormError'
import Button from '../ui/Button'

// Re-enter your own password before a risky action. onConfirm(password) runs the
// request; if it fails (e.g. 403 "Incorrect password") the dialog stays open with the reason.
export default function ConfirmPasswordDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const close = () => { setPassword(''); setError(''); onClose() }

    const submit = async () => {
        setSaving(true)
        try {
            await onConfirm(password)
            close()
        } catch (err) {
            setError(apiErrors(err)._form || 'That did not work. Please try again.')
        } finally { setSaving(false) }
    }

    return (
        <Modal isOpen={isOpen} onClose={close} title={title} size="sm">
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit() }}>
                <p className="text-sm text-gray-700">{message}</p>
                <FormInput label="Your password" type="password" value={password}
                    onChange={e => setPassword(e.target.value)} required />
                <FormError message={error} />
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={close}>Cancel</Button>
                    <Button type="submit" loading={saving} disabled={!password}>{confirmLabel}</Button>
                </div>
            </form>
        </Modal>
    )
}
