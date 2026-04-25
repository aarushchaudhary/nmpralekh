import { useState, useEffect } from 'react'
import useRecords from '../../hooks/useRecords'
import useSchools from '../../hooks/useSchools'
import useExport from '../../hooks/useExport'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import FormInput from '../../components/ui/FormInput'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const empty = { school: '', name: '', date: '', details: '', company_name: '', placecom_name: '' }

export default function PlacementsPage({ readOnly = false }) {
    const { user } = useAuth()
    const { data, loading, create, fetch , totalPages, currentPage, goToPage} = useRecords('/records/placements/')
    const { schoolOptions } = useSchools()
    const { exportFile, exporting } = useExport('/export/placements/', 'placements.xlsx')

    const [showForm, setShowForm] = useState(false)
    const [showEditConfirm, setShowEditConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(empty)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    const openCreate = () => { setSelected(null); setForm(empty); setErrors({}); setShowForm(true) }
    const openEdit = row => {
        setSelected(row)
        setForm({
            school: row.school,
            name: row.name,
            date: row.date,
            details: row.details,
            company_name: row.company_name || '',
            placecom_name: row.placecom_name || '',
        })
        setErrors({}); setShowForm(true)
    }

    const validate = () => {
        const e = {}
        if (!form.school) e.school = 'School is required'
        if (!form.name) e.name = 'Activity name is required'
        if (!form.date) e.date = 'Date is required'
        if (!form.details) e.details = 'Details are required'
        setErrors(e); return !Object.keys(e).length
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            const payload = { ...form }
            if (selected) {
                await api.put(`/records/placements/${selected.id}/`, payload)
                setShowEditConfirm(false)
            } else { await create(payload) }
            setShowForm(false); fetch()
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data)
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            const res = await api.delete(`/records/placements/${selected.id}/`)
            console.log('Delete response:', res.data)
            setShowDeleteConfirm(false)
            fetch()
        } catch (err) {
            console.error('Delete failed:', err)
        } finally {
            setSaving(false)
        }
    }

    const columns = [
        { key: 'school_name', label: 'School' },
        { key: 'name', label: 'Activity' },
        { key: 'date', label: 'Date' },
        { key: 'placecom_name', label: 'PlaceCom', render: row => row.placecom_name || '—' },
        { key: 'company_name', label: 'Company', render: row => row.company_name || '—' },
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
            render: row => !readOnly && (
                <div className="flex gap-2">
                    {row.pending_audit ? (
                        <span className="text-xs text-yellow-600 italic">
                            Change pending...
                        </span>
                    ) : (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                                Edit
                            </Button>
                            <Button size="sm" variant="danger"
                                onClick={() => { setSelected(row); setShowDeleteConfirm(true) }}>
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ]

    return (
        <div>
            <PageHeader title="Placement Activities"
                subtitle="Placement and recruitment activity records"
                action={
                    <div className="flex gap-2">
                        {['super_admin', 'admin', 'user'].includes(user?.role) && (
                            <button onClick={() => exportFile()} disabled={exporting}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white
                           text-sm font-medium rounded-lg transition-colors
                           disabled:opacity-50 flex items-center gap-2">
                                {exporting ? 'Exporting...' : '⬇ Export'}
                            </button>
                        )}
                        {!readOnly && <Button onClick={openCreate}>+ Add Activity</Button>}
                    </div>
                }
            />

            <Table columns={columns} data={data}
        serverPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage} loading={loading} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={selected ? 'Edit Placement Activity' : 'Add Placement Activity'}>
                <div className="space-y-4">
                    <FormInput label="School" type="select" value={form.school}
                        onChange={set('school')} options={schoolOptions}
                        required error={errors.school} />
                    <FormInput label="Activity Name" value={form.name} onChange={set('name')}
                        required error={errors.name} />
                    <FormInput label="Date" type="date" value={form.date}
                        onChange={set('date')} required error={errors.date} />
                    <FormInput label="PlaceCom (optional)" value={form.placecom_name}
                        onChange={set('placecom_name')} placeholder="e.g. Placement Committee" />
                    <FormInput label="Company Name (optional)" value={form.company_name}
                        onChange={set('company_name')} placeholder="e.g. TCS, Infosys" />
                    <FormInput label="Details" type="textarea" value={form.details}
                        onChange={set('details')} required error={errors.details} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button loading={saving}
                            onClick={selected
                                ? () => { setShowForm(false); setShowEditConfirm(true) }
                                : handleSubmit}>
                            {selected ? 'Request Update' : 'Save Record'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog isOpen={showEditConfirm} onClose={() => setShowEditConfirm(false)}
                onConfirm={handleSubmit} title="Submit Update Request"
                message="This update will be sent for approval before being applied."
                confirmLabel="Submit for Approval" loading={saving} />
            <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete} title="Submit Delete Request"
                message="This delete request will be sent for approval."
                confirmLabel="Submit for Approval" loading={saving} />
        </div>
    )
}