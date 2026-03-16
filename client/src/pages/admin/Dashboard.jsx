import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome from './DashboardHome'
import ExamsPage from '../records/ExamPage'
import SchoolActivities from '../records/SchoolActivitiesPage'
import StudentActivities from '../records/StudentActivitiesPage'
import FDPPage from '../records/FDPPage'
import PublicationsPage from '../records/PublicationsPage'
import PatentsPage from '../records/PatentsPage'
import CertificationsPage from '../records/CertificationsPage'
import PlacementsPage from '../records/PlacementsPage'

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="school-activities" element={<SchoolActivities />} />
        <Route path="student-activities" element={<StudentActivities />} />
        <Route path="fdp" element={<FDPPage />} />
        <Route path="publications" element={<PublicationsPage />} />
        <Route path="patents" element={<PatentsPage />} />
        <Route path="certifications" element={<CertificationsPage />} />
        <Route path="placements" element={<PlacementsPage />} />
      </Routes>
    </Layout>
  )
}