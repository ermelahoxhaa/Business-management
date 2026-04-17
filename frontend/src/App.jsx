import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ClientManagement from './pages/dashboard/ClientManagement'

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<ClientManagement />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App