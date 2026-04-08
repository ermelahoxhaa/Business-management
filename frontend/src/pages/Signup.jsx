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

  // Password validation function
  const isStrongPassword = (password) => {
    // At least 8 chars with upper, lower, number, and any non-alphanumeric symbol.
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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8"
      >
        <h2 className="text-center text-2xl font-semibold text-stone-800">Create Account</h2>
        <p className="text-center text-sm text-stone-600">
          Start with a secure account for your workspace.
        </p>

        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
          required
        />

        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
          required
        />

        <input
          name="email"
          type="email"
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

        <input
          type="password"
          name="confirm"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-stone-100 transition duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-zinc-700 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}