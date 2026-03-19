import { useState, useEffect } from 'react'
import useRecords  from '../../hooks/useRecords'
import useExport   from '../../hooks/useExport'
import useSchools  from '../../hooks/useSchools'
import PageHeader  from '../../components/ui/PageHeader'
import Button      from '../../components/ui/Button'
import Table       from '../../components/ui/Table'
import Modal       from '../../components/ui/Modal'
import FormInput   from '../../components/ui/FormInput'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import api         from '../../api/axios'

const emptyYear = { school: '', course: '', year_number: '', graduation_year: '' }
const emptySem  = { academic_year: '', semester_number: '', start_date: '', end_date: '' }

export default function YearsPage() {
  const {
    data: years, loading: yearsLoading, create: createYear, fetch: fetchYears,
    totalPages: yearsTotalPages, currentPage: yearsCurrentPage, goToPage: goToYearsPage
  } = useRecords('/academics/years/')
  
  const {
    data: semesters, loading: semsLoading, create: createSem, fetch: fetchSems,
    totalPages: semsTotalPages, currentPage: semsCurrentPage, goToPage: goToSemsPage
  } = useRecords('/academics/semesters/')
  const { schoolOptions }   = useSchools()
  const { exportFile: exportYears,    exporting: exportingYears }    = useExport('/export/academics/years/',     'academic_years.xlsx')
  const { exportFile: exportSemesters, exporting: exportingSemesters } = useExport('/export/academics/semesters/', 'semesters.xlsx')

  const [courseOptions, setCourseOptions] = useState([])
  const [tab, setTab]                     = useState('years')

  const [showYearForm, setShowYearForm]     = useState(false)
  const [showSemForm, setShowSemForm]       = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)
  const [selected, setSelected]             = useState(null)
  const [yearForm, setYearForm]             = useState(emptyYear)
  const [semForm, setSemForm]               = useState(emptySem)
  const [saving, setSaving]                 = useState(false)
  const [errors, setErrors]                 = useState({})

  const setY = f => e => setYearForm(p => ({ ...p, [f]: e.target.value }))
  const setS = f => e => setSemForm(p => ({ ...p, [f]: e.target.value }))

  useEffect(() => {
    api.get('/academics/courses/?is_active=true').then(res => {
      const data = res.data?.results ?? res.data
      setCourseOptions(data.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` })))
    })
  }, [])

  const yearOptions = years.map(y => ({
    value: y.id,
    label: `${y.course_code} Year ${y.year_number} (${y.graduation_year})`
  }))

  const handleCreateYear = async () => {
    const e = {}
    if (!yearForm.school)          e.school          = 'Required'
    if (!yearForm.course)          e.course          = 'Required'
    if (!yearForm.year_number)     e.year_number     = 'Required'
    if (!yearForm.graduation_year) e.graduation_year = 'Required'
    setErrors(e); if (Object.keys(e).length) return

    setSaving(true)
    try {
      await createYear(yearForm)
      setShowYearForm(false); setYearForm(emptyYear)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally { setSaving(false) }
  }

  const handleCreateSem = async () => {
    const e = {}
    if (!semForm.academic_year)   e.academic_year   = 'Required'
    if (!semForm.semester_number) e.semester_number = 'Required'
    setErrors(e); if (Object.keys(e).length) return

    setSaving(true)
    try {
      await createSem(semForm)
      setShowSemForm(false); setSemForm(emptySem)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally { setSaving(false) }
  }

  const handleDeleteYear = async () => {
    setSaving(true)
    try {
      const res = await api.delete(`/academics/years/${selected.id}/`)
      console.log('Delete response:', res.data)
      setShowConfirm(false)
      fetchYears()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const yearColumns = [
    { key: 'school_name',     label: 'School' },
    { key: 'course_name',     label: 'Course' },
    { key: 'year_number',     label: 'Year',
      render: row => `Year ${row.year_number}` },
    { key: 'graduation_year', label: 'Graduation Year' },
    {
      key: 'status', label: 'Status', sortable: false,
      render: row => row.pending_audit ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
          Pending Approval
        </span>
      ) : null
    },
    {
      key: 'actions', label: '', sortable: false,
      render: row => (
        <div className="flex gap-2">
          {row.pending_audit ? (
            <span className="text-xs text-yellow-600 italic">
              Change pending...
            </span>
          ) : (
            <Button size="sm" variant="danger"
              onClick={() => { setSelected(row); setShowConfirm(true) }}>
              Delete
            </Button>
          )}
        </div>
      )
    }
  ]

  const semColumns = [
    {
      key: 'academic_year_detail', label: 'Course',
      render: row => row.academic_year_detail?.course_name
    },
    {
      key: 'year', label: 'Year',
      render: row => `Year ${row.academic_year_detail?.year_number} (${row.academic_year_detail?.graduation_year})`
    },
    {
      key: 'semester_number', label: 'Semester',
      render: row => `Semester ${row.semester_number}`
    },
    { key: 'start_date', label: 'Start Date', render: row => row.start_date || '—' },
    { key: 'end_date',   label: 'End Date',   render: row => row.end_date   || '—' },
    {
      key: 'status', label: 'Status', sortable: false,
      render: row => row.pending_audit ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
          Pending Approval
        </span>
      ) : null
    },
    {
      key: 'actions', label: '', sortable: false,
      render: row => (
        <div className="flex gap-2">
          {row.pending_audit ? (
            <span className="text-xs text-yellow-600 italic">
              Change pending...
            </span>
          ) : (
            <Button size="sm" variant="danger"
              onClick={() => {
                api.delete(`/academics/semesters/${row.id}/`)
                  .then(res => {
                    console.log('Delete response:', res.data)
                    fetchSems()
                  })
                  .catch(err => console.error('Delete failed:', err))
              }}>
              Delete
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Years & Semesters"
        subtitle="Manage academic years and semesters for each course"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportSemesters()} disabled={!!exportingSemesters}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                         text-sm font-medium rounded-lg transition-colors
                         disabled:opacity-50 flex items-center gap-2">
              {exportingSemesters ? 'Exporting...' : '⬇ Semesters'}
            </button>
            <button onClick={() => exportYears()} disabled={!!exportingYears}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                         text-sm font-medium rounded-lg transition-colors
                         disabled:opacity-50 flex items-center gap-2">
              {exportingYears ? 'Exporting...' : '⬇ Years'}
            </button>
            <Button variant="secondary"
              onClick={() => { setErrors({}); setShowSemForm(true) }}>
              + Add Semester
            </Button>
            <Button onClick={() => { setErrors({}); setShowYearForm(true) }}>
              + Add Year
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['years', 'semesters'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize
                        transition-colors
                        ${tab === t
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'years'
        ? <Table columns={yearColumns} data={years} loading={yearsLoading} serverPagination totalPages={yearsTotalPages} currentPage={yearsCurrentPage} onPageChange={goToYearsPage} />
        : <Table columns={semColumns}  data={semesters} loading={semsLoading} serverPagination totalPages={semsTotalPages} currentPage={semsCurrentPage} onPageChange={goToSemsPage} />
      }

      {/* Add Year Modal */}
      <Modal isOpen={showYearForm} onClose={() => setShowYearForm(false)}
        title="Add Academic Year">
        <div className="space-y-4">
          <FormInput label="School" type="select" value={yearForm.school}
            onChange={setY('school')} options={schoolOptions}
            required error={errors.school} />
          <FormInput label="Course" type="select" value={yearForm.course}
            onChange={setY('course')} options={courseOptions}
            required error={errors.course} />
          <FormInput label="Year Number" type="number" value={yearForm.year_number}
            onChange={setY('year_number')} placeholder="e.g. 1"
            required error={errors.year_number} />
          <FormInput label="Graduation Year" type="number" value={yearForm.graduation_year}
            onChange={setY('graduation_year')} placeholder="e.g. 2027"
            required error={errors.graduation_year} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowYearForm(false)}>Cancel</Button>
            <Button onClick={handleCreateYear} loading={saving}>Create Year</Button>
          </div>
        </div>
      </Modal>

      {/* Add Semester Modal */}
      <Modal isOpen={showSemForm} onClose={() => setShowSemForm(false)}
        title="Add Semester">
        <div className="space-y-4">
          <FormInput label="Academic Year" type="select" value={semForm.academic_year}
            onChange={setS('academic_year')} options={yearOptions}
            required error={errors.academic_year} />
          <FormInput label="Semester Number" type="number" value={semForm.semester_number}
            onChange={setS('semester_number')} placeholder="e.g. 1"
            required error={errors.semester_number} />
          <FormInput label="Start Date" type="date" value={semForm.start_date}
            onChange={setS('start_date')} />
          <FormInput label="End Date" type="date" value={semForm.end_date}
            onChange={setS('end_date')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowSemForm(false)}>Cancel</Button>
            <Button onClick={handleCreateSem} loading={saving}>Create Semester</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteYear} title="Delete Academic Year"
        message="Deleting this year will also remove all semesters under it. Continue?"
        confirmLabel="Delete" loading={saving} />
    </div>
  )
}
