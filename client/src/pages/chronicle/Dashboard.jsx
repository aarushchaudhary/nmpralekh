import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ReceivedMISDataPage from '../admin/ReceivedMISDataPage'

export default function ChronicleDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="received-mis-data" element={<ReceivedMISDataPage />} />
      </Routes>
    </Layout>
  )
}
