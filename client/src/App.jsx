import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import BugReportButton from './components/BugReportButton'

import LoginPage from './pages/auth/LoginPage'
import UnauthorizedPage from './pages/auth/UnauthorizedPage'

import MasterDashboard from './pages/master/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import FacultyDashboard from './pages/faculty/Dashboard'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import DeleteAuthDashboard from './pages/deleteauth/Dashboard'
import CoordinatorDashboard from './pages/coordinator/Dashboard'
import AccumulatorDashboard from './pages/accumulator/Dashboard'
import ServiceDashboard from './pages/service/Dashboard'
import ChronicleDashboard from './pages/chronicle/Dashboard'

function RoleRedirect() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div role="status" aria-label="Loading" className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (user.is_service_admin) return <Navigate to="/service-dashboard" replace />
  if (user.is_chronicle_master) return <Navigate to="/chronicle-dashboard" replace />

  const routes = {
    master: '/master',
    admin: '/admin',
    user: '/faculty',
    super_admin: '/superadmin',
    delete_auth: '/deleteauth',
    mis_coordinator: '/coordinator',
    mis_accumulator: '/accumulator',
  }
  return <Navigate to={routes[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <BugReportButton />
          <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Master */}
          <Route path="/master/*" element={
            <ProtectedRoute roles={['master']}>
              <MasterDashboard />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Faculty */}
          <Route path="/faculty/*" element={
            <ProtectedRoute roles={['user']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />

          {/* Super Admin */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute roles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Delete Auth */}
          <Route path="/deleteauth/*" element={
            <ProtectedRoute roles={['delete_auth']}>
              <DeleteAuthDashboard />
            </ProtectedRoute>
          } />

          {/* MIS Coordinator */}
          <Route path="/coordinator/*" element={
            <ProtectedRoute roles={['mis_coordinator']}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          } />

          {/* MIS Accumulator */}
          <Route path="/accumulator/*" element={
            <ProtectedRoute roles={['mis_accumulator']}>
              <AccumulatorDashboard />
            </ProtectedRoute>
          } />

          {/* Service Admin Dashboard */}
          <Route path="/service-dashboard/*" element={
            <ProtectedRoute isServiceRoute={true}>
              <ServiceDashboard />
            </ProtectedRoute>
          } />

          {/* Chronicle Master Dashboard */}
          <Route path="/chronicle-dashboard/*" element={
            <ProtectedRoute isChronicleRoute={true}>
              <ChronicleDashboard />
            </ProtectedRoute>
          } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}