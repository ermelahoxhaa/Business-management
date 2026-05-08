import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import ClientManagement from './pages/dashboard/ClientManagement'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
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
  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <>
      {!isDashboard && <Header />}

      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={
          <ProtectedRoute>
            <ClientManagement />
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={['admin', 'team_leader']}>
            <EmployeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } />
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated() ? getDefaultRouteForRole(getUserRole()) : '/home'}
              replace
            />
          }
        />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  )
}

export default App