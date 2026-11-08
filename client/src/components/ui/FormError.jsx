// Form-level error (not tied to one field), announced to screen readers when it appears
export default function FormError({ message }) {
    if (!message) return null
    return (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {message}
        </p>
    )
}
