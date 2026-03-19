import { useState } from 'react'
import Button from './Button'

const typeOptions = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
]

const emptyPerson = { name: '', author_type: 'faculty', is_primary: false, order: 1 }

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

  const updatePerson = (idx, field, value) => {
    onChange(people.map((p, i) => i === idx ? { ...p, [field]: value } : p))
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
              className="flex items-center gap-2 p-3 bg-gray-50
                         rounded-lg border border-gray-100">

              {/* Primary badge */}
              <input
                type="checkbox"
                checked={person.is_primary}
                onChange={e => updatePerson(idx, 'is_primary', e.target.checked)}
                title="Primary author/applicant"
                className="rounded shrink-0"
              />

              {/* Name */}
              <input
                type="text"
                value={person.name}
                onChange={e => updatePerson(idx, 'name', e.target.value)}
                placeholder="Full name"
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200
                           rounded-lg focus:outline-none focus:ring-1
                           focus:ring-primary-500"
              />

              {/* Type */}
              <select
                value={person[personKey]}
                onChange={e => updatePerson(idx, personKey, e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-200
                           rounded-lg focus:outline-none focus:ring-1
                           focus:ring-primary-500"
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
                             focus:ring-primary-500"
                />
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removePerson(idx)}
                className="text-red-400 hover:text-red-600 text-xs shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400 ml-1">
            ✓ checkbox = primary · people listed here are in addition to the main author field above
          </p>
        </div>
      )}
    </div>
  )
}
