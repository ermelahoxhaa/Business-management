import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProjects, getTasks } from '../services/api'
import { unwrapList } from '../utils/listResponse'
import { logout, getUserRole } from '../services/auth'

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Completed'
}

const statusClasses = {
  todo: 'bg-slate-100 text-slate-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-emerald-100 text-emerald-800'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          getProjects({ limit: 500 }),
          getTasks({ limit: 500 })
        ])
        setProjects(unwrapList(projectsRes).items)
        setTasks(unwrapList(tasksRes).items)
        setRole(getUserRole())
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
    const dueDate = new Date(task.due_date)
    return dueDate < new Date() && task.status !== 'done'
  }).length

  const projectSummaries = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project_id === project.id)
    const total = projectTasks.length
    const complete = projectTasks.filter((task) => task.status === 'done').length
    const progress = total ? Math.round((complete / total) * 100) : 0
    return {
      id: project.id,
      name: project.name,
      total,
      complete,
      progress
    }
  })

  const sortedProjects = [...projectSummaries].sort((a, b) => b.progress - a.progress).slice(0, 4)

  const recentTasks = [...tasks]
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.updated_at || a.due_date || 0)
      const bDate = new Date(b.created_at || b.updated_at || b.due_date || 0)
      return bDate - aDate
    })
    .slice(0, 5)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const getProjectName = (projectId) => {
    const project = projects.find((item) => item.id === projectId)
    return project ? project.name : 'No project'
  }

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
        <div className="text-stone-100 text-lg font-medium">Loading dashboard…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 sm:px-6">
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
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">{role === 'admin' ? 'Admin Dashboard' : 'Team Leader Dashboard'}</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">{role === 'admin' ? 'Manage business operations' : 'Manage your team workflow'}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                {role === 'admin'
                  ? 'View key performance metrics, active projects, and task health in one place.'
                  : 'Track task progress and keep your team aligned with project goals.'
                }
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Projects live</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalProjects}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Tasks across the team</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalTasks}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quick links</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Navigate directly to the tools you use most.</p>
            </div>

            <nav className="space-y-3">
              {[
                { label: 'Dashboard Overview', icon: '📊', path: '/dashboard' },
                { label: 'Client Management', icon: '🏠', path: '/client' },
                { label: 'Invoice Management', icon: '💰', path: '/invoices' },
                { label: 'Projects', icon: '📁', path: '/projects' },
                { label: 'Tasks', icon: '✅', path: '/tasks' },
                { label: 'Reports', icon: '📈', path: '/reports' },
                { label: 'Employees', icon: '👥', path: '/employees' },
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
              🚪 Logout
            </button>
          </aside>

          <main className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Projects', value: totalProjects, color: 'from-sky-500/10 to-sky-400/10', icon: '📁' },
                { label: 'Tasks', value: totalTasks, color: 'from-emerald-500/10 to-emerald-400/10', icon: '✅' },
                { label: 'Completed', value: completedTasks, color: 'from-violet-500/10 to-violet-400/10', icon: '✔️' },
                { label: 'In Progress', value: inProgressTasks, color: 'from-amber-500/10 to-amber-400/10', icon: '⏳' },
                { label: 'Overdue', value: overdueTasks, color: 'from-rose-500/10 to-rose-400/10', icon: '⚠️' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
                  <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.color} px-3 py-2 text-sm font-semibold text-slate-900`}>{item.icon}</div>
                  <p className="mt-5 text-sm text-slate-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Recent tasks</h2>
                    <p className="mt-2 text-sm text-slate-400">Latest activity across the system.</p>
                  </div>
                  <Link
                    to="/tasks"
                    className="rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    View all tasks
                  </Link>
                </div>

                {recentTasks.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-800 bg-slate-900/90 p-8 text-center text-slate-400">
                    No recent tasks yet. Add tasks to begin tracking team activity.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">{task.title || 'Untitled task'}</p>
                            <p className="text-sm text-slate-400">{getProjectName(task.project_id)}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[task.status] || 'bg-slate-700 text-slate-100'}`}>
                            {statusLabels[task.status] || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Project progress</h2>
                    <p className="mt-2 text-sm text-slate-400">Where your strongest projects stand today.</p>
                  </div>
                  <Link
                    to="/projects"
                    className="rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    View projects
                  </Link>
                </div>

                {sortedProjects.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-800 bg-slate-900/90 p-8 text-center text-slate-400">
                    No project progress available yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {sortedProjects.map((project) => (
                      <div key={project.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{project.name}</p>
                            <p className="text-sm text-slate-400">{project.complete}/{project.total} completed</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-200">{project.progress}%</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-2.5 rounded-full bg-sky-400" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
                <h2 className="text-2xl font-semibold text-white">Notifications</h2>
                <p className="mt-2 text-sm text-slate-400">System alerts and quick updates.</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="font-semibold text-white">System status</p>
                    <p className="mt-2 text-sm text-slate-400">Everything is running smoothly at the moment.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="font-semibold text-white">Team reminders</p>
                    <p className="mt-2 text-sm text-slate-400">Overdue tasks will appear here once they exist.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
                <h2 className="text-2xl font-semibold text-white">Employee management</h2>
                <p className="mt-2 text-sm text-slate-400">Open the employee section to manage your team.</p>
                <Link
                  to="/employees"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                >
                  Open Employees
                </Link>
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  )
}
