import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import PendingRequests from './PendingRequests'
import History from './History'

export default function DeleteAuthDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="history" element={<History />} />
      </Routes>
    </Layout>
  )
}