import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createTask, deleteTask, getTasks, updateTask, getProjects, getUsers, getComments, createComment } from '../services/api'
import { getCurrentUser, getUserRole } from '../services/auth'
import ListSearchPanel from '../components/ListSearchPanel'
import DataTransferBar from '../components/DataTransferBar'
import { buildQueryParams, unwrapList } from '../utils/listResponse'

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export default function Tasks() {
  const currentUser = getCurrentUser()
  const userRole = getUserRole()
  const isAdmin = userRole === 'admin'
  const isTeamLeader = userRole === 'team_leader'
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedUser: '',
    projectId: ''
  })
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [listMeta, setListMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [listPage, setListPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState({
    search: '',
    sort: 'created_at',
    order: 'desc',
    project_id: '',
    status: '',
    priority: '',
    assigned_to: '',
    due_from: '',
    due_to: ''
  })
  const emptySearch = {
    search: '',
    sort: 'created_at',
    order: 'desc',
    project_id: '',
    status: '',
    priority: '',
    assigned_to: '',
    due_from: '',
    due_to: ''
  }
  const [comments, setComments] = useState({}) // taskId: comments array
  const [commentForms, setCommentForms] = useState({}) // taskId: comment text

  const loadTasks = async (query, page = listPage) => {
    try {
      const response = await getTasks(buildQueryParams({ ...query, page, limit: 50 }))
      const { items, meta } = unwrapList(response)
      setTasks(items)
      setListMeta(meta)
      setListPage(meta.page || page)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to load tasks')
    }
  }

  const loadProjects = async () => {
    try {
      const response = await getProjects({ limit: 200 })
      setProjects(unwrapList(response).items)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to load projects')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      setUsers(response.data)
    } catch (err) {
      console.error(err)
      // If no users endpoint, ignore
    }
  }

  useEffect(() => {
    loadProjects()
    loadUsers()
    loadTasks(emptySearch)
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setListPage(1)
    loadTasks(searchQuery, 1)
  }

  const handleSearchReset = () => {
    setSearchQuery(emptySearch)
    setListPage(1)
    loadTasks(emptySearch, 1)
  }

  const handlePageChange = (nextPage) => {
    setListPage(nextPage)
    loadTasks(searchQuery, nextPage)
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedUser: '',
      projectId: ''
    })
    setEditingId(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSearchFieldChange = (event) => {
    const { name, value } = event.target
    setSearchQuery((current) => ({ ...current, [name]: value }))
  }

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : 'Unknown Project'
  }

  const getUserName = (userId) => {
    if (!userId) return '-'
    const user = users.find(u => u.id === userId)
    if (!user) return `User ${userId}`
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
    return fullName || user.email
  }

  const loadComments = async (taskId) => {
    try {
      const response = await getComments(taskId)
      setComments(prev => ({ ...prev, [taskId]: response.data }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async (taskId) => {
    const commentText = commentForms[taskId] || ''
    if (!commentText.trim()) return

    try {
      await createComment({
        task_id: taskId,
        comment: commentText,
        user_id: currentUser?.id
      })
      setCommentForms(prev => ({ ...prev, [taskId]: '' }))
      loadComments(taskId)
    } catch (err) {
      console.error(err)
      alert('Unable to add comment')
    }
  }

  const handleCommentChange = (taskId, value) => {
    setCommentForms(prev => ({ ...prev, [taskId]: value }))
  }

  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(t => t.project_id === Number(projectId))
    if (projectTasks.length === 0) return 0
    const completed = projectTasks.filter(t => t.status === 'done').length
    return Math.round((completed / projectTasks.length) * 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isTeamLeader) return
    setSaving(true)

    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate,
        assigned_to: Number(form.assignedUser),
        project_id: Number(form.projectId),
        created_by: currentUser?.id
      }

      if (editingId) {
        await updateTask(editingId, payload)
        alert('Task updated successfully')
      } else {
        await createTask(payload)
        alert('Task created successfully')
      }

      resetForm()
      loadTasks(searchQuery)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      dueDate: task.due_date ? task.due_date.slice(0, 10) : '',
      assignedUser: task.assigned_to ? String(task.assigned_to) : '',
      projectId: task.project_id ? String(task.project_id) : ''
    })
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return
    if (!window.confirm('Delete this task?')) return

    try {
      await deleteTask(id)
      setTasks((current) => current.filter((task) => task.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to delete task')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status } : task
        )
      )
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to update task status')
    }
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    highPriority: tasks.filter(t => t.priority === 'high').length
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <Link
          to="/dashboard"
          aria-label="Back to dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg shadow-slate-950/20 transition hover:border-sky-400/40 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Task Management</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Manage all tasks</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                {isTeamLeader
                  ? 'Create, assign, and update tasks for your team projects.'
                  : 'Monitor progress and manage task execution across projects.'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total tasks', value: taskStats.total, icon: '📋', style: 'from-sky-500/10 to-sky-400/10' },
            { label: 'Completed', value: taskStats.completed, icon: '✔️', style: 'from-emerald-500/10 to-emerald-400/10' },
            { label: 'In progress', value: taskStats.inProgress, icon: '⏳', style: 'from-amber-500/10 to-amber-400/10' },
            { label: 'High priority', value: taskStats.highPriority, icon: '⚠️', style: 'from-rose-500/10 to-rose-400/10' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
              <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.style} px-3 py-2 text-sm font-semibold text-slate-900`}>{item.icon}</div>
              <p className="mt-5 text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        {isTeamLeader && (
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">Create task</h2>
              <p className="mt-2 text-sm text-slate-400">Add a new task and assign it to team members.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Task Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter task title"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the task"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Assign to</label>
                <select
                  name="assignedUser"
                  value={form.assignedUser}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {getUserName(user.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Project</label>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </section>
        )}

        <ListSearchPanel
          search={searchQuery.search}
          onSearchChange={(value) => setSearchQuery((current) => ({ ...current, search: value }))}
          onSubmit={handleSearchSubmit}
          onReset={handleSearchReset}
          sort={searchQuery.sort}
          onSortChange={(value) => setSearchQuery((current) => ({ ...current, sort: value }))}
          order={searchQuery.order}
          onOrderChange={(value) => setSearchQuery((current) => ({ ...current, order: value }))}
          sortOptions={[
            { value: 'created_at', label: 'Created date' },
            { value: 'due_date', label: 'Due date' },
            { value: 'title', label: 'Title' },
            { value: 'status', label: 'Status' },
            { value: 'priority', label: 'Priority' }
          ]}
          resultMeta={listMeta}
          page={listPage}
          onPageChange={handlePageChange}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Project</label>
              <select
                name="project_id"
                value={searchQuery.project_id}
                onChange={handleSearchFieldChange}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
              <select
                name="status"
                value={searchQuery.status}
                onChange={handleSearchFieldChange}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Priority</label>
              <select
                name="priority"
                value={searchQuery.priority}
                onChange={handleSearchFieldChange}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">All priorities</option>
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Assigned user</label>
              <select
                name="assigned_to"
                value={searchQuery.assigned_to}
                onChange={handleSearchFieldChange}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">All users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {getUserName(user.id)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Due from</label>
              <input
                type="date"
                name="due_from"
                value={searchQuery.due_from}
                onChange={handleSearchFieldChange}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Due to</label>
              <input
                type="date"
                name="due_to"
                value={searchQuery.due_to}
                onChange={handleSearchFieldChange}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </ListSearchPanel>

        <DataTransferBar
          entity="tasks"
          filters={buildQueryParams(searchQuery)}
          onImported={() => loadTasks(searchQuery)}
        />

        <section className="grid gap-6">
          {tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400 shadow-xl">
              {isTeamLeader ? 'No tasks found for your projects yet.' : 'No tasks available yet.'}
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-semibold text-white">{task.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{task.description || 'No description provided.'}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          Project: {getProjectName(task.project_id)}
                        </span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          Assigned: {getUserName(task.assigned_to)}
                        </span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          Status: {statusOptions.find(s => s.value === task.status)?.label}
                        </span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          Priority: {priorityOptions.find(p => p.value === task.priority)?.label}
                        </span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          Due: {task.due_date ? task.due_date.slice(0, 10) : 'No due date'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {(isAdmin || isTeamLeader) && (
                      <button
                        type="button"
                        onClick={() => handleEdit(task)}
                        className="rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="rounded-3xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => loadComments(task.id)}
                      className="rounded-3xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
                    >
                      Comments ({comments[task.id]?.length || 0})
                    </button>
                  </div>

                  {comments[task.id] && (
                    <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
                      <h4 className="text-sm font-semibold text-slate-200 mb-4">Comments</h4>
                      <div className="space-y-3 mb-4">
                        {comments[task.id].map((comment) => (
                          <div key={comment.id} className="rounded-2xl bg-slate-800/50 p-3">
                            <p className="text-sm text-slate-100">{comment.comment}</p>
                            <p className="text-slate-400 text-xs mt-2">By {getUserName(comment.user_id)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentForms[task.id] || ''}
                          onChange={(e) => handleCommentChange(task.id, e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(task.id)}
                          className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
