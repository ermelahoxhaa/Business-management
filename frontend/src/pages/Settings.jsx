import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  changePassword,
  getAccountSettings,
  getCompanySettings,
  updateCompanySettings,
  updateNotificationPreferences,
  updateProfile
} from '../services/api'
import {
  clearAuthData,
  getCurrentUser,
  getSettingsHomeRoute,
  getUserRole,
  updateStoredUser
} from '../services/auth'

const roleLabels = {
  admin: 'Admin',
  team_leader: 'Team Leader',
  employee: 'Employee'
}

const formatPermission = (code) =>
  code
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .join(' · ')

export default function Settings() {
  const navigate = useNavigate()
  const role = getUserRole()
  const [accountUser, setAccountUser] = useState(getCurrentUser())
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [companySaving, setCompanySaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    task_updates: true,
    project_updates: true
  })
  const [companyForm, setCompanyForm] = useState({ company_name: '' })

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
  }

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAccountSettings()
      const { user, permissions: userPermissions, preferences: savedPreferences } = response.data

      setAccountUser(user)
      setPermissions(userPermissions || [])
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      })
      setPreferences({
        email_notifications: savedPreferences?.email_notifications ?? true,
        task_updates: savedPreferences?.task_updates ?? true,
        project_updates: savedPreferences?.project_updates ?? role !== 'employee'
      })

      if (role === 'admin') {
        const companyResponse = await getCompanySettings()
        setCompanyForm({
          company_name: companyResponse.data?.company_name || ''
        })
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Unable to load settings.', 'error')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)

    try {
      const response = await updateProfile(profileForm)
      const updatedUser = response.data.user
      updateStoredUser(updatedUser)
      setAccountUser(updatedUser)
      showMessage(response.data.message || 'Profile updated successfully.')
    } catch (err) {
      showMessage(err.response?.data?.message || 'Unable to update profile.', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New password and confirmation do not match.', 'error')
      return
    }

    setPasswordSaving(true)

    try {
      const response = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      showMessage(response.data.message || 'Password updated successfully. Please sign in again.')
      clearAuthData()
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      showMessage(err.response?.data?.message || 'Unable to change password.', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault()
    setPreferencesSaving(true)

    try {
      const response = await updateNotificationPreferences(preferences)
      setPreferences(response.data.preferences)
      showMessage(response.data.message || 'Notification preferences saved.')
    } catch (err) {
      showMessage(err.response?.data?.message || 'Unable to save preferences.', 'error')
    } finally {
      setPreferencesSaving(false)
    }
  }

  const handleCompanySubmit = async (e) => {
    e.preventDefault()
    setCompanySaving(true)

    try {
      await updateCompanySettings({
        company_name: companyForm.company_name.trim()
      })
      showMessage('Company settings saved.')
    } catch (err) {
      showMessage(err.response?.data?.message || 'Unable to save company settings.', 'error')
    } finally {
      setCompanySaving(false)
    }
  }

  const preferenceOptions = [
    ['email_notifications', 'Email notifications'],
    ['task_updates', 'Task updates'],
    ...(role !== 'employee' ? [['project_updates', 'Project updates']] : [])
  ]

  const backRoute = getSettingsHomeRoute(role)

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 text-sm text-slate-300">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <Link
          to={backRoute}
          aria-label="Back to workspace"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg shadow-slate-950/20 transition hover:border-sky-400/40 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Settings</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Account Settings</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Update your profile, password, and notification preferences. Admin users can also manage company settings.
          </p>
        </section>

        {message && (
          <div
            className={`rounded-3xl border p-4 text-sm shadow-xl ${
              messageType === 'error'
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-100'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
            }`}
          >
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
                  <span className="font-medium text-white">{accountUser?.first_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-700 pb-3">
                  <span className="text-slate-400">Last name</span>
                  <span className="font-medium text-white">{accountUser?.last_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-700 pb-3">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-white">{accountUser?.email || '-'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Role</span>
                  <span className="font-medium text-white">{roleLabels[role] || role || '-'}</span>
                </div>
              </div>
            </div>

            {(role === 'admin' || role === 'team_leader') && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
                <h2 className="text-2xl font-semibold text-white">Your Access</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Permissions assigned to your {roleLabels[role]?.toLowerCase()} role.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {permissions.length ? (
                    permissions.map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-200"
                      >
                        {formatPermission(permission)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No permissions loaded.</span>
                  )}
                </div>
              </div>
            )}
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
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Last Name</label>
                  <input
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    required
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
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Security</h2>
              <p className="mt-2 text-sm text-slate-400">
                Use at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    autoComplete="current-password"
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
                      required
                      autoComplete="new-password"
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
                      required
                      autoComplete="new-password"
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordSaving}
                className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
              >
                {passwordSaving ? 'Updating...' : 'Change Password'}
              </button>
            </form>

            {role === 'admin' && (
              <form onSubmit={handleCompanySubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
                <h2 className="text-2xl font-semibold text-white">Company Settings</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Update the company name stored in the workspace.
                </p>
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Company name</label>
                  <input
                    name="company_name"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ company_name: e.target.value })}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={companySaving}
                  className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {companySaving ? 'Saving...' : 'Save Company Settings'}
                </button>
              </form>
            )}

            <form onSubmit={handlePreferencesSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
              <h2 className="text-2xl font-semibold text-white">Notification Preferences</h2>
              <p className="mt-2 text-sm text-slate-400">
                Saved to your account and used for notification delivery preferences.
              </p>
              <div className="mt-6 grid gap-3">
                {preferenceOptions.map(([name, label]) => (
                  <label
                    key={name}
                    className="flex cursor-pointer items-center justify-between rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 transition hover:border-sky-500"
                  >
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
                disabled={preferencesSaving}
                className="mt-6 rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
              >
                {preferencesSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
