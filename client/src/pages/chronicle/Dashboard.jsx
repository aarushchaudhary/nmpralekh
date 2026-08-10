import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ReceivedMISDataPage from '../admin/ReceivedMISDataPage'
import InitiateRequestPage from './InitiateRequestPage'
import ExportPage from './ExportPage'

import AISummarizerPage from '../../components/shared/AISummarizerPage'

export default function ChronicleDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="initiate-request" element={<InitiateRequestPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="received-mis-data" element={<ReceivedMISDataPage />} />
        <Route path="ai-summarizer" element={<AISummarizerPage />} />
      </Routes>
    </Layout>
  )
}
