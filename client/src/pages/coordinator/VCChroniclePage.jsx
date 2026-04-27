import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import FormInput from '../../components/ui/FormInput';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function VCChroniclePage() {
    const [baseUrl, setBaseUrl] = useState('');
    const [serverStatus, setServerStatus] = useState('idle'); // 'idle', 'loading', 'online', 'offline'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);

    const sanitizeUrl = (url) => {
        return url.replace(/\/+$/, '');
    };

    const handleCheckStatus = async () => {
        if (!baseUrl) return;
        setServerStatus('loading');
        const sanitizedUrl = sanitizeUrl(baseUrl);

        try {
            const response = await fetch(`${sanitizedUrl}/stats`);
            if (response.ok) {
                setServerStatus('online');
            } else {
                setServerStatus('offline');
                alert('Server returned an error status.');
            }
        } catch (error) {
            setServerStatus('offline');
            alert('Failed to connect to the server. Check CORS or network.');
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a JSON file.');
            return;
        }
        if (!selectedFile.name.endsWith('.json')) {
            alert('Only .json files are allowed.');
            return;
        }

        setIsUploading(true);
        const sanitizedUrl = sanitizeUrl(baseUrl);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${sanitizedUrl}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                await fetchSummary();
            } else {
                alert('Failed to upload file.');
            }
        } catch (error) {
            alert('Error uploading file. Check CORS or network.');
        } finally {
            setIsUploading(false);
        }
    };

    const fetchSummary = async () => {
        const sanitizedUrl = sanitizeUrl(baseUrl);
        try {
            const response = await fetch(`${sanitizedUrl}/summary`);
            if (response.ok) {
                const data = await response.text();
                try {
                    // Try to format as JSON if possible
                    const jsonData = JSON.parse(data);
                    setSummaryData(JSON.stringify(jsonData, null, 2));
                } catch {
                    setSummaryData(data);
                }
            } else {
                alert('Failed to fetch summary.');
            }
        } catch (error) {
            alert('Error fetching summary. Check CORS or network.');
        }
    };

    return (
        <div>
            <PageHeader
                title="VC Chronicle Generation"
                subtitle="Generate VC Chronicles using an external API service"
            />

            <div className="max-w-2xl space-y-6">
                {/* Configuration & Health Check Card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-primary-800">Server Configuration</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <FormInput
                                label="API Base URL"
                                type="url"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder="https://api.example.com"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handleCheckStatus}
                                loading={serverStatus === 'loading'}
                                disabled={!baseUrl || serverStatus === 'loading'}
                            >
                                Check Status
                            </Button>
                            {serverStatus === 'online' && <Badge label="Online" color="green" />}
                            {serverStatus === 'offline' && <Badge label="Offline" color="red" />}
                        </div>
                    </div>
                </div>

                {/* Upload Card */}
                {serverStatus === 'online' && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Upload Data</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select JSON File
                                </label>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="block w-full text-sm text-gray-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-md file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-primary-50 file:text-primary-700
                                               hover:file:bg-primary-100
                                               border border-gray-200 rounded-lg"
                                />
                            </div>
                            <Button
                                onClick={handleFileUpload}
                                loading={isUploading}
                                disabled={!selectedFile || isUploading}
                            >
                                Upload & Generate
                            </Button>
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                {summaryData && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Summary Result</h2>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 p-4 rounded-md overflow-auto border border-gray-200 max-h-96">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                    {summaryData}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
