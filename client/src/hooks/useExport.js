import { useState } from 'react'
import api from '../api/axios'
import { apiErrors } from '../api/errors'

// Message for a failed file download. Blob responses carry the server's JSON
// error as a Blob, so read it before apiErrors can use it.
export async function exportErrorMessage(err) {
    if (err.response?.data instanceof Blob) {
        try { err.response.data = JSON.parse(await err.response.data.text()) } catch { /* not JSON */ }
    }
    const status = err.response?.status
    if (status === 429) return 'Export limit reached. Please wait a minute and try again.'
    // the server's per-minute export limit also answers 403, indistinguishable from "no permission"
    if (status === 403) return 'Export not allowed right now. If you exported several times in the last minute, wait a minute and try again.'
    return apiErrors(err)._form || 'Export failed. Please try again.'
}

function saveBlob(data, filename, mimeType) {
    const url = window.URL.createObjectURL(new Blob([data], { type: mimeType }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Big exports run on the server's background worker: start the job, poll until
// it is ready, then fetch the file. Throws like an axios error so callers can
// use exportErrorMessage.
export async function runBackgroundExport(startUrl, filename) {
    const { data: { task_id } } = await api.post(startUrl)
    const deadline = Date.now() + 5 * 60 * 1000
    for (;;) {
        await sleep(1500)
        const { data } = await api.get(`/export/jobs/${task_id}/`)
        if (data.status === 'ready') break
        if (data.status === 'failed') throw { response: { data: { detail: 'Export failed. Please try again.' } } }
        if (Date.now() > deadline) throw { response: { data: { detail: 'Export is taking too long. Please try again later.' } } }
    }
    const res = await api.get(`/export/jobs/${task_id}/download/`, { responseType: 'blob' })
    saveBlob(res.data, filename, res.headers?.['content-type'])
}

export default function useExport(endpoint, { filename, background = false, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension = '.xlsx' }) {
    const [exporting, setExporting] = useState(false)
    const [exportError, setExportError] = useState('')

    const exportFile = async (params = {}) => {
        setExporting(true)
        setExportError('')
        const finalFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`
        try {
            if (background) {
                await runBackgroundExport(endpoint, finalFilename)
            } else {
                const res = await api.get(endpoint, { responseType: 'blob', params })
                saveBlob(res.data, finalFilename, mimeType)
            }
        } catch (err) {
            setExportError(await exportErrorMessage(err))
        } finally {
            setExporting(false)
        }
    }

    return { exportFile, exporting, exportError }
}
