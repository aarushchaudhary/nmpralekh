import { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from 'react'

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    error = false,
    id,
    labelId,
    required,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const wrapperRef = useRef(null)
    const triggerRef = useRef(null)
    const inputRef = useRef(null)
    const refocusTrigger = useRef(false)
    const listId = useId()
    const optionId = i => `${listId}-opt-${i}`

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

    // Focus moves synchronously after each render, so keys typed right after
    // opening or picking are never lost to a timer gap
    useLayoutEffect(() => {
        if (open) inputRef.current?.focus()
        else if (refocusTrigger.current) triggerRef.current?.focus()
        refocusTrigger.current = false
    }, [open])

    // Keep the highlighted option visible while arrowing through a long list
    useEffect(() => {
        if (open) document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' })
    }, [open, activeIndex]) // eslint-disable-line react-hooks/exhaustive-deps

    const openList = () => {
        if (disabled) return
        const selectedIndex = options.findIndex(o => String(o.value) === String(value))
        setActiveIndex(Math.max(selectedIndex, 0))
        setQuery('')
        setOpen(true)
    }

    const closeList = ({ refocus = true } = {}) => {
        // the search input unmounts on close; put focus back on the trigger
        refocusTrigger.current = refocus
        setOpen(false)
        setQuery('')
    }

    const handleSelect = opt => {
        // Simulate native onChange shape
        onChange({ target: { value: opt.value } })
        closeList()
    }

    const handleClear = e => {
        e.stopPropagation()
        onChange({ target: { value: '' } })
        setQuery('')
    }

    const onTriggerKeyDown = e => {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault()
            openList()
        } else if ((e.key === 'Delete' || e.key === 'Backspace') && value && !disabled) {
            handleClear(e)
        }
    }

    const onInputKeyDown = e => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault()
            setActiveIndex(e.key === 'Home' ? 0 : filtered.length - 1)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered[activeIndex]) handleSelect(filtered[activeIndex])
        } else if (e.key === 'Escape') {
            e.preventDefault()
            e.stopPropagation() // don't also close a surrounding <dialog>
            closeList()
        } else if (e.key === 'Tab') {
            closeList({ refocus: false })
        }
    }

    const comboboxProps = {
        role: 'combobox',
        'aria-haspopup': 'listbox',
        'aria-expanded': open,
        'aria-controls': listId,
        'aria-labelledby': labelId,
        'aria-label': labelId ? undefined : placeholder,
        'aria-required': required || undefined,
        'aria-invalid': ariaInvalid,
        'aria-describedby': ariaDescribedBy,
    }

    const borderColor = error
        ? 'border-red-300 focus-within:ring-red-300'
        : 'border-gray-200 focus-within:ring-primary-500'

    return (
        <div ref={wrapperRef} className="relative">
            {/* Trigger / display */}
            <div
                ref={triggerRef}
                {...(open ? {} : { ...comboboxProps, id })}
                tabIndex={disabled || open ? -1 : 0}
                aria-disabled={disabled || undefined}
                onClick={openList}
                onKeyDown={open ? undefined : onTriggerKeyDown}
                className={`
                    w-full flex items-center gap-1 px-3 py-2 text-sm border rounded-lg
                    transition-colors cursor-pointer bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus-within:outline-none focus-within:ring-2 focus-within:border-transparent
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
                    ${borderColor}
                `}
            >
                {open ? (
                    <input
                        ref={inputRef}
                        {...comboboxProps}
                        id={id}
                        aria-autocomplete="list"
                        aria-activedescendant={filtered[activeIndex] ? optionId(activeIndex) : undefined}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
                        placeholder={selectedLabel || placeholder}
                        className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400"
                        onKeyDown={onInputKeyDown}
                    />
                ) : (
                    <span className={`flex-1 truncate ${!selectedLabel ? 'text-gray-400' : 'text-gray-900'}`}>
                        {selectedLabel || placeholder}
                    </span>
                )}

                {/* Clear button — keyboard users clear with Delete/Backspace on the trigger */}
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600 shrink-0 text-xs"
                        tabIndex={-1}
                        aria-label="Clear selection"
                    >
                        ✕
                    </button>
                )}

                {/* Chevron */}
                <svg
                    aria-hidden="true"
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown list */}
            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-labelledby={labelId}
                    className="
                    absolute z-50 mt-1 w-full max-h-52 overflow-auto
                    bg-white border border-gray-200 rounded-lg shadow-lg
                    py-1 text-sm
                ">
                    {filtered.length === 0 ? (
                        <li role="presentation" className="px-3 py-2 text-gray-400 text-center select-none">
                            No results found
                        </li>
                    ) : (
                        filtered.map((opt, i) => {
                            const isSelected = String(opt.value) === String(value)
                            const isActive = i === activeIndex
                            return (
                                <li
                                    key={opt.value}
                                    id={optionId(i)}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseDown={e => e.preventDefault()} // keep focus in the search input
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onClick={() => handleSelect(opt)}
                                    className={`
                                        px-3 py-2 cursor-pointer transition-colors
                                        ${isSelected ? 'text-primary-700 font-medium' : 'text-gray-700'}
                                        ${isActive ? 'bg-primary-50' : ''}
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
