import { Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import DashboardHome      from './DashboardHome'
import ExamsPage          from '../records/ExamPage'
import SchoolActivities   from '../records/SchoolActivitiesPage'
import StudentActivities  from '../records/StudentActivitiesPage'
import FDPPage            from '../records/FDPPage'
import PublicationsPage   from '../records/PublicationsPage'
import PatentsPage        from '../records/PatentsPage'
import CertificationsPage from '../records/CertificationsPage'
import PlacementsPage     from '../records/PlacementsPage'
import MarksPage          from '../records/MarksPage'
import MyAssignmentsPage  from './MyAssignmentsPage'

export default function FacultyDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index                     element={<DashboardHome />} />
        <Route path="assignments"        element={<MyAssignmentsPage />} />

        {/* Faculty has full create/update on these */}
        <Route path="exams"              element={<ExamsPage facultyMode />} />
        <Route path="marks"              element={<MarksPage />} />
        <Route path="school-activities"  element={<SchoolActivities />} />
        <Route path="student-activities" element={<StudentActivities />} />
        <Route path="fdp"                element={<FDPPage />} />
        <Route path="placements"         element={<PlacementsPage />} />

        {/* Self-managed — faculty sees and edits only their own */}
        <Route path="publications"       element={<PublicationsPage selfOnly />} />
        <Route path="patents"            element={<PatentsPage selfOnly />} />
        <Route path="certifications"     element={<CertificationsPage selfOnly />} />
      </Routes>
    </Layout>
  )
}