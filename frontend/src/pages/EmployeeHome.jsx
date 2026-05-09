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

  const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || 'Employee'

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
        <div className="text-stone-100">Loading your work...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <section className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">Employee</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-800">Welcome, {fullName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Here you can view your assigned tasks and related projects.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Assigned Tasks', summary.assigned],
            ['Completed Tasks', summary.completed],
            ['In Progress Tasks', summary.inProgress],
            ['Overdue Tasks', summary.overdue]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-5 shadow-xl">
              <p className="text-sm text-stone-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-stone-800">{value}</p>
            </div>
          ))}
        </section>

        {feedback && (
          <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-4 text-sm text-stone-700 shadow-xl">
            {feedback}
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-stone-100">My Tasks</h2>

          {employeeTasks.length === 0 ? (
            <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 text-stone-600 shadow-xl">
              No tasks assigned yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {employeeTasks.map((task) => (
                <article key={task.id} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-800">{task.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">{task.description || 'No description provided.'}</p>
                    </div>

                    <select
                      value={task.status}
                      disabled={updatingTaskId === task.id}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 disabled:opacity-60 sm:w-44"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Project: {getProjectName(task.project_id)}</span>
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Status: {statusOptions.find((status) => status.value === task.status)?.label || task.status}</span>
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Priority: {priorityLabels[task.priority] || task.priority}</span>
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Due: {task.due_date ? task.due_date.slice(0, 10) : 'No due date'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-stone-100">My Projects</h2>

          {employeeProjects.length === 0 ? (
            <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 text-stone-600 shadow-xl">
              No projects assigned yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {employeeProjects.map(({ project, projectId, total, completed, progress }) => (
                <article key={projectId} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-stone-800">{project?.name || 'Unknown Project'}</h3>
                  <p className="mt-1 text-sm text-stone-600">{project?.description || 'No description provided.'}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">My Tasks: {total}</span>
                    <span className="rounded-full bg-green-200 px-3 py-1 text-green-700">Completed: {completed}</span>
                    <span className="rounded-full bg-zinc-200 px-3 py-1 text-zinc-700">Progress: {progress}%</span>
                  </div>

                  <div className="mt-4 h-2 w-full rounded-full bg-stone-200">
                    <div
                      className="h-2 rounded-full bg-zinc-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-stone-800">Notifications</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              New task assigned
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              Project deadline approaching
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
