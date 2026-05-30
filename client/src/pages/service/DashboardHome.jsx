import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function DashboardHome() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/service/stats/')
                setStats(res.data)
            } catch (err) {
                console.error("Failed to load service stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
        // Poll every 10 seconds for real-time monitoring
        const interval = setInterval(fetchStats, 10000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Monitoring Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Open Error Tickets" value={stats.open_tickets} subtitle={`${stats.investigating} investigating`} />
                <StatCard title="Total Error Tickets" value={stats.total_tickets} subtitle={`${stats.resolved_today} resolved today`} />
                <StatCard title="Open Bug Reports" value={stats.open_reports} subtitle={`${stats.critical_reports} critical`} />
                <StatCard title="Total Bug Reports" value={stats.total_reports} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Backend Services Status</h2>
                    <div className="space-y-3">
                        {stats.services?.map((svc, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">{svc.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    svc.status === 'online' ? 'bg-green-100 text-green-700' :
                                    svc.status === 'placeholder' ? 'bg-gray-100 text-gray-600' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {svc.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">System Utilization</h2>
                    {stats.system_stats && (
                        <div className="space-y-5">
                            <UtilizationBar label="CPU Usage" percent={stats.system_stats.cpu} />
                            <UtilizationBar label="RAM Usage" percent={stats.system_stats.ram_percent} 
                                detail={`${formatBytes(stats.system_stats.ram_used)} / ${formatBytes(stats.system_stats.ram_total)}`} />
                            <UtilizationBar label="Disk Usage" percent={stats.system_stats.disk_percent}
                                detail={`${formatBytes(stats.system_stats.disk_used)} / ${formatBytes(stats.system_stats.disk_total)}`} />
                            <div className="pt-2 border-t border-gray-100 flex justify-between">
                                <span className="text-sm font-medium text-gray-500">PostgreSQL DB Size</span>
                                <span className="text-sm font-bold text-gray-800">{stats.db_size}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, subtitle }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    )
}

function UtilizationBar({ label, percent, detail }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className={`h-2 rounded-full ${percent > 85 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-primary-500'}`} style={{ width: `${percent}%` }}></div>
            </div>
            {detail && <p className="text-xs text-gray-400 text-right">{detail}</p>}
        </div>
    )
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
