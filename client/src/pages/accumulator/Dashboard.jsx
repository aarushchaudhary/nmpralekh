import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ReceivedMISDataPage from '../admin/ReceivedMISDataPage'
import FinalizeMISPage from './FinalizeMISPage'
import ExportPage from './ExportPage'

import AISummarizerPage from '../../components/shared/AISummarizerPage'

export default function AccumulatorDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="received-data" element={<ReceivedMISDataPage />} />
        <Route path="finalize" element={<FinalizeMISPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="ai-summarizer" element={<AISummarizerPage />} />
      </Routes>
    </Layout>
  )
}
