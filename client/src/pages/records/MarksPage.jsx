import { useState, useEffect } from 'react'
import useSchools from '../../hooks/useSchools'
import useExport from '../../hooks/useExport'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import FormInput from '../../components/ui/FormInput'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'

const emptyMark = {
    student_name: '', roll_number: '',
    marks_obtained: '', max_marks: '', is_absent: false
}

export default function MarksPage() {
    const { schoolOptions } = useSchools()
    const { exportFile, exporting } = useExport('/export/academics/marks/', 'student_marks.xlsx')

    // Step selectors
    const [selectedSchool, setSelectedSchool] = useState('')
    const [examGroupOptions, setExamGroupOptions] = useState([])
    const [selectedExamGroup, setSelectedExamGroup] = useState('')
    const [subjectOptions, setSubjectOptions] = useState([])
    const [selectedSubject, setSelectedSubject] = useState('')
    const [classGroupOptions, setClassGroupOptions] = useState([])
    const [selectedClassGroup, setSelectedClassGroup] = useState('')
    const [examOptions, setExamOptions] = useState([])
    const [selectedExam, setSelectedExam] = useState('')

    // Marks state
    const [existingMarks, setExistingMarks] = useState([])
    const [marks, setMarks] = useState([{ ...emptyMark }])
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [errors, setErrors] = useState({})
    const [step, setStep] = useState(1)

    // Step 1 — load exam groups when school selected
    useEffect(() => {
        if (!selectedSchool) return
        setSelectedExamGroup(''); setSelectedSubject('')
        setSelectedClassGroup(''); setSelectedExam('')
        api.get(`/academics/exam-groups/?school_id=${selectedSchool}`).then(res => {
            const data = res.data?.results ?? res.data
            setExamGroupOptions(data.map(g => ({ value: g.id, label: g.name })))
        })
    }, [selectedSchool])

    // Step 2 — load subjects when exam group selected
    useEffect(() => {
        if (!selectedExamGroup) return
        setSelectedSubject(''); setSelectedClassGroup('')
        api.get(`/academics/subjects/?is_active=true&school_id=${selectedSchool}`).then(res => {
            const data = res.data?.results ?? res.data
            setSubjectOptions(data.map(s => ({
                value: s.id,
                label: `${s.code} — ${s.name}`
            })))
        })
    }, [selectedExamGroup])

    // Step 3 — load class groups when subject selected
    useEffect(() => {
        if (!selectedSubject) return
        setSelectedClassGroup('')
        api.get(`/academics/class-groups/?is_active=true&school_id=${selectedSchool}`).then(res => {
            const data = res.data?.results ?? res.data
            setClassGroupOptions(data.map(g => ({ value: g.id, label: g.name })))
        })
    }, [selectedSubject])

    // Step 4 — find the exam record when all 3 selected
    useEffect(() => {
        if (!selectedExamGroup || !selectedSubject || !selectedClassGroup) return
        api.get('/records/exams/', {
            params: {
                exam_group: selectedExamGroup,
                subject: selectedSubject,
                class_group: selectedClassGroup,
            }
        }).then(res => {
            const data = res.data?.results ?? res.data
            if (data.length > 0) {
                setExamOptions(data.map(e => ({
                    value: e.id,
                    label: `${e.exam_group_name} — ${e.subject_name} — ${e.class_group_name} (${e.date})`
                })))
            } else {
                setExamOptions([])
            }
        })
    }, [selectedExamGroup, selectedSubject, selectedClassGroup])

    // Load existing marks when exam selected
    useEffect(() => {
        if (!selectedExam) return
        api.get(`/records/marks/?exam_id=${selectedExam}`).then(res => {
            const data = res.data?.results ?? res.data
            setExistingMarks(data)
            if (data.length > 0) {
                setMarks(data.map(m => ({
                    id: m.id,
                    student_name: m.student_name,
                    roll_number: m.roll_number,
                    marks_obtained: m.marks_obtained,
                    max_marks: m.max_marks,
                    is_absent: m.is_absent,
                })))
            } else {
                setMarks([{ ...emptyMark }])
            }
        })
    }, [selectedExam])

    const addRow = () => setMarks(m => [...m, { ...emptyMark }])

    const removeRow = idx => setMarks(m => m.filter((_, i) => i !== idx))

    const updateMark = (idx, field, value) => {
        setMarks(m => m.map((row, i) =>
            i === idx ? { ...row, [field]: value } : row
        ))
    }

    const validateMarks = () => {
        const e = {}
        marks.forEach((m, i) => {
            if (!m.student_name) e[`name_${i}`] = 'Required'
            if (!m.roll_number) e[`roll_${i}`] = 'Required'
            if (!m.is_absent && m.marks_obtained === '')
                e[`marks_${i}`] = 'Required'
        })
        setErrors(e); return !Object.keys(e).length
    }

    const handleSave = async () => {
        if (!selectedExam) return
        if (!validateMarks()) return

        setSaving(true)
        try {
            // save each mark row
            for (const mark of marks) {
                const payload = {
                    exam: selectedExam,
                    student_name: mark.student_name,
                    roll_number: mark.roll_number,
                    marks_obtained: mark.is_absent ? 0 : mark.marks_obtained,
                    max_marks: mark.max_marks || 100,
                    is_absent: mark.is_absent,
                }
                if (mark.id) {
                    await api.put(`/records/marks/${mark.id}/`, payload)
                } else {
                    await api.post('/records/marks/', payload)
                }
            }
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
            // reload existing marks
            const res = await api.get(`/records/marks/?exam_id=${selectedExam}`)
            const data = res.data?.results ?? res.data
            setExistingMarks(data)
            setMarks(data.map(m => ({
                id: m.id, student_name: m.student_name,
                roll_number: m.roll_number, marks_obtained: m.marks_obtained,
                max_marks: m.max_marks, is_absent: m.is_absent,
            })))
        } catch (err) {
            console.error(err)
        } finally { setSaving(false) }
    }

    const canProceed = selectedSchool && selectedExamGroup &&
        selectedSubject && selectedClassGroup

    return (
        <div>
            <PageHeader
                title="Student Marks"
                subtitle="Enter or update examination marks for students"
                action={
                    <button onClick={() => exportFile()} disabled={exporting}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                                   text-sm font-medium rounded-lg transition-colors
                                   disabled:opacity-50 flex items-center gap-2">
                        {exporting ? 'Exporting...' : '⬇ Export Marks'}
                    </button>
                }
            />

            {/* Step selector */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Select Exam
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="School" type="select"
                        value={selectedSchool}
                        onChange={e => setSelectedSchool(e.target.value)}
                        options={schoolOptions} />

                    <FormInput label="Exam Group" type="select"
                        value={selectedExamGroup}
                        onChange={e => setSelectedExamGroup(e.target.value)}
                        options={examGroupOptions}
                        disabled={!selectedSchool} />

                    <FormInput label="Subject" type="select"
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        options={subjectOptions}
                        disabled={!selectedExamGroup} />

                    <FormInput label="Class Group" type="select"
                        value={selectedClassGroup}
                        onChange={e => setSelectedClassGroup(e.target.value)}
                        options={classGroupOptions}
                        disabled={!selectedSubject} />

                    {examOptions.length > 0 && (
                        <div className="md:col-span-2">
                            <FormInput label="Select Exam Record" type="select"
                                value={selectedExam}
                                onChange={e => setSelectedExam(e.target.value)}
                                options={examOptions} />
                        </div>
                    )}

                    {canProceed && examOptions.length === 0 && (
                        <div className="md:col-span-2">
                            <div className="p-3 bg-yellow-50 border border-yellow-200
                              rounded-lg text-sm text-yellow-700">
                                No exam record found for this combination. Please create
                                the exam first from the Exams Conducted page.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Marks entry table */}
            {selectedExam && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4
                          border-b border-gray-100">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700">
                                Enter Marks
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {existingMarks.length > 0
                                    ? `${existingMarks.length} existing records — editing`
                                    : 'No records yet — adding new'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {saved && (
                                <span className="text-sm text-green-600 font-medium">
                                    ✓ Saved
                                </span>
                            )}
                            <Button variant="secondary" size="sm" onClick={addRow}>
                                + Add Row
                            </Button>
                            <Button onClick={handleSave} loading={saving}>
                                Save All Marks
                            </Button>
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['#', 'Student Name', 'Roll Number',
                                        'Max Marks', 'Marks Obtained', 'Absent', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs
                                           font-medium text-gray-500 uppercase">
                                                {h}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {marks.map((mark, idx) => (
                                    <tr key={idx} className={mark.is_absent ? 'bg-red-50' : ''}>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={mark.student_name}
                                                onChange={e => updateMark(idx, 'student_name', e.target.value)}
                                                placeholder="Student name"
                                                className={`w-full px-2 py-1.5 text-sm border rounded-lg
                                    focus:outline-none focus:ring-1 focus:ring-primary-500
                                    ${errors[`name_${idx}`] ? 'border-red-300' : 'border-gray-200'}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={mark.roll_number}
                                                onChange={e => updateMark(idx, 'roll_number', e.target.value)}
                                                placeholder="Roll no."
                                                className={`w-full px-2 py-1.5 text-sm border rounded-lg
                                    focus:outline-none focus:ring-1 focus:ring-primary-500
                                    ${errors[`roll_${idx}`] ? 'border-red-300' : 'border-gray-200'}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={mark.max_marks}
                                                onChange={e => updateMark(idx, 'max_marks', e.target.value)}
                                                placeholder="100"
                                                className="w-20 px-2 py-1.5 text-sm border border-gray-200
                                   rounded-lg focus:outline-none focus:ring-1
                                   focus:ring-primary-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={mark.marks_obtained}
                                                onChange={e => updateMark(idx, 'marks_obtained', e.target.value)}
                                                placeholder="0"
                                                disabled={mark.is_absent}
                                                className={`w-20 px-2 py-1.5 text-sm border rounded-lg
                                    focus:outline-none focus:ring-1 focus:ring-primary-500
                                    disabled:bg-gray-100 disabled:text-gray-400
                                    ${errors[`marks_${idx}`] ? 'border-red-300' : 'border-gray-200'}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={mark.is_absent}
                                                onChange={e => updateMark(idx, 'is_absent', e.target.checked)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {marks.length > 1 && (
                                                <button onClick={() => removeRow(idx)}
                                                    className="text-red-400 hover:text-red-600 text-xs">
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="md:hidden p-4 space-y-4">
                        {marks.map((mark, idx) => (
                            <div key={idx}
                                className={`rounded-xl border p-4 space-y-3
                            ${mark.is_absent ? 'border-red-200 bg-red-50'
                                        : 'border-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">
                                        Student {idx + 1}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1 text-xs text-gray-600">
                                            <input type="checkbox" checked={mark.is_absent}
                                                onChange={e => updateMark(idx, 'is_absent', e.target.checked)}
                                                className="rounded" />
                                            Absent
                                        </label>
                                        {marks.length > 1 && (
                                            <button onClick={() => removeRow(idx)}
                                                className="text-red-400 text-xs">Remove</button>
                                        )}
                                    </div>
                                </div>
                                <input type="text" value={mark.student_name} placeholder="Student name"
                                    onChange={e => updateMark(idx, 'student_name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200
                             rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" />
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="text" value={mark.roll_number} placeholder="Roll no."
                                        onChange={e => updateMark(idx, 'roll_number', e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-1 focus:ring-primary-500" />
                                    <input type="number" value={mark.max_marks} placeholder="Max"
                                        onChange={e => updateMark(idx, 'max_marks', e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-1 focus:ring-primary-500" />
                                    <input type="number" value={mark.marks_obtained} placeholder="Marks"
                                        disabled={mark.is_absent}
                                        onChange={e => updateMark(idx, 'marks_obtained', e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-1 focus:ring-primary-500
                               disabled:bg-gray-100" />
                                </div>
                            </div>
                        ))}
                        <Button variant="secondary" onClick={addRow} className="w-full">
                            + Add Student
                        </Button>
                    </div>

                    <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="secondary" size="sm" onClick={addRow}>
                            + Add Row
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            Save All Marks
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}