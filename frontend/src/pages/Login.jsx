import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { isAuthenticated, getUserRole, setAuthData, getDefaultRouteForRole } from '../services/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getDefaultRouteForRole(getUserRole()), { replace: true })
    }
  }, [navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await loginUser(form)
      const accessToken = res.data.accessToken || res.data.token
      setAuthData(accessToken, res.data.user, res.data.role, res.data.refreshToken)
      navigate(getDefaultRouteForRole(res.data.role), { replace: true })
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-slate-950 px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col justify-center">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Welcome back</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Sign in to your workspace</h2>
          <p className="mt-2 text-sm text-slate-400">Use your account to access the dashboard and team tools.</p>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
