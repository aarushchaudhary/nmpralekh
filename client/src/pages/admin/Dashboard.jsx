import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome      from './DashboardHome'
import SchoolActivities   from '../records/SchoolActivitiesPage'
import StudentActivities  from '../records/StudentActivitiesPage'
import FDPPage            from '../records/FDPPage'
import PublicationsPage   from '../records/PublicationsPage'
import PatentsPage        from '../records/PatentsPage'
import CertificationsPage from '../records/CertificationsPage'
import PlacementsPage     from '../records/PlacementsPage'
import ClubsPage          from './ClubsPage'
import SchoolFacultiesPage from './SchoolFacultiesPage'

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index                              element={<DashboardHome />} />

        {/* Manage */}
        <Route path="clubs"                       element={<ClubsPage />} />
        <Route path="faculties"                    element={<SchoolFacultiesPage />} />

        {/* Records */}
        <Route path="school-activities"           element={<SchoolActivities />} />
        <Route path="student-activities"          element={<StudentActivities />} />
        <Route path="fdp"                         element={<FDPPage />} />
        <Route path="publications"                element={<PublicationsPage />} />
        <Route path="patents"                     element={<PatentsPage />} />
        <Route path="certifications"              element={<CertificationsPage />} />
        <Route path="placements"                  element={<PlacementsPage />} />
      </Routes>
    </Layout>
  )
}