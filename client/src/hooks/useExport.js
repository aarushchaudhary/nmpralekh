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

export default function useExport(endpoint, { filename, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension = '.xlsx' }) {
    const [exporting, setExporting] = useState(false)
    const [exportError, setExportError] = useState('')

    const exportFile = async (params = {}) => {
        setExporting(true)
        setExportError('')
        try {
            const res = await api.get(endpoint, {
                responseType: 'blob',
                params,
            })
            const blob = new Blob([res.data], { type: mimeType })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            // Append extension if it isn't already present (or just append it)
            const finalFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`;
            a.download = finalFilename
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setExportError(await exportErrorMessage(err))
        } finally {
            setExporting(false)
        }
    }

    return { exportFile, exporting, exportError }
}
