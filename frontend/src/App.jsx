import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App