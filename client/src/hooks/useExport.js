import { useState } from 'react'
import api from '../api/axios'

export default function useExport(endpoint, filename) {
    const [exporting, setExporting] = useState(false)

    const exportFile = async (params = {}) => {
        setExporting(true)
        try {
            const res = await api.get(endpoint, {
                responseType: 'blob',
                params,
            })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            window.URL.revokeObjectURL(url)
        } catch {
        } finally {
            setExporting(false)
        }
    }

    return { exportFile, exporting }
}