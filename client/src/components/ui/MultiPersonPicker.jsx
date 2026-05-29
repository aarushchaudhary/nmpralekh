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
function FacultySearchInput({ person, personKey, idx, updatePerson }) {
  const [query,       setQuery]       = useState(person.name || '')
  const [results,     setResults]     = useState([])
  const [open,        setOpen]        = useState(false)
  const [searching,   setSearching]   = useState(false)
  const containerRef                  = useRef(null)
  const debouncedQ                    = useDebounce(query, 300)

  // Fetch suggestions whenever query changes
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
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
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      {/* Linked badge */}
      {person.user && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs
                         bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full
                         whitespace-nowrap pointer-events-none">
          ✓ linked
        </span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border
                        border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {searching ? (
            <div className="px-3 py-2 text-xs text-gray-400">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">No matching faculty found</div>
          ) : (
            results.map(u => (
              <button
                key={u.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(u) }}
                className="w-full flex items-center justify-between px-3 py-2
                           hover:bg-primary-50 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                  <p className="text-xs text-gray-400">{u.username}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {roleLabel[u.role] || u.role}
                </span>
              </button>
            ))
          )}
          <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
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
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={addPerson}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          + Add Person
        </button>
      </div>

      {people.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg
                        p-4 text-center text-sm text-gray-400">
          No additional people added yet.{' '}
          <button type="button" onClick={addPerson}
            className="text-primary-600 hover:underline">
            Add one
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {people.map((person, idx) => (
            <div key={idx}
              className="flex items-start gap-2 p-3 bg-gray-50
                         rounded-lg border border-gray-100">

              {/* Primary checkbox */}
              <input
                type="checkbox"
                checked={person.is_primary}
                onChange={e => updatePerson(idx, 'is_primary', e.target.checked)}
                title="Primary author/applicant"
                className="rounded shrink-0 mt-2"
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
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-200
                             rounded-lg focus:outline-none focus:ring-1
                             focus:ring-primary-500"
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
                className="px-2 py-1.5 text-sm border border-gray-200
                           rounded-lg focus:outline-none focus:ring-1
                           focus:ring-primary-500 shrink-0"
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
                  className="w-14 px-2 py-1.5 text-sm border border-gray-200
                             rounded-lg focus:outline-none focus:ring-1
                             focus:ring-primary-500 shrink-0"
                />
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removePerson(idx)}
                className="text-red-400 hover:text-red-600 text-xs shrink-0 mt-2"
              >
                ✕
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400 ml-1">
            ✓ checkbox = primary · 🔗 linked faculty will see this record on their dashboard
          </p>
        </div>
      )}
    </div>
  )
}
