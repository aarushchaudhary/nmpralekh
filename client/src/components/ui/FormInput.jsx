import { useId } from 'react'
import SearchableSelect from './SearchableSelect'

export default function FormInput({
    label, type = 'text', value, onChange,
    placeholder, required, error, disabled,
    options, // for select
}) {
    const id = useId()
    const labelId = `${id}-label`
    const errorId = `${id}-error`
    const a11y = {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
    }

    const baseClass = `
    w-full px-3 py-2 text-sm text-gray-900 bg-white border rounded-md transition-colors
    placeholder:text-gray-400
    focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20
    disabled:bg-gray-50 disabled:text-gray-500
    ${error ? 'border-primary-600' : 'border-gray-300'}
  `

    return (
        <div>
            {label && (
                <label id={labelId} htmlFor={id} className="block text-sm font-medium text-gray-800 mb-1">
                    {label}
                    {required && <span className="text-primary-600 ml-0.5" aria-hidden="true">*</span>}
                </label>
            )}

            {type === 'select' ? (
                <SearchableSelect
                    {...a11y}
                    labelId={label ? labelId : undefined}
                    required={required}
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder || 'Select...'}
                    disabled={disabled}
                    error={!!error}
                />
            ) : type === 'textarea' ? (
                <textarea
                    {...a11y}
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
                    {...a11y}
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
                <p id={errorId} className="text-xs text-primary-700 mt-1">{error}</p>
            )}
        </div>
    )
}
