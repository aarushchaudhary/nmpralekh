import { useState } from 'react'
import PageHeader from '../ui/PageHeader'
import Button from '../ui/Button'

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
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <PageHeader
                title="AI Summarizer"
                subtitle="Upload MIS Data (Excel/JSON) to your AI Server for summarization"
            />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-6 space-y-8">
                    {/* 1. Server URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            1. Fast API Server URL
                        </label>
                        <input
                            type="url"
                            placeholder="e.g. http://192.168.1.100:8000"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                        />
                    </div>
                    
                    {/* 2. Upload Box */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            2. Upload MIS Data
                        </label>
                        <form onSubmit={handleUpload} className="flex gap-4 items-end">
                            <div className="flex-grow">
                                <input
                                    type="file"
                                    accept=".json,.xlsx,.xls"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                3. Result Output
                            </label>
                            <button
                                type="button"
                                onClick={fetchResult}
                                disabled={fetching}
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                            >
                                {fetching ? 'Fetching...' : 'Fetch Result Manually'}
                            </button>
                        </div>
                        <div className="w-full min-h-[300px] p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap font-mono text-sm text-gray-800 overflow-y-auto">
                            {result || <span className="text-gray-400 italic">No result yet. Upload a file or fetch from server.</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
