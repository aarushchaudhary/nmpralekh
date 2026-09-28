import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    const dialogRef = useRef(null)

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
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    dialogRef.current.close()
                    onClose()
                }
            }}
            className="p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-30 fixed m-auto inset-0 z-50 rounded-2xl shadow-xl w-full"
            style={{ maxWidth: 'none', border: 'none' }}
        >
            <div className={`
                relative w-full ${sizes[size]} bg-white rounded-2xl shadow-xl
                max-h-[90vh] flex flex-col mx-auto
            `}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4
                        border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100
                       hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {children}
                </div>
            </div>
        </dialog>
    )
}