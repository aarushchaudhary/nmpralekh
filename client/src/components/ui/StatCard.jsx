export default function StatCard({ label, value, icon, accent = 'primary' }) {
    const accentStyles = {
        primary: 'bg-primary-50 text-primary-600',
        gray: 'bg-gray-100 text-gray-600',
        black: 'bg-gray-900 text-white',
        red: 'bg-red-50 text-red-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    }

    const finalAccent = accentStyles[accent] || accentStyles.primary;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                {icon && <span className={`p-2 rounded-lg ${finalAccent}`}>{icon}</span>}
            </div>
            <div className="relative z-10">
                <p className="text-3xl font-bold text-gray-900">
                    {value ?? '—'}
                </p>
            </div>
        </div>
    )
}
