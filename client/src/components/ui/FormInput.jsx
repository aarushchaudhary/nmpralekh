import SearchableSelect from './SearchableSelect'

export default function FormInput({
    label, type = 'text', value, onChange,
    placeholder, required, error, disabled,
    options, // for select
}) {
    const baseClass = `
    w-full px-3 py-2 text-sm border rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-400
    ${error ? 'border-red-300' : 'border-gray-200'}
  `

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            {type === 'select' ? (
                <SearchableSelect
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder || 'Select...'}
                    disabled={disabled}
                    error={!!error}
                />
            ) : type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    rows={3}
                    className={baseClass}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={baseClass}
                />
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}