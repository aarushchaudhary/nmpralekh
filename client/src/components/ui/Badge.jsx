const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-50 text-purple-700',
    teal: 'bg-teal-50 text-teal-700',
}

export default function Badge({ label, color = 'gray' }) {
    return (
        <span className={`
      inline-block px-2 py-0.5 rounded-full text-xs font-medium
      ${colors[color]}
    `}>
            {label}
        </span>
    )
}