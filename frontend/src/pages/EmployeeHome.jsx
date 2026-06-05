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
  MessageSquare,
  PlayCircle,
  Settings,
  UserRound,
  Zap
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationPanel from '../components/Notification'
import {
  createComment,
  getActivityStats,
  getComments,
  getMyEmployeeProfile,
  getMyProjects,
  getMyTasks,
  updateMyTaskStatus
} from '../services/api'
import { unwrapList } from '../utils/listResponse'
import { getCurrentUser, getRoleLabel, logout } from '../services/auth'

const statusLabels = {
  todo: 'To Do',
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

const formatCommentAuthor = (comment, currentUserId) => {
  if (Number(comment.user_id) === Number(currentUserId)) {
    return 'You'
  }

  const author = comment.User
  const name = [author?.first_name, author?.last_name].filter(Boolean).join(' ')
  return name || 'Team member'
}

const statCardClass =
  'rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'my-tasks', label: 'My Tasks', icon: ListChecks },
  { id: 'deadlines', label: 'Deadlines', icon: CalendarClock },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell }
]

export default function EmployeeHome() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const [activeSection, setActiveSection] = useState('overview')
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [taskFilter, setTaskFilter] = useState('all')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [commentsByTask, setCommentsByTask] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [commentLoadingId, setCommentLoadingId] = useState(null)
  const [savingCommentId, setSavingCommentId] = useState(null)
  const [activityStats, setActivityStats] = useState({ recentCount: 0, todayCount: 0 })
  const [unreadCount, setUnreadCount] = useState(0)

  const loadEmployeeData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [tasksResponse, projectsResponse, profileResponse, activityResponse] = await Promise.all([
        getMyTasks(),
        getMyProjects(),
        getMyEmployeeProfile().catch(() => ({ data: null })),
        getActivityStats().catch(() => ({ data: { recentCount: 0, todayCount: 0 } }))
      ])

      setTasks(unwrapList(tasksResponse).items)
      setProjects(projectsResponse.data || [])
      setProfile(profileResponse.data || null)
      setActivityStats(activityResponse.data || { recentCount: 0, todayCount: 0 })
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Unable to load your workspace right now.')
    } finally {
      setLoading(false)
    }
  }, [])

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

  const statCards = useMemo(() => [
    { label: 'My Projects', value: projects.length, icon: Briefcase, color: 'text-sky-300', hint: 'Projects linked to your tasks' },
    { label: 'Assigned Tasks', value: summary.total, icon: ListChecks, color: 'text-sky-300' },
    { label: 'To Do', value: summary.pending, icon: Clock3, color: 'text-amber-300' },
    { label: 'In Progress', value: summary.inProgress, icon: PlayCircle, color: 'text-blue-300' },
    { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: 'text-emerald-300' },
    { label: 'Overdue', value: summary.overdue, icon: AlertTriangle, color: 'text-rose-300' },
    { label: 'Due Today', value: deadlineGroups.today.length, icon: CalendarClock, color: 'text-orange-300', hint: 'Tasks due today' },
    { label: 'Upcoming (7d)', value: deadlineGroups.upcoming.length, icon: CircleDot, color: 'text-violet-300', hint: 'Deadlines in the next week' },
    { label: 'Your Activity (7d)', value: activityStats.recentCount, icon: Zap, color: 'text-cyan-300', hint: 'Your recent actions in the workspace' },
    { label: 'Actions Today', value: activityStats.todayCount, icon: Bell, color: 'text-indigo-300', hint: 'Actions you performed today' }
  ], [projects.length, summary, deadlineGroups, activityStats])

  const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || 'Employee'
  const firstName = currentUser?.first_name || fullName
  const roleLabel = getRoleLabel(profile?.role || 'employee')
  const departmentLabel = profile?.department_name || 'No department assigned'
  const positionLabel = profile?.position?.trim() || 'No position set'

  const handleLogout = async () => {
    await logout()
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

  const loadTaskComments = async (taskId) => {
    setCommentLoadingId(taskId)
    try {
      const response = await getComments(taskId)
      setCommentsByTask((current) => ({ ...current, [taskId]: response.data || [] }))
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Unable to load task comments.')
    } finally {
      setCommentLoadingId(null)
    }
  }

  const handleToggleComments = async (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
      return
    }

    setExpandedTaskId(taskId)
    if (!commentsByTask[taskId]) {
      await loadTaskComments(taskId)
    }
  }

  const handleCommentChange = (taskId, value) => {
    setCommentDrafts((current) => ({ ...current, [taskId]: value }))
  }

  const handleAddComment = async (taskId) => {
    const commentText = (commentDrafts[taskId] || '').trim()
    if (!commentText) return

    setSavingCommentId(taskId)
    setError('')

    try {
      await createComment({
        task_id: taskId,
        comment: commentText
      })
      setCommentDrafts((current) => ({ ...current, [taskId]: '' }))
      await loadTaskComments(taskId)
      setNotice('Comment added to the task.')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Unable to add comment.')
    } finally {
      setSavingCommentId(null)
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
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400 text-slate-950">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{fullName}</p>
              <p className="truncate text-sm text-slate-400">Employee workspace</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white ring-1 ring-white/10'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm font-semibold text-white">Profile</p>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-300" />
                <span className="truncate">{currentUser?.email || 'No email available'}</span>
              </p>
              <p>Role: {roleLabel}</p>
              <p>Department: {departmentLabel}</p>
              <p>Position: {positionLabel}</p>
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
          {(error || notice) && activeSection !== 'overview' && (
            <div className={`rounded-2xl p-4 text-sm ${error ? 'bg-rose-500/10 text-rose-100 ring-1 ring-rose-500/20' : 'bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/20'}`}>
              {error || notice}
            </div>
          )}

          {activeSection === 'overview' && (
            <>
              <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Employee Dashboard</p>
                <h1 className="mt-4 text-4xl font-semibold text-white">Welcome back, {firstName}</h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300">
                  Your personal overview for assigned tasks, deadlines, and recent workspace activity.
                  Open My Tasks, Deadlines, or Projects from the sidebar for full details and actions.
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {statCards.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className={statCardClass}>
                      <Icon className={`h-5 w-5 ${item.color}`} />
                      <p className="mt-5 text-sm text-slate-400">{item.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                      {item.hint && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">{item.hint}</p>
                      )}
                    </div>
                  )
                })}
              </section>
            </>
          )}

          {activeSection === 'my-tasks' && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">My Tasks</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Move work from To Do to In Progress, then Completed. Use comments to discuss each task.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['all', 'All'],
                    ['todo', 'To Do'],
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
                  <div className="hidden grid-cols-[1.3fr_1fr_0.7fr_0.8fr_0.8fr_1fr] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                    <span>Task</span>
                    <span>Project</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span>Due date</span>
                    <span>Actions</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {filteredTasks.map((task) => {
                      const nextStatus = getNextStatus(task.status)
                      const taskComments = commentsByTask[task.id] || []
                      const isExpanded = expandedTaskId === task.id

                      return (
                        <div key={task.id}>
                          <article className="grid gap-4 px-5 py-5 lg:grid-cols-[1.3fr_1fr_0.7fr_0.8fr_0.8fr_1fr] lg:items-center">
                            <div>
                              <p className="font-semibold text-slate-950">{task.title || 'Untitled task'}</p>
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{task.description || 'No description provided.'}</p>
                            </div>
                            <p className="text-sm text-slate-600">{projectById[Number(task.project_id)]?.name || 'No project'}</p>
                            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityClasses[task.priority] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                              {priorityLabels[task.priority] || 'Medium'}
                            </span>
                            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses[task.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                              {statusLabels[task.status] || 'To Do'}
                            </span>
                            <p className={`text-sm ${isOverdue(task) ? 'font-semibold text-rose-600' : 'text-slate-600'}`}>{formatDate(task.due_date)}</p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={!nextStatus || updatingTaskId === task.id}
                                onClick={() => handleStatusAdvance(task)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                              >
                                {updatingTaskId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDot className="h-4 w-4" />}
                                {nextStatus ? statusLabels[nextStatus] : 'Completed'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleComments(task.id)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                <MessageSquare className="h-4 w-4" />
                                {isExpanded ? 'Hide' : 'Comments'}
                              </button>
                            </div>
                          </article>

                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                              {commentLoadingId === task.id ? (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading comments...
                                </div>
                              ) : (
                                <>
                                  <div className="space-y-3">
                                    {taskComments.length === 0 ? (
                                      <p className="text-sm text-slate-500">No comments yet. Start the discussion for this task.</p>
                                    ) : (
                                      taskComments.map((comment) => (
                                        <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                          <p className="text-sm text-slate-800">{comment.comment}</p>
                                          <p className="mt-2 text-xs text-slate-500">
                                            {formatCommentAuthor(comment, currentUser?.id)}
                                          </p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                      type="text"
                                      value={commentDrafts[task.id] || ''}
                                      onChange={(event) => handleCommentChange(task.id, event.target.value)}
                                      placeholder="Write a comment for your manager or team..."
                                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                                    />
                                    <button
                                      type="button"
                                      disabled={savingCommentId === task.id}
                                      onClick={() => handleAddComment(task.id)}
                                      className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                      {savingCommentId === task.id ? 'Saving...' : 'Add comment'}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === 'deadlines' && (
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-white">Deadlines</h2>
              <p className="mt-1 text-sm text-slate-400">Track what is due today, coming up soon, or already overdue.</p>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <DeadlineList title="Due today" tasks={deadlineGroups.today} empty="No tasks due today." projectById={projectById} />
                <DeadlineList title="Upcoming deadlines" tasks={deadlineGroups.upcoming} empty="No upcoming deadlines." projectById={projectById} />
                <DeadlineList title="Overdue tasks" tasks={deadlineGroups.overdue} empty="No overdue tasks." projectById={projectById} danger />
              </div>
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">My Projects</h2>
                  <p className="mt-1 text-sm text-slate-400">Projects connected to your assigned tasks.</p>
                </div>
                <p className="text-sm text-slate-400">{projectSummaries.length} project{projectSummaries.length === 1 ? '' : 's'}</p>
              </div>

              {projectSummaries.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center text-slate-400">
                  No project assignments found yet.
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
          )}

          <section
            className={`rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl ${
              activeSection === 'notifications' ? '' : 'hidden'
            }`}
          >
            <NotificationPanel onUnreadCountChange={setUnreadCount} />
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
