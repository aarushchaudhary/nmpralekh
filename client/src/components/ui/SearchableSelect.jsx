import { useState, useRef, useEffect, useMemo } from 'react'

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    error = false,
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const wrapperRef = useRef(null)
    const inputRef = useRef(null)

    // Derive current label from value
    const selectedLabel = useMemo(() => {
        const match = options.find(o => String(o.value) === String(value))
        return match?.label || ''
    }, [options, value])

    // Filtered options
    const filtered = useMemo(() => {
        if (!query) return options
        const q = query.toLowerCase()
        return options.filter(o => o.label.toLowerCase().includes(q))
    }, [options, query])

    // Close on click outside
    useEffect(() => {
        const handler = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = opt => {
        // Simulate native onChange shape
        onChange({ target: { value: opt.value } })
        setOpen(false)
        setQuery('')
    }

    const handleInputClick = () => {
        if (disabled) return
        setOpen(true)
        setQuery('')
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    const handleClear = e => {
        e.stopPropagation()
        onChange({ target: { value: '' } })
        setQuery('')
    }

    const borderColor = error
        ? 'border-red-300 focus-within:ring-red-300'
        : 'border-gray-200 focus-within:ring-primary-500'

    return (
        <div ref={wrapperRef} className="relative">
            {/* Trigger / display */}
            <div
                onClick={handleInputClick}
                className={`
                    w-full flex items-center gap-1 px-3 py-2 text-sm border rounded-lg
                    transition-colors cursor-pointer bg-white
                    focus-within:outline-none focus-within:ring-2 focus-within:border-transparent
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
                    ${borderColor}
                `}
            >
                {open ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={selectedLabel || placeholder}
                        className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400"
                        onKeyDown={e => {
                            if (e.key === 'Escape') {
                                setOpen(false)
                                setQuery('')
                            }
                            if (e.key === 'Enter' && filtered.length === 1) {
                                handleSelect(filtered[0])
                            }
                        }}
                    />
                ) : (
                    <span className={`flex-1 truncate ${!selectedLabel ? 'text-gray-400' : 'text-gray-900'}`}>
                        {selectedLabel || placeholder}
                    </span>
                )}

                {/* Clear button */}
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600 shrink-0 text-xs"
                        tabIndex={-1}
                    >
                        ✕
                    </button>
                )}

                {/* Chevron */}
                <svg
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown list */}
            {open && (
                <ul className="
                    absolute z-50 mt-1 w-full max-h-52 overflow-auto
                    bg-white border border-gray-200 rounded-lg shadow-lg
                    py-1 text-sm
                ">
                    {filtered.length === 0 ? (
                        <li className="px-3 py-2 text-gray-400 text-center select-none">
                            No results found
                        </li>
                    ) : (
                        filtered.map(opt => {
                            const isActive = String(opt.value) === String(value)
                            return (
                                <li
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`
                                        px-3 py-2 cursor-pointer transition-colors
                                        ${isActive
                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }
                                    `}
                                >
                                    {opt.label}
                                </li>
                            )
                        })
                    )}
                </ul>
            )}
        </div>
    )
}
