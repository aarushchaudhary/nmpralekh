import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ExportPage from './ExportPage'
import VCChroniclePage from './VCChroniclePage'

export default function CoordinatorDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="vc-chronicle" element={<VCChroniclePage />} />
      </Routes>
    </Layout>
  )
}
