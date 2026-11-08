import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Panel from '../../components/ui/Panel'
import Badge from '../../components/ui/Badge'

const serviceStatus = {
    online: 'dark',
    placeholder: 'gray',
}

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
            <PageHeader
                title="System Monitoring Dashboard"
                subtitle="Refreshes every 10 seconds"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
                <StatCard label="Open error tickets" value={stats.open_tickets} hint={`${stats.investigating} investigating`} />
                <StatCard label="Total error tickets" value={stats.total_tickets} hint={`${stats.resolved_today} resolved today`} />
                <StatCard label="Open bug reports" value={stats.open_reports} hint={`${stats.critical_reports} critical`} />
                <StatCard label="Total bug reports" value={stats.total_reports} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Panel title="Backend services status" padded={false}>
                    <ul className="divide-y divide-gray-100">
                        {stats.services?.map((svc, i) => (
                            <li key={i} className="flex justify-between items-center gap-3 px-4 py-3">
                                <span className="text-sm font-medium text-gray-800">{svc.name}</span>
                                <Badge
                                    label={svc.status.charAt(0).toUpperCase() + svc.status.slice(1)}
                                    color={serviceStatus[svc.status] || 'red'}
                                />
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title="System utilization">
                    {stats.system_stats && (
                        <div className="space-y-5">
                            <UtilizationBar label="CPU usage" percent={stats.system_stats.cpu} />
                            <UtilizationBar label="RAM usage" percent={stats.system_stats.ram_percent}
                                detail={`${formatBytes(stats.system_stats.ram_used)} / ${formatBytes(stats.system_stats.ram_total)}`} />
                            <UtilizationBar label="Disk usage" percent={stats.system_stats.disk_percent}
                                detail={`${formatBytes(stats.system_stats.disk_used)} / ${formatBytes(stats.system_stats.disk_total)}`} />
                            <div className="pt-3 border-t border-gray-100 flex justify-between">
                                <span className="text-sm font-medium text-gray-600">PostgreSQL DB size</span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">{stats.db_size}</span>
                            </div>
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    )
}

// Load level is shown as text (High / Elevated) as well as by the bar colour
function UtilizationBar({ label, percent, detail }) {
    const level = percent > 85 ? 'high' : percent > 70 ? 'elevated' : null
    return (
        <div>
            <div className="flex justify-between items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="flex items-center gap-2">
                    {level === 'high' && <Badge label="High" color="red" />}
                    {level === 'elevated' && <Badge label="Elevated" color="outline" />}
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">{percent}%</span>
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-sm h-2 mb-1 overflow-hidden">
                <div className={`h-2 ${level === 'high' ? 'bg-primary-600' : level === 'elevated' ? 'bg-gray-800' : 'bg-gray-600'}`} style={{ width: `${percent}%` }}></div>
            </div>
            {detail && <p className="text-xs text-gray-500 text-right tabular-nums">{detail}</p>}
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
