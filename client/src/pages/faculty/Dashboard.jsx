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
        <Route index                      element={<DashboardHome />} />
        <Route path="assignments"         element={<MyAssignmentsPage />} />
        <Route path="exams"               element={<ExamsPage facultyMode />} />
        <Route path="marks"               element={<MarksPage />} />
        <Route path="school-activities"   element={<SchoolActivities readOnly />} />
        <Route path="student-activities"  element={<StudentActivities readOnly />} />
        <Route path="fdp"                 element={<FDPPage readOnly />} />
        <Route path="publications"        element={<PublicationsPage readOnly />} />
        <Route path="patents"             element={<PatentsPage readOnly />} />
        <Route path="certifications"      element={<CertificationsPage readOnly />} />
        <Route path="placements"          element={<PlacementsPage readOnly />} />
      </Routes>
    </Layout>
  )
}