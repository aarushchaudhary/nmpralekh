import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ReceivedDataPage from './ReceivedDataPage'
import FinalizeMISPage from './FinalizeMISPage'

export default function AccumulatorDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="received-data" element={<ReceivedDataPage />} />
        <Route path="finalize" element={<FinalizeMISPage />} />
      </Routes>
    </Layout>
  )
}
