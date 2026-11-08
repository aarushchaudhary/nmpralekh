// Brand palette only: status is carried by the label text, the style just groups it
// (dark = done/approved, outline = pending, red = rejected/failed, gray = neutral)
const styles = {
    dark: 'bg-gray-800 text-white border-gray-800',
    outline: 'bg-white text-gray-700 border-gray-400',
    red: 'bg-primary-50 text-primary-700 border-primary-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function Badge({ label, color = 'gray' }) {
    const style = styles[color] || styles.gray
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${style}`}>
            {label}
        </span>
    )
}
