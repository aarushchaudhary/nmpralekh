const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 hover:border-primary-700',
    secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
    danger: 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:border-primary-300',
    ghost: 'text-gray-700 border border-transparent hover:bg-gray-100',
}

const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-3.5 text-sm',
    lg: 'h-10 px-4 text-sm',
}

export default function Button({
    children, variant = 'primary', size = 'md',
    disabled, loading, onClick, type = 'button', className = ''
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2 whitespace-nowrap
        font-medium rounded-md transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary} ${sizes[size]} ${className}
      `}
        >
            {loading && (
                <svg aria-hidden="true" className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            )}
            {children}
        </button>
    )
}
