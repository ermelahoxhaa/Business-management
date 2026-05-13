import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProjects, getTasks, updateTask } from '../services/api'
import { getCurrentUser, logout } from '../services/auth'

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const statusStyles = {
  todo: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-sky-100 text-sky-700',
  done: 'bg-emerald-100 text-emerald-700'
}

const priorityStyles = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700'
}

const isOverdue = (task) => {
  if (!task.due_date || task.status === 'done') return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate < today
}

export default function EmployeeHome() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)

  const loadEmployeeData = async () => {
    setLoading(true)
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        getTasks(),
        getProjects()
      ])
      setTasks(tasksResponse.data || [])
      setProjects(projectsResponse.data || [])
    } catch (err) {
      console.error(err)
      setFeedback(err.response?.data?.message || 'Unable to load your work right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployeeData()
  }, [])

  const employeeTasks = useMemo(() => {
    return tasks.filter((task) => Number(task.assigned_to) === Number(currentUser?.id))
  }, [tasks, currentUser?.id])

  const projectById = useMemo(() => {
    return projects.reduce((map, project) => {
      map[project.id] = project
      return map
    }, {})
  }, [projects])

  const employeeProjects = useMemo(() => {
    const grouped = employeeTasks.reduce((map, task) => {
      if (!task.project_id) return map

      if (!map[task.project_id]) {
        map[task.project_id] = []
      }

      map[task.project_id].push(task)
      return map
    }, {})

    return Object.entries(grouped).map(([projectId, projectTasks]) => {
      const completed = projectTasks.filter((task) => task.status === 'done').length
      const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0

      return {
        project: projectById[Number(projectId)],
        projectId: Number(projectId),
        total: projectTasks.length,
        completed,
        progress
      }
    })
  }, [employeeTasks, projectById])

  const summary = {
    assigned: employeeTasks.length,
    completed: employeeTasks.filter((task) => task.status === 'done').length,
    inProgress: employeeTasks.filter((task) => task.status === 'in_progress').length,
    overdue: employeeTasks.filter(isOverdue).length
  }

  const getProjectName = (projectId) => {
    return projectById[projectId]?.name || 'Unknown Project'
  }

  const handleStatusChange = async (taskId, status) => {
    setUpdatingTaskId(taskId)
    setFeedback('')

    try {
      await updateTask(taskId, { status })
      await loadEmployeeData()
      setFeedback('Task status updated successfully.')
    } catch (err) {
      console.error(err)
      setFeedback(err.response?.data?.message || 'Unable to update task status.')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || 'Employee'

  const recentTasks = [...employeeTasks]
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.updated_at || a.due_date || 0)
      const bDate = new Date(b.created_at || b.updated_at || b.due_date || 0)
      return bDate - aDate
    })
    .slice(0, 5)

  const sortedProjects = [...employeeProjects].sort((a, b) => b.progress - a.progress).slice(0, 4)

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
        <div className="text-stone-100 text-lg font-medium">Loading dashboard…</div>
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
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Employee Dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Welcome back, {fullName}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Track your tasks, monitor project progress, and stay updated with your work.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">My projects</p>
                <p className="mt-2 text-3xl font-semibold text-white">{employeeProjects.length}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">My tasks</p>
                <p className="mt-2 text-3xl font-semibold text-white">{summary.assigned}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quick links</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Navigate directly to your workspace tools.</p>
            </div>

            <nav className="space-y-3">
              {[
                { label: 'My Dashboard', icon: '📊', path: '/home' },
                { label: 'My Tasks', icon: '✅', path: '/tasks' },
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
                { label: 'Assigned', value: summary.assigned, color: 'from-sky-500/10 to-sky-400/10', icon: '📋' },
                { label: 'Completed', value: summary.completed, color: 'from-emerald-500/10 to-emerald-400/10', icon: '✔️' },
                { label: 'In Progress', value: summary.inProgress, color: 'from-amber-500/10 to-amber-400/10', icon: '⏳' },
                { label: 'Overdue', value: summary.overdue, color: 'from-rose-500/10 to-rose-400/10', icon: '⚠️' }
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
                    <h2 className="text-2xl font-semibold text-white">My recent tasks</h2>
                    <p className="mt-2 text-sm text-slate-400">Latest activity on your assigned tasks.</p>
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
                    No tasks assigned yet. Check back later for new assignments.
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
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[task.status] || 'bg-slate-700 text-slate-100'}`}>
                              {statusOptions.find((option) => option.value === task.status)?.label || 'Unknown'}
                            </span>
                            {updatingTaskId === task.id && (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"></div>
                            )}
                          </div>
                        </div>
                        {task.status !== 'done' && (
                          <div className="mt-3 flex gap-2">
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleStatusChange(task.id, option.value)}
                                disabled={updatingTaskId === task.id}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                  task.status === option.value
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Project progress</h2>
                    <p className="mt-2 text-sm text-slate-400">Your active projects and completion status.</p>
                  </div>
                </div>

                {sortedProjects.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-800 bg-slate-900/90 p-8 text-center text-slate-400">
                    No project assignments yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {sortedProjects.map(({ project, projectId, total, completed, progress }) => (
                      <div key={projectId} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{project?.name || 'Unknown Project'}</p>
                            <p className="text-sm text-slate-400">{completed}/{total} completed</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-200">{progress}%</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-2.5 rounded-full bg-sky-400" style={{ width: `${progress}%` }} />
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
                <p className="mt-2 text-sm text-slate-400">Updates and reminders for your work.</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="font-semibold text-white">Task updates</p>
                    <p className="mt-2 text-sm text-slate-400">You'll receive notifications when tasks are assigned or updated.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="font-semibold text-white">Project deadlines</p>
                    <p className="mt-2 text-sm text-slate-400">Stay informed about upcoming project milestones.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/5">
                <h2 className="text-2xl font-semibold text-white">Quick actions</h2>
                <p className="mt-2 text-sm text-slate-400">Common tasks you can perform.</p>
                <div className="mt-6 space-y-3">
                  <Link
                    to="/tasks"
                    className="block rounded-3xl bg-sky-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-400"
                  >
                    View My Tasks
                  </Link>
                  <Link
                    to="/settings"
                    className="block rounded-3xl border border-slate-800 bg-slate-900/90 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    Update Profile
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  )
}
