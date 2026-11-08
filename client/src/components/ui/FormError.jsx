// Form-level error (not tied to one field), announced to screen readers when it appears
export default function FormError({ message }) {
    if (!message) return null
    return (
        <p role="alert" className="text-sm text-primary-800 bg-primary-50 border border-primary-200 border-l-4 border-l-primary-600 rounded-md px-3 py-2">
            {message}
        </p>
    )
}
