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
import CoursesPage        from '../academics/CoursesPage'
import YearsPage          from '../academics/YearsPage'
import SubjectsPage       from '../academics/SubjectsPage'
import ClassGroupsPage    from '../academics/ClassGroupsPage'
import ExamGroupsPage     from '../academics/ExamGroupsPage'
import ClubsPage          from '../academics/ClubsPage'
import AssignmentsApprovalPage from '../academics/AssignmentsApprovalPage'
import MarksPage          from '../records/MarksPage'

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route index                              element={<DashboardHome />} />

        {/* Academics */}
        <Route path="academics/courses"           element={<CoursesPage />} />
        <Route path="academics/years"             element={<YearsPage />} />
        <Route path="academics/subjects"          element={<SubjectsPage />} />
        <Route path="academics/class-groups"      element={<ClassGroupsPage />} />
        <Route path="academics/exam-groups"       element={<ExamGroupsPage />} />
        <Route path="academics/clubs"             element={<ClubsPage />} />
        <Route path="academics/assignments"       element={<AssignmentsApprovalPage />} />

        {/* Records */}
        <Route path="exams"                       element={<ExamsPage />} />
        <Route path="school-activities"           element={<SchoolActivities />} />
        <Route path="student-activities"          element={<StudentActivities />} />
        <Route path="fdp"                         element={<FDPPage />} />
        <Route path="publications"                element={<PublicationsPage />} />
        <Route path="patents"                     element={<PatentsPage />} />
        <Route path="certifications"              element={<CertificationsPage />} />
        <Route path="placements"                  element={<PlacementsPage />} />
        <Route path="marks"                       element={<MarksPage />} />
      </Routes>
    </Layout>
  )
}