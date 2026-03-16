import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import UnauthorizedPage from './pages/auth/UnauthorizedPage'

import MasterDashboard from './pages/master/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import FacultyDashboard from './pages/faculty/Dashboard'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import DeleteAuthDashboard from './pages/deleteauth/Dashboard'

function RoleRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/login" replace />
  const routes = {
    master: '/master',
    admin: '/admin',
    user: '/faculty',
    super_admin: '/superadmin',
    delete_auth: '/deleteauth',
  }
  return <Navigate to={routes[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}