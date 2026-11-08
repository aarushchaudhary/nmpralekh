import { useState } from 'react'
import PageHeader from '../ui/PageHeader'
import Button from '../ui/Button'
import Panel from '../ui/Panel'

export default function AISummarizerPage() {
    const [serverUrl, setServerUrl] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [result, setResult] = useState('')
    const [error, setError] = useState('')

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!serverUrl) {
            setError('Please enter a Server URL first.')
            return
        }
        if (!file) {
            setError('Please select a file to upload.')
            return
        }
        
        setError('')
        setUploading(true)
        setResult('')
        
        const formData = new FormData()
        formData.append('file', file)

        try {
            // Upload to serverUrl/upload
            const uploadUrl = serverUrl.replace(/\/+$/, '') + '/upload'
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            })
            
            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`)
            }
            
            const data = await response.json().catch(() => ({}))
            setError('')
            
            // Optionally, the server might return the result immediately,
            // but the prompt asked for a separate output fetch.
            if (data && data.result) {
                setResult(data.result)
            } else {
                fetchResult() // auto-fetch after upload
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    const fetchResult = async () => {
        if (!serverUrl) {
            setError('Please enter a Server URL first.')
            return
        }
        
        setFetching(true)
        setError('')
        
        try {
            const outputUrl = serverUrl.replace(/\/+$/, '') + '/output'
            const response = await fetch(outputUrl)
            
            if (!response.ok) {
                throw new Error(`Fetch failed with status: ${response.status}`)
            }
            
            const data = await response.json()
            setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
        } catch (err) {
            setError(err.message)
        } finally {
            setFetching(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader
                title="AI Summarizer"
                subtitle="Upload MIS Data (Excel/JSON) to your AI Server for summarization"
            />

            <Panel>
                <div className="space-y-6">
                    {/* 1. Server URL */}
                    <div>
                        <label htmlFor="ai-summarizer-1" className="block text-sm font-medium text-gray-800 mb-1">
                            1. Fast API Server URL
                        </label>
                        <input id="ai-summarizer-1"
                            type="url"
                            placeholder="e.g. http://192.168.1.100:8000"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
                        />
                    </div>

                    {/* 2. Upload Box */}
                    <div>
                        <label htmlFor="ai-summarizer-2" className="block text-sm font-medium text-gray-800 mb-1">
                            2. Upload MIS Data
                        </label>
                        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="flex-grow min-w-0">
                                <input id="ai-summarizer-2"
                                    type="file"
                                    accept=".json,.xlsx,.xls"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 file:mr-3 file:h-9 file:px-3 file:border-0 file:border-r file:border-solid file:border-gray-300 file:bg-gray-50 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-100"
                                />
                            </div>
                            <Button type="submit" disabled={uploading || !file}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </form>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* 3. Result Box */}
                    <div>
                        <div className="flex justify-between items-center gap-3 mb-2">
                            <p className="text-sm font-medium text-gray-800">
                                3. Result Output
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={fetchResult}
                                disabled={fetching}
                            >
                                {fetching ? 'Fetching...' : 'Fetch Result Manually'}
                            </Button>
                        </div>
                        <div className="w-full min-h-[300px] p-4 bg-white border border-gray-200 rounded-md whitespace-pre-wrap text-sm text-gray-800 leading-relaxed overflow-y-auto">
                            {result || <span className="text-gray-500">No result yet. Upload a file or fetch from server.</span>}
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    )
}
