import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signupUser } from '../services/api'

export default function Signup() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirm) {
      alert('Passwords do not match')
      return
    }

    const password = form.password.trim()

    if (!isStrongPassword(password)) {
      alert(
        'Password is too weak! Use at least 8 characters, including uppercase, lowercase, number, and special character.'
      )
      return
    }

    try {
      await signupUser({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password,
      })

      alert('User created successfully!')
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm: ''
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed!')
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
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Create account</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Join the workspace</h2>
          <p className="mt-2 text-sm text-slate-400">Register a secure account to access the platform.</p>

          <div className="mt-6 space-y-4">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />

            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />

            <input
              name="email"
              type="email"
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

            <input
              type="password"
              name="confirm"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Sign Up
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-300 hover:text-sky-200">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
