import { useState } from 'react'
import api from '../api/axios'

/**
 * Hook for the MIS Coordinator export endpoint.
 * Handles both Excel and JSON downloads from /api/export/coordinator/.
 */
export default function useCoordinatorExport() {
    const [exporting, setExporting] = useState(false)

    const exportFile = async (params = {}) => {
        setExporting(true)
        try {
            const fmt = params.format || 'excel'

            const res = await api.get('/export/coordinator/', {
                responseType: 'blob',
                params,
            })

            // determine content type and filename based on format
            let mimeType, filename
            if (fmt === 'json') {
                mimeType = 'application/json'
                filename = 'MIS_Coordinator_Export.json'
            } else {
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                filename = 'MIS_Coordinator_Export.xlsx'
            }

            const blob = new Blob([res.data], { type: mimeType })
            const url  = window.URL.createObjectURL(blob)
            const a    = document.createElement('a')
            a.href     = url
            a.download = filename
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Coordinator export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    return { exportFile, exporting }
}
