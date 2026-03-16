import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
    isOpen, onClose, onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    loading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    )
}