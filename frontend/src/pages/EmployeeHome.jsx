import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  PlayCircle,
  UserRound
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMyProjects, getMyTasks, getProjects, getTasks, updateMyTaskStatus } from '../services/api'
import { getCurrentUser, logout } from '../services/auth'

const statusLabels = {
  todo: 'Pending',
  in_progress: 'In Progress',
  done: 'Completed'
}

const statusClasses = {
  todo: 'bg-amber-100 text-amber-800 ring-amber-200',
  in_progress: 'bg-sky-100 text-sky-800 ring-sky-200',
  done: 'bg-emerald-100 text-emerald-800 ring-emerald-200'
}

const priorityClasses = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200'
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const formatDate = (date) => {
  if (!date) return 'No due date'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const startOfDay = (date = new Date()) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const isDueToday = (task) => {
  if (!task.due_date || task.status === 'done') return false
  return startOfDay(task.due_date).getTime() === startOfDay().getTime()
}

const isOverdue = (task) => {
  if (!task.due_date || task.status === 'done') return false
  return startOfDay(task.due_date) < startOfDay()
}

const isUpcoming = (task) => {
  if (!task.due_date || task.status === 'done') return false
  const dueDate = startOfDay(task.due_date)
  const today = startOfDay()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  return dueDate > today && dueDate <= nextWeek
}

const getNextStatus = (status) => {
  if (status === 'todo') return 'in_progress'
  if (status === 'in_progress') return 'done'
  return null
}

export default function EmployeeHome() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [taskFilter, setTaskFilter] = useState('all')

  const loadEmployeeData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        getMyTasks().catch(() => getTasks()),
        getMyProjects().catch(() => getProjects())
      ])

      const loadedTasks = tasksResponse.data || []
      const employeeTasks = loadedTasks.filter((task) => Number(task.assigned_to) === Number(currentUser?.id))
      const scopedTasks = tasksResponse.config?.url === '/tasks/my-tasks' ? loadedTasks : employeeTasks
      const scopedProjectIds = new Set(scopedTasks.map((task) => Number(task.project_id)))
      const loadedProjects = projectsResponse.data || []

      setTasks(scopedTasks)
      setProjects(loadedProjects.filter((project) => scopedProjectIds.has(Number(project.id))))
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Unable to load your workspace right now.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    loadEmployeeData()
  }, [loadEmployeeData])

  const projectById = useMemo(() => {
    return projects.reduce((map, project) => {
      map[Number(project.id)] = project
      return map
    }, {})
  }, [projects])

  const summary = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in_progress').length,
      completed: tasks.filter((task) => task.status === 'done').length,
      overdue: tasks.filter(isOverdue).length
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return tasks
    if (taskFilter === 'overdue') return tasks.filter(isOverdue)
    return tasks.filter((task) => task.status === taskFilter)
  }, [tasks, taskFilter])

  const deadlineGroups = useMemo(() => {
    return {
      today: tasks.filter(isDueToday),
      upcoming: tasks.filter(isUpcoming).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)),
      overdue: tasks.filter(isOverdue).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    }
  }, [tasks])

  const projectSummaries = useMemo(() => {
    const grouped = tasks.reduce((map, task) => {
      if (!task.project_id) return map
      const projectId = Number(task.project_id)
      map[projectId] = map[projectId] || []
      map[projectId].push(task)
      return map
    }, {})

    return Object.entries(grouped).map(([projectId, projectTasks]) => {
      const completed = projectTasks.filter((task) => task.status === 'done').length
      const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0
      const project = projectById[Number(projectId)]

      return {
        id: Number(projectId),
        name: project?.name || 'Unknown Project',
        status: progress === 100 ? 'Completed' : progress > 0 ? 'Active' : 'Not Started',
        progress,
        tasks: projectTasks.length
      }
    })
  }, [projectById, tasks])

  const notifications = useMemo(() => {
    const newAssigned = tasks
      .filter((task) => task.status === 'todo')
      .slice(0, 2)
      .map((task) => ({
        id: `assigned-${task.id}`,
        title: 'New assigned task',
        message: task.title || 'Untitled task'
      }))

    const reminders = [...deadlineGroups.today, ...deadlineGroups.overdue].slice(0, 2).map((task) => ({
      id: `reminder-${task.id}`,
      title: isOverdue(task) ? 'Overdue reminder' : 'Due today',
      message: `${task.title || 'Untitled task'} - ${formatDate(task.due_date)}`
    }))

    return [...newAssigned, ...reminders].slice(0, 4)
  }, [deadlineGroups, tasks])

  const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || 'Employee'
  const firstName = currentUser?.first_name || fullName

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleStatusAdvance = async (task) => {
    const nextStatus = getNextStatus(task.status)
    if (!nextStatus) return

    setUpdatingTaskId(task.id)
    setNotice('')
    setError('')

    try {
      await updateMyTaskStatus(task.id, nextStatus)
      await loadEmployeeData()
      setNotice(`Task moved to ${statusLabels[nextStatus]}.`)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Unable to update task status.')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 text-white">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-sky-300" />
        Loading your employee workspace...
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400 text-slate-950">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{fullName}</p>
              <p className="truncate text-sm text-slate-400">Employee Workspace</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {[
              { label: 'Overview', icon: LayoutDashboard },
              { label: 'My Tasks', icon: ListChecks },
              { label: 'Deadlines', icon: CalendarClock },
              { label: 'Projects', icon: Briefcase },
              { label: 'Notifications', icon: Bell }
            ].map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={`#${item.label.toLowerCase().replace(' ', '-')}`}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm font-semibold text-white">Profile</p>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-300" />
                <span className="truncate">{currentUser?.email || 'No email available'}</span>
              </p>
              <p>Role: Employee</p>
              <p>Team: Not assigned yet</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="space-y-6">
          <section id="overview" className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Employee dashboard</p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Welcome back, {firstName}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Here is your work overview for today.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-5 ring-1 ring-white/10">
                <p className="text-sm text-slate-400">Today focus</p>
                <p className="mt-2 text-2xl font-semibold text-white">{deadlineGroups.today.length + summary.inProgress}</p>
                <p className="mt-1 text-sm text-slate-400">active or due today</p>
              </div>
            </div>

            {(error || notice) && (
              <div className={`mt-6 rounded-2xl p-4 text-sm ${error ? 'bg-rose-500/10 text-rose-100 ring-1 ring-rose-500/20' : 'bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/20'}`}>
                {error || notice}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total assigned', value: summary.total, icon: ListChecks, color: 'text-sky-300' },
              { label: 'Pending', value: summary.pending, icon: Clock3, color: 'text-amber-300' },
              { label: 'In progress', value: summary.inProgress, icon: PlayCircle, color: 'text-blue-300' },
              { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: 'text-emerald-300' },
              { label: 'Overdue', value: summary.overdue, icon: AlertTriangle, color: 'text-rose-300' }
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-xl">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <p className="mt-4 text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              )
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <div id="my-tasks" className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">My Tasks</h2>
                  <p className="mt-1 text-sm text-slate-500">Advance your own work from pending to in progress, then completed.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['all', 'All'],
                    ['todo', 'Pending'],
                    ['in_progress', 'In Progress'],
                    ['done', 'Completed'],
                    ['overdue', 'Overdue']
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTaskFilter(value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${taskFilter === value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  {tasks.length === 0 ? 'No tasks assigned yet.' : 'No tasks match this view.'}
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                  <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                    <span>Task</span>
                    <span>Project</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span>Due date</span>
                    <span>Action</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {filteredTasks.map((task) => {
                      const nextStatus = getNextStatus(task.status)
                      return (
                        <article key={task.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr] lg:items-center">
                          <div>
                            <p className="font-semibold text-slate-950">{task.title || 'Untitled task'}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{task.description || 'No description provided.'}</p>
                          </div>
                          <p className="text-sm text-slate-600">{projectById[Number(task.project_id)]?.name || 'No project'}</p>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityClasses[task.priority] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                            {priorityLabels[task.priority] || 'Medium'}
                          </span>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses[task.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                            {statusLabels[task.status] || 'Pending'}
                          </span>
                          <p className={`text-sm ${isOverdue(task) ? 'font-semibold text-rose-600' : 'text-slate-600'}`}>{formatDate(task.due_date)}</p>
                          <button
                            type="button"
                            disabled={!nextStatus || updatingTaskId === task.id}
                            onClick={() => handleStatusAdvance(task)}
                            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            {updatingTaskId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDot className="h-4 w-4" />}
                            {nextStatus ? statusLabels[nextStatus] : 'Done'}
                          </button>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <section id="deadlines" className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-white">Today's Work</h2>
                <div className="mt-5 space-y-4">
                  <DeadlineList title="Due today" tasks={deadlineGroups.today} empty="No tasks due today." projectById={projectById} />
                  <DeadlineList title="Upcoming deadlines" tasks={deadlineGroups.upcoming.slice(0, 4)} empty="No upcoming deadlines." projectById={projectById} />
                  <DeadlineList title="Overdue tasks" tasks={deadlineGroups.overdue.slice(0, 4)} empty="No overdue tasks." projectById={projectById} danger />
                </div>
              </section>

              <section id="notifications" className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-white">Notifications</h2>
                <div className="mt-5 space-y-3">
                  {notifications.length === 0 ? (
                    <p className="rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-400">You have no new notifications.</p>
                  ) : (
                    notifications.map((item) => (
                      <div key={item.id} className="rounded-3xl bg-slate-950/70 p-4 ring-1 ring-white/10">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </aside>
          </section>

          <section id="projects" className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Project Preview</h2>
                <p className="mt-1 text-sm text-slate-400">Projects connected to your assigned tasks.</p>
              </div>
              <p className="text-sm text-slate-400">{projectSummaries.length} project{projectSummaries.length === 1 ? '' : 's'}</p>
            </div>

            {projectSummaries.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center text-slate-400">
                No project memberships found yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projectSummaries.map((project) => (
                  <article key={project.id} className="rounded-3xl bg-slate-950/70 p-5 ring-1 ring-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">{project.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{project.tasks} assigned task{project.tasks === 1 ? '' : 's'}</p>
                      </div>
                      <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-sky-400/20">{project.status}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold text-white">{project.progress}%</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-sky-400" style={{ width: `${project.progress}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function DeadlineList({ title, tasks, empty, projectById, danger = false }) {
  return (
    <div className="rounded-3xl bg-slate-950/70 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${danger ? 'bg-rose-400/10 text-rose-200' : 'bg-slate-800 text-slate-300'}`}>
          {tasks.length}
        </span>
      </div>
      <div className="mt-3 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">{empty}</p>
        ) : (
          tasks.map((task) => (
            <div key={`${title}-${task.id}`} className="border-t border-slate-800 pt-3">
              <p className="text-sm font-medium text-slate-200">{task.title || 'Untitled task'}</p>
              <p className="mt-1 text-xs text-slate-500">
                {projectById[Number(task.project_id)]?.name || 'No project'} - {formatDate(task.due_date)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
