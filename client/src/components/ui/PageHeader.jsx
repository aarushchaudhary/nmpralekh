export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div className="min-w-0">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                )}
            </div>
            {action && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
    )
}
