import { Link } from 'react-router-dom'

// KPI tile. Lay several out in one ruled strip: grid gap-px bg-gray-200 border rounded-md; pass `to` to link to the module.
export default function StatCard({ label, value, to, hint }) {
    const body = (
        <>
            <p className="text-xs font-medium text-gray-600">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                {value ?? '—'}
            </p>
            {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
        </>
    )

    if (to) {
        return (
            <Link to={to}
                className="group block bg-white px-4 py-3.5 hover:bg-gray-50 transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600">
                {body}
                <span className="mt-1 block text-xs font-medium text-primary-700 group-hover:underline">View records</span>
            </Link>
        )
    }
    return <div className="bg-white px-4 py-3.5">{body}</div>
}
