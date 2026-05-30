import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ExportPage from './ExportPage'
import SendMISDataPage from './SendMISDataPage'

export default function CoordinatorDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="send-mis-data" element={<SendMISDataPage />} />
      </Routes>
    </Layout>
  )
}
