import { useEffect, useMemo, useState } from 'react'
import { getProjects, getTasks, updateTask } from '../services/api'
import { getCurrentUser } from '../services/auth'

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
  const currentUser = getCurrentUser()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [taskFilter, setTaskFilter] = useState('all')

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

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return employeeTasks
    return employeeTasks.filter((task) => task.status === taskFilter)
  }, [employeeTasks, taskFilter])

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

  const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || 'Employee'

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-10 sm:px-6">
        <div className="text-white">Loading your work...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Employee dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Good to see you, {fullName}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Your personal workspace for tasks, projects and progress tracking.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Current role</p>
                <p className="mt-2 text-xl font-semibold text-white">Employee</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Next review</p>
                <p className="mt-2 text-xl font-semibold text-white">In 2 weeks</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Assigned', summary.assigned, 'bg-sky-500/10 text-sky-300'],
              ['Completed', summary.completed, 'bg-emerald-500/10 text-emerald-300'],
              ['In Progress', summary.inProgress, 'bg-amber-500/10 text-amber-300'],
              ['Overdue', summary.overdue, 'bg-rose-500/10 text-rose-300']
            ].map(([label, value, style]) => (
              <div key={label} className={`rounded-3xl p-5 ring-1 ring-white/10 ${style}`}>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-300">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {feedback && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-xl">
            {feedback}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white/95 p-6 shadow-xl ring-1 ring-slate-200/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">My Tasks</h2>
                  <p className="mt-2 text-sm text-slate-500">Filter tasks by status and update progress quickly.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'todo', 'in_progress', 'done'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTaskFilter(status)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${taskFilter === status ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'}`}
                    >
                      {status === 'all' ? 'All' : statusOptions.find((item) => item.value === status)?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="rounded-[2rem] bg-white/95 p-8 text-center text-slate-600 shadow-xl ring-1 ring-slate-200/10">
                No tasks match this filter.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map((task) => (
                  <article key={task.id} className="overflow-hidden rounded-[2rem] bg-white/95 p-6 shadow-xl ring-1 ring-slate-200/10">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-slate-900">{task.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{task.description || 'No description provided.'}</p>

                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Project: {getProjectName(task.project_id)}</span>
                          <span className={`rounded-full px-3 py-1 text-sm ${statusStyles[task.status] || 'bg-slate-100 text-slate-700'}`}>
                            {statusOptions.find((option) => option.value === task.status)?.label || task.status}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-sm ${priorityStyles[task.priority] || 'bg-slate-100 text-slate-700'}`}>
                            {priorityLabels[task.priority] || task.priority}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                            Due: {task.due_date ? task.due_date.slice(0, 10) : 'No due date'}
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
                        <select
                          value={task.status}
                          disabled={updatingTaskId === task.id}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500">Update task status instantly.</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white/95 p-6 shadow-xl ring-1 ring-slate-200/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Project health</h2>
                  <p className="mt-2 text-sm text-slate-500">Overview of your active projects and their completion status.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {employeeProjects.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">No project data available yet.</div>
                ) : (
                  employeeProjects.map(({ project, projectId, total, completed, progress }) => (
                    <div key={projectId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{project?.name || 'Unknown Project'}</h3>
                          <p className="mt-1 text-sm text-slate-500">{project?.description || 'No description available.'}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{progress}%</span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{total} task{total === 1 ? '' : 's'}</span>
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{completed} complete</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/95 p-6 shadow-xl ring-1 ring-slate-200/10">
              <h2 className="text-2xl font-semibold text-slate-900">Updates</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">No overdue items</p>
                  <p className="mt-2 text-sm text-slate-500">All of your tasks are currently within their deadlines.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Keep momentum</p>
                  <p className="mt-2 text-sm text-slate-500">Update task statuses as you complete work to keep your progress up to date.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
