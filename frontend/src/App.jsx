import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import EmployeeHome from './pages/EmployeeHome'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import ClientManagement from './pages/dashboard/ClientManagement'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import { isAuthenticated, getUserRole, getDefaultRouteForRole } from './services/auth'

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const role = getUserRole()
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />
  }

  return children
}

function App() {
  const location = useLocation()
  const role = getUserRole()
  const isDashboardUser = role === 'admin' || role === 'team_leader'
  const isEmployeeDashboard = role === 'employee' && location.pathname === '/home'
  const isDashboard = location.pathname.startsWith('/dashboard') || isEmployeeDashboard || (
    isDashboardUser && ['/client', '/employees', '/tasks', '/projects', '/reports', '/settings'].includes(location.pathname)
  )

  return (
    <>
      {!isDashboard && <Header />}

      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeHome />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <ClientManagement />
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <EmployeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <Projects />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to={getDefaultRouteForRole(getUserRole())} replace />
              : <Home />
          }
        />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  )
}

export default App
