import Modal from './Modal'
import Button from './Button'
import FormError from './FormError'

export default function ConfirmDialog({
    isOpen, onClose, onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    loading = false,
    error,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-gray-700 mb-5">{message}</p>
            {error && <div className="-mt-2 mb-4"><FormError message={error} /></div>}
            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    )
}