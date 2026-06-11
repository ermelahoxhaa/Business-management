import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationPanel from '../components/Notification'
import {
  getActivityStats,
  getClients,
  getEmployees,
  getProjects,
  getTasks
} from '../services/api'
import { unwrapList } from '../utils/listResponse'
import { logout, getUserRole } from '../services/auth'

const statCardClass =
  'rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5'

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activityStats, setActivityStats] = useState({
    recentCount: 0,
    todayCount: 0,
    activeUsers: 0,
    scope: 'personal'
  })
  const [employeeCount, setEmployeeCount] = useState(0)
  const [clientCount, setClientCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [role, setRole] = useState('')
  const [activeSection, setActiveSection] = useState('overview')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentRole = getUserRole()
        setRole(currentRole)

        const requests = [
          getProjects({ limit: 500 }),
          getTasks({ limit: 500 }),
          getActivityStats()
        ]

        if (currentRole === 'admin') {
          requests.push(getEmployees({ limit: 1 }), getClients({ limit: 1 }))
        }

        const results = await Promise.all(requests)
        const [projectsRes, tasksRes, activityRes, employeesRes, clientsRes] = results

        setProjects(unwrapList(projectsRes).items)
        setTasks(unwrapList(tasksRes).items)
        setActivityStats(activityRes.data || {
          recentCount: 0,
          todayCount: 0,
          activeUsers: 0,
          scope: currentRole === 'admin' ? 'platform' : 'personal'
        })

        if (currentRole === 'admin') {
          setEmployeeCount(unwrapList(employeesRes).meta.total || 0)
          setClientCount(unwrapList(clientsRes).meta.total || 0)
        }
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Unable to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const totalProjects = projects.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date() && task.status !== 'done'
  }).length

  const statCards = useMemo(() => {
    const baseCards = [
      { label: 'Projects', value: totalProjects, icon: '📁', color: 'from-sky-500/10 to-sky-400/10' },
      { label: 'Tasks', value: totalTasks, icon: '✅', color: 'from-emerald-500/10 to-emerald-400/10' },
      { label: 'Completed', value: completedTasks, icon: '✔️', color: 'from-violet-500/10 to-violet-400/10' },
      { label: 'In Progress', value: inProgressTasks, icon: '⏳', color: 'from-amber-500/10 to-amber-400/10' },
      { label: 'Overdue', value: overdueTasks, icon: '⚠️', color: 'from-rose-500/10 to-rose-400/10' }
    ]

    if (role === 'admin') {
      return [
        ...baseCards,
        {
          label: 'Platform Activity (7d)',
          value: activityStats.recentCount,
          icon: '📈',
          color: 'from-cyan-500/10 to-cyan-400/10',
          hint: 'Recent actions across the system'
        },
        {
          label: 'Actions Today',
          value: activityStats.todayCount,
          icon: '⚡',
          color: 'from-indigo-500/10 to-indigo-400/10',
          hint: 'Platform usage today'
        },
        {
          label: 'Active Users (7d)',
          value: activityStats.activeUsers,
          icon: '👥',
          color: 'from-teal-500/10 to-teal-400/10',
          hint: 'Users with recent activity'
        },
        {
          label: 'Employees',
          value: employeeCount,
          icon: '🧑‍💼',
          color: 'from-fuchsia-500/10 to-fuchsia-400/10'
        },
        {
          label: 'Clients',
          value: clientCount,
          icon: '🏢',
          color: 'from-lime-500/10 to-lime-400/10'
        }
      ]
    }

    return [
      ...baseCards,
      {
        label: 'Your Activity (7d)',
        value: activityStats.recentCount,
        icon: '📈',
        color: 'from-cyan-500/10 to-cyan-400/10',
        hint: 'Your recent actions in the workspace'
      },
      {
        label: 'Your Actions Today',
        value: activityStats.todayCount,
        icon: '⚡',
        color: 'from-indigo-500/10 to-indigo-400/10',
        hint: 'Actions you performed today'
      }
    ]
  }, [
    role,
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    activityStats,
    employeeCount,
    clientCount
  ])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
        <div className="text-lg font-medium text-slate-200">Loading dashboard…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100 shadow-2xl backdrop-blur-xl">
          <h1 className="text-2xl font-semibold">Dashboard Error</h1>
          <p className="mt-3 text-sm leading-6 text-red-100">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quick links</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Open a section to manage data, forms, and search results.
              </p>
            </div>

            <nav className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className={`block w-full rounded-3xl border px-4 py-3 text-left text-sm font-medium transition ${
                  activeSection === 'overview'
                    ? 'border-sky-500/30 bg-slate-800 text-white'
                    : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="mr-2">📊</span> Dashboard Overview
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('notifications')}
                className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left text-sm font-medium transition ${
                  activeSection === 'notifications'
                    ? 'border-sky-500/30 bg-slate-800 text-white'
                    : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span><span className="mr-2">🔔</span> Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {[
                { label: 'Client Management', icon: '🏠', path: '/client' },
                { label: 'Invoice Management', icon: '💰', path: '/invoices' },
                { label: 'Projects', icon: '📁', path: '/projects' },
                { label: 'Tasks', icon: '✅', path: '/tasks' },
                { label: 'Reports', icon: '📈', path: '/reports' },
                ...(role === 'admin' || role === 'team_leader'
                  ? [{ label: role === 'admin' ? 'Employees' : 'My Team', icon: '👥', path: '/employees' }]
                  : []),
                { label: 'Settings', icon: '⚙️', path: '/settings' }
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="block rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                >
                  <span className="mr-2">{item.icon}</span> {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Logout
            </button>
          </aside>

          <main className="space-y-6">
            {activeSection === 'overview' && (
              <>
                <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">
                    {role === 'admin' ? 'Admin Dashboard' : 'Team Leader Dashboard'}
                  </p>
                  <h1 className="mt-4 text-4xl font-semibold text-white">
                    {role === 'admin' ? 'Business overview' : 'Team workflow overview'}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm text-slate-300">
                    {role === 'admin'
                      ? 'High-level statistics for projects, tasks, clients, employees, and recent platform activity.'
                      : 'Track your team metrics and recent workspace activity. Open Projects or Tasks for full lists and forms.'}
                  </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {statCards.map((item) => (
                    <div key={item.label} className={statCardClass}>
                      <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.color} px-3 py-2 text-sm font-semibold text-slate-900`}>
                        {item.icon}
                      </div>
                      <p className="mt-5 text-sm text-slate-400">{item.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                      {item.hint && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">{item.hint}</p>
                      )}
                    </div>
                  ))}
                </section>
              </>
            )}

            <section
              className={`rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 ${
                activeSection === 'notifications' ? '' : 'hidden'
              }`}
            >
              <NotificationPanel
                showAdminSend={role === 'admin'}
                onUnreadCountChange={setUnreadCount}
              />
            </section>
          </main>
        </section>
      </div>
    </div>
  )
}
