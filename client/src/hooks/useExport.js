import { useState } from 'react'
import api from '../api/axios'

export default function useExport(endpoint, { filename, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension = '.xlsx' }) {
    const [exporting, setExporting] = useState(false)

    const exportFile = async (params = {}) => {
        setExporting(true)
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
            console.error('Export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    return { exportFile, exporting }
}