import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ErrorTickets from './ErrorTickets'
import UserFeedback from './UserFeedback'

export default function ServiceDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="errors" element={<ErrorTickets />} />
        <Route path="feedback" element={<UserFeedback />} />
      </Routes>
    </Layout>
  )
}
