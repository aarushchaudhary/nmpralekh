// Boxed page section with an optional header row
export default function Panel({ title, description, action, children, padded = true, className = '' }) {
    return (
        <section className={`bg-white border border-gray-200 rounded-md ${className}`}>
            {(title || action) && (
                <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
                    <div className="min-w-0">
                        {title && <h2 className="text-sm font-semibold text-gray-900">{title}</h2>}
                        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
                    </div>
                    {action && <div className="flex-shrink-0">{action}</div>}
                </header>
            )}
            <div className={padded ? 'p-4' : ''}>{children}</div>
        </section>
    )
}
