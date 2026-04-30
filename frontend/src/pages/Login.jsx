import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { isAuthenticated, getUserRole, setAuthData } from '../services/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole()
      if (role === 'admin' || role === 'team_leader') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await loginUser(form)

      setAuthData(res.data.token, res.data.user, res.data.role)

      if (res.data.role === 'admin' || res.data.role === 'team_leader') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8"
      >
        <h2 className="text-center text-2xl font-semibold text-stone-800">Welcome Back</h2>
        <p className="text-center text-sm text-stone-600">Login to continue to your dashboard.</p>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-stone-100 transition duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
        >
          Login
        </button>

        <p className="text-center text-sm text-stone-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-zinc-700 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}