import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ClientManagement from './pages/dashboard/ClientManagement'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import { isAuthenticated, getUserRole } from './services/auth'

function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && getUserRole() !== requiredRole) {
    // If employee tries dashboard, redirect to home
    if (getUserRole() === 'employee' && requiredRole === 'admin') {
      return <Navigate to="/home" replace />
    }
    // Admin can access employee areas
    return children
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
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<ClientManagement />} />
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
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  )
}

export default App