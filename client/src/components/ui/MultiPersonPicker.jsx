import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'

const typeOptions = [
  { value: 'faculty', label: 'Faculty / Admin' },
  { value: 'student', label: 'Student' },
]

const emptyPerson = { name: '', author_type: 'faculty', user: null, is_primary: false, order: 1 }

// Debounce helper
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * FacultySearchInput — shown when personKey value is 'faculty'.
 * Provides a live search dropdown backed by /api/records/faculty-users/.
 */
function FacultySearchInput({ person, idx, updatePerson }) {
  const [query,       setQuery]       = useState(person.name || '')
  const [results,     setResults]     = useState([])
  const [open,        setOpen]        = useState(false)
  const [searching,   setSearching]   = useState(false)
  const containerRef                  = useRef(null)
  const debouncedQ                    = useDebounce(query, 300)

  // Fetch suggestions whenever query changes
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]); setOpen(false); return
    }
    setSearching(true)
    api.get('/records/faculty-users/', { params: { search: debouncedQ } })
      .then(res => {
        setResults(res.data || [])
        setOpen(true)
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false))
  }, [debouncedQ])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (u) => {
    setQuery(u.full_name)
    setOpen(false)
    // Update both simultaneously to prevent state overwrite
    updatePerson(idx, null, null, { name: u.full_name, user: u.id })
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (person.user) {
      updatePerson(idx, null, null, { name: val, user: null })
    } else {
      updatePerson(idx, 'name', val)
    }
  }

  const roleLabel = { user: 'Faculty', admin: 'Admin', super_admin: 'Super Admin' }

  return (
    <div className="relative flex-1" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search faculty by name..."
        aria-label="Faculty name"
        className="w-full h-9 px-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
      />

      {/* Linked badge */}
      {person.user && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium
                         bg-gray-800 text-white px-1.5 py-0.5 rounded
                         whitespace-nowrap pointer-events-none">
          Linked
        </span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border
                        border-gray-200 rounded-md shadow-lg overflow-hidden">
          {searching ? (
            <div className="px-3 py-2 text-xs text-gray-500">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">No matching faculty found</div>
          ) : (
            results.map(u => (
              <button
                key={u.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(u) }}
                className="w-full flex items-center justify-between px-3 py-2
                           hover:bg-gray-100 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                  <p className="text-xs text-gray-500">{u.username}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded">
                  {roleLabel[u.role] || u.role}
                </span>
              </button>
            ))
          )}
          <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              Or type a free-text name — it won't be linked to a registered user
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


export default function MultiPersonPicker({
  label = 'People',
  people = [],
  onChange,
  personKey = 'author_type',   // 'author_type' for publications, 'applicant_type' for patents
  showOrder = false,
}) {
  const addPerson = () => {
    onChange([...people, {
      ...emptyPerson,
      [personKey]: 'faculty',
      order: people.length + 1
    }])
  }

  const removePerson = idx => {
    onChange(people.filter((_, i) => i !== idx))
  }

  // Can update a single field (pass field/value) or multiple fields (pass updates object)
  const updatePerson = (idx, field, value, updates = null) => {
    onChange(people.map((p, i) => {
      if (i !== idx) return p
      return updates ? { ...p, ...updates } : { ...p, [field]: value }
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <button
          type="button"
          onClick={addPerson}
          className="text-xs text-primary-700 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
        >
          + Add Person
        </button>
      </div>

      {people.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-md
                        p-4 text-center text-sm text-gray-600">
          No additional people added yet.{' '}
          <button type="button" onClick={addPerson}
            className="text-primary-700 font-medium hover:underline">
            Add one
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {people.map((person, idx) => (
            <div key={idx}
              className="flex flex-wrap sm:flex-nowrap items-start gap-2 p-3 bg-gray-50
                         rounded-md border border-gray-200">

              {/* Primary checkbox */}
              <input
                type="checkbox"
                checked={person.is_primary}
                onChange={e => updatePerson(idx, 'is_primary', e.target.checked)}
                title="Primary author/applicant"
                aria-label="Primary"
                className="h-4 w-4 shrink-0 mt-2.5"
              />

              {/* Name — faculty gets a searchable input, student gets plain text */}
              {person[personKey] === 'faculty' ? (
                <FacultySearchInput
                  person={person}
                  personKey={personKey}
                  idx={idx}
                  updatePerson={updatePerson}
                />
              ) : (
                <input
                  type="text"
                  value={person.name}
                  onChange={e => updatePerson(idx, 'name', e.target.value)}
                  placeholder="Full name"
                  aria-label="Full name"
                  className="flex-1 h-9 px-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
                />
              )}

              {/* Type selector */}
              <select
                value={person[personKey]}
                onChange={e => {
                  const val = e.target.value
                  if (val !== 'faculty') {
                    updatePerson(idx, null, null, { [personKey]: val, user: null })
                  } else {
                    updatePerson(idx, personKey, val)
                  }
                }}
                aria-label="Type"
                className="h-9 px-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 shrink-0"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Order if needed */}
              {showOrder && (
                <input
                  type="number"
                  value={person.order}
                  onChange={e => updatePerson(idx, 'order', parseInt(e.target.value))}
                  placeholder="#"
                  aria-label="Order"
                  className="w-14 h-9 px-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 shrink-0"
                />
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removePerson(idx)}
                aria-label={`Remove ${person.name || 'person'}`}
                className="h-9 px-2 text-xs font-medium text-primary-700 rounded-md hover:bg-primary-50 shrink-0
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Remove
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-600">
            Tick the box to mark the primary person. Linked faculty see this record on their dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
