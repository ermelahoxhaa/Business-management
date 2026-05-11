import { useState } from 'react'
import { getCurrentUser, getUserRole } from '../services/auth'

const roleLabels = {
  admin: 'Admin',
  team_leader: 'Team Leader',
  employee: 'Employee'
}

const roleSections = {
  admin: [
    'System preferences',
    'Company settings',
    'Role and permission settings',
    'Security settings'
  ],
  team_leader: [
    'Department and team preferences',
    'Notification preferences',
    'Security settings'
  ],
  employee: [
    'Notification preferences',
    'Security settings'
  ]
}

export default function Settings() {
  const currentUser = getCurrentUser()
  const role = getUserRole()
  const [profileForm, setProfileForm] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    email: currentUser?.email || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskUpdates: true,
    projectUpdates: role !== 'employee'
  })
  const [message, setMessage] = useState('')

  const handleProfileChange = (e) => {
    setProfileForm((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }))
  }

  const handlePreferenceChange = (e) => {
    setPreferences((current) => ({
      ...current,
      [e.target.name]: e.target.checked
    }))
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setMessage('Profile form is ready. Backend profile update endpoint is not available yet.')
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New password and confirmation do not match.')
      return
    }

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage('Password form is ready. Backend password update endpoint is not available yet.')
  }

  const handlePreferencesSubmit = (e) => {
    e.preventDefault()
    setMessage('Notification preferences saved for this session.')
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Settings</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Account Settings</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Manage your profile, account details, and preferences from one shared settings page.
          </p>
        </section>

        {message && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-xl">
            {message}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Account Information</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-700 pb-3">
                  <span className="text-slate-400">First name</span>
                  <span className="font-medium text-white">{currentUser?.first_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-700 pb-3">
                  <span className="text-slate-400">Last name</span>
                  <span className="font-medium text-white">{currentUser?.last_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-700 pb-3">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-white">{currentUser?.email || '-'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Role</span>
                  <span className="font-medium text-white">{roleLabels[role] || role || '-'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Role Sections</h2>
              <div className="mt-4 grid gap-3">
                {(roleSections[role] || []).map((section) => (
                  <div key={section} className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
                    {section} placeholder
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleProfileSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">First Name</label>
                  <input
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Last Name</label>
                  <input
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Save Profile
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Security</h2>
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Change Password
              </button>
            </form>

            <form onSubmit={handlePreferencesSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Notification Preferences</h2>
              <div className="mt-6 grid gap-3">
                {[
                  ['emailNotifications', 'Email notifications'],
                  ['taskUpdates', 'Task updates'],
                  ['projectUpdates', 'Project updates']
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center justify-between rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 cursor-pointer transition hover:border-sky-500">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      name={name}
                      checked={preferences[name]}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 accent-sky-500"
                    />
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
