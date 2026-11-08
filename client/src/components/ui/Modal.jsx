import { useEffect, useId, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    const dialogRef = useRef(null)
    const titleId = useId()

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal()
            }
        } else {
            if (dialog.open) {
                dialog.close()
            }
        }
    }, [isOpen])

    // No longer need explicit escape key listener because <dialog> handles it, 
    // but we need to call onClose to sync react state when native escape closes it.
    useEffect(() => {
        const dialog = dialogRef.current
        const handleCancel = (e) => {
            e.preventDefault()
            onClose()
        }
        if (dialog) {
            dialog.addEventListener('cancel', handleCancel)
            return () => dialog.removeEventListener('cancel', handleCancel)
        }
    }, [onClose])

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    dialogRef.current.close()
                    onClose()
                }
            }}
            className="p-4 bg-transparent backdrop:bg-black/40 fixed m-auto inset-0 z-50 w-full"
            style={{ maxWidth: 'none', border: 'none' }}
        >
            <div className={`
                relative w-full ${sizes[size]} bg-white rounded-md border border-gray-200 shadow-lg
                max-h-[90vh] flex flex-col mx-auto
            `}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5
                        border-b border-gray-200">
                    <h2 id={titleId} className="text-base font-semibold text-gray-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100
                       hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                    >
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-5 py-4">
                    {children}
                </div>
            </div>
        </dialog>
    )
}