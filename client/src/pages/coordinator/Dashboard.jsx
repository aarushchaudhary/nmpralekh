import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ExportPage from './ExportPage'

export default function CoordinatorDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="export" element={<ExportPage />} />
      </Routes>
    </Layout>
  )
}
