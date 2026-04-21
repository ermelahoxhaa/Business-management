import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const navigate = useNavigate()

  
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
      
     
      <div className="text-lg font-semibold text-gray-800">
        Business-Management
      </div>

      
      <nav className="flex gap-6 text-gray-600">
        <Link to="/home" className="hover:text-black transition">
          Home
        </Link>
        <Link to="/about" className="hover:text-black transition">
          About Us
        </Link>
        <Link to="/projects" className="hover:text-black transition">
          Projects
        </Link>
        <Link to="/tasks" className="hover:text-black transition">
          Tasks
        </Link>
      </nav>

      
      <div>
        {!isLoggedIn ? (
          <button
            onClick={() => navigate('/login')}
            className="
              px-4 py-2 rounded-md
              bg-gray-800 text-white
              hover:bg-gray-900 hover:shadow-md
              transition duration-200
              active:scale-95
            "
          >
            Login / Sign Up
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="
              px-4 py-2 rounded-md
              bg-gray-800 text-white
              hover:bg-gray-900 hover:shadow-md
              transition duration-200
              active:scale-95
            "
          >
            Logout
          </button>
        )}
      </div>
    </header>
  )
}