import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import Campuses from './Campuses'
import Schools from './Schools'
import Users from './Users'
import Assignments from './Assignments'
import ExportHistory from './ExportHistory'
import ManualExport from './ManualExport'
import BackupSettings from './BackupSettings'

export default function MasterDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="campuses" element={<Campuses />} />
        <Route path="schools" element={<Schools />} />
        <Route path="users" element={<Users />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="exports" element={<ExportHistory />} />
        <Route path="exports/manual" element={<ManualExport />} />
        <Route path="backup-settings" element={<BackupSettings />} />
      </Routes>
    </Layout>
  )
}