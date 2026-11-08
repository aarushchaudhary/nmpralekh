export default function EmptyState({ message = 'No records found' }) {
    return (
        <div className="py-12 text-center border border-dashed border-gray-300 rounded-md bg-white">
            <p className="text-sm text-gray-600">{message}</p>
        </div>
    )
}
