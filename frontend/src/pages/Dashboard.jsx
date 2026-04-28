import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProjects, getTasks, signupUser } from '../services/api'
import { logout } from '../services/auth'

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
  const [employeeForm, setEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'employee',
    department: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([getProjects(), getTasks()])
        setProjects(projectsRes.data || [])
        setTasks(tasksRes.data || [])
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

  const handleEmployeeChange = (e) => {
    setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    try {
      await signupUser(employeeForm)
      alert('Employee added successfully!')
      setEmployeeForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'employee',
        department: ''
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee')
    }
  }

  const handleLogout = () => {
    logout()
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
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center text-red-800 shadow-xl">
          <h1 className="text-2xl font-semibold">Dashboard Error</h1>
          <p className="mt-3 text-sm leading-6">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-slate-200/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-200/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 xl:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Quick navigation inside the dashboard area.</p>
          </div>

          <nav className="space-y-2">
            {[
              { label: 'Dashboard Overview', icon: '📊' },
              { label: 'Project Management', icon: '📁' },
              { label: 'Task Management', icon: '✅' },
              { label: 'Employee Management', icon: '👥' },
              { label: 'Notifications', icon: '🔔' },
              { label: 'Settings', icon: '⚙️' }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-800 transition hover:border-red-300 hover:bg-red-100"
            >
              🚪 Logout
            </button>
          </nav>
        </aside>

        <main className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">Dashboard overview</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Business Management Summary</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Monitor active projects, task progress, and overdue work from one place. This page is built for business and task tracking.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Projects</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{totalProjects}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Projects</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{totalProjects}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Tasks</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{totalTasks}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{completedTasks}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Tasks In Progress</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{inProgressTasks}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Overdue Tasks</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{overdueTasks}</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Recent Tasks</h2>
                  <p className="mt-2 text-sm text-slate-500">A quick look at the newest tasks in your system.</p>
                </div>
                <Link
                  to="/tasks"
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  View all tasks
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                  No recent tasks yet. Add tasks from the Tasks page to begin tracking work.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{task.title || 'Untitled task'}</p>
                          <p className="text-sm text-slate-500">{getProjectName(task.project_id)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[task.status] || 'bg-slate-100 text-slate-800'}`}>
                          {statusLabels[task.status] || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Project Progress</h2>
                  <p className="mt-2 text-sm text-slate-500">A summary of project completion rates.</p>
                </div>
                <Link
                  to="/projects"
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  View projects
                </Link>
              </div>

              {sortedProjects.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                  No project progress available yet. Start by creating a project and assigning tasks.
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProjects.map((project) => (
                    <div key={project.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{project.name}</p>
                          <p className="text-sm text-slate-500">{project.complete}/{project.total} completed</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{project.progress}%</span>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-2.5 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
              <p className="mt-2 text-sm text-slate-500">Placeholder notifications for system updates.</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">System status</p>
                  <p className="mt-2 text-sm text-slate-600">No new updates. Your project and task pages are synchronized.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Task reminders</p>
                  <p className="mt-2 text-sm text-slate-600">Overdue tasks will appear here once you have active assignments.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Employee Management</h2>
              <p className="mt-2 text-sm text-slate-500">Add new employees to the system.</p>

              <form onSubmit={handleAddEmployee} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={employeeForm.first_name}
                    onChange={handleEmployeeChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={employeeForm.last_name}
                    onChange={handleEmployeeChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={employeeForm.email}
                  onChange={handleEmployeeChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={employeeForm.password}
                  onChange={handleEmployeeChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  required
                />
                <select
                  name="role"
                  value={employeeForm.role}
                  onChange={handleEmployeeChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                >
                  <option value="employee">Employee</option>
                </select>
                <input
                  type="text"
                  name="department"
                  placeholder="Department (optional)"
                  value={employeeForm.department}
                  onChange={handleEmployeeChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Add Employee
                </button>
              </form>
            </div>
          </section>

          {(totalProjects === 0 || totalTasks === 0) && (
            <section className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-700">
              <h2 className="text-xl font-semibold text-slate-900">No projects or tasks yet</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your dashboard is ready. Add a project or task to begin tracking work across the system.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/projects"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create Project
                </Link>
                <Link
                  to="/tasks"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Create Task
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
