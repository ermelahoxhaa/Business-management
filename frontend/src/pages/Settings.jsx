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
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <section className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-800">Account Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Manage your profile, account details, and preferences from one shared settings page.
          </p>
        </section>

        {message && (
          <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-4 text-sm text-stone-700 shadow-xl">
            {message}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-stone-800">Account Information</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-stone-200 pb-3">
                  <span className="text-stone-500">First name</span>
                  <span className="font-medium text-stone-800">{currentUser?.first_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-200 pb-3">
                  <span className="text-stone-500">Last name</span>
                  <span className="font-medium text-stone-800">{currentUser?.last_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-200 pb-3">
                  <span className="text-stone-500">Email</span>
                  <span className="font-medium text-stone-800">{currentUser?.email || '-'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Role</span>
                  <span className="font-medium text-stone-800">{roleLabels[role] || role || '-'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-stone-800">Role Sections</h2>
              <div className="mt-4 grid gap-3">
                {(roleSections[role] || []).map((section) => (
                  <div key={section} className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                    {section} placeholder
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-stone-800">Profile Settings</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">First Name</label>
                  <input
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Last Name</label>
                  <input
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-stone-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-5 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
              >
                Save Profile
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-stone-800">Security</h2>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-5 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
              >
                Change Password
              </button>
            </form>

            <form onSubmit={handlePreferencesSubmit} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-stone-800">Notification Preferences</h2>
              <div className="mt-5 grid gap-3">
                {[
                  ['emailNotifications', 'Email notifications'],
                  ['taskUpdates', 'Task updates'],
                  ['projectUpdates', 'Project updates']
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      name={name}
                      checked={preferences[name]}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 accent-zinc-800"
                    />
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="mt-5 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
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
