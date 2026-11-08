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
    w-full px-3 py-2 text-sm border rounded-md transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-400
    ${error ? 'border-red-300' : 'border-gray-300 shadow-sm'}
  `

    return (
        <div>
            {label && (
                <label id={labelId} htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
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
                <p id={errorId} className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}
