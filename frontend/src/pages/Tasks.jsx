import { useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks, updateTask, getProjects, getUsers, getComments, createComment } from '../services/api'

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
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    assignedUser: ''
  })
  const [comments, setComments] = useState({}) // taskId: comments array
  const [commentForms, setCommentForms] = useState({}) // taskId: comment text

  const loadTasks = async () => {
    try {
      const response = await getTasks()
      setTasks(response.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to load tasks')
    }
  }

  const loadProjects = async () => {
    try {
      const response = await getProjects()
      setProjects(response.data)
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
    loadTasks()
    loadProjects()
    loadUsers()
  }, [])

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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const filteredTasks = tasks.filter(task => {
    if (filters.projectId && task.project_id !== Number(filters.projectId)) return false
    if (filters.status && task.status !== filters.status) return false
    if (filters.assignedUser && task.assigned_to !== Number(filters.assignedUser)) return false
    return true
  })

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : 'Unknown Project'
  }

  const getUserName = (userId) => {
    if (!userId) return '-'
    const user = users.find(u => u.id === userId)
    return user ? user.name || user.email : `User ${userId}`
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
        user_id: 1 // placeholder
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
    setSaving(true)

    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate,
        assigned_to: Number(form.assignedUser || 0),
        project_id: Number(form.projectId),
        created_by: 1
      }

      if (editingId) {
        await updateTask(editingId, payload)
        alert('Task updated successfully')
      } else {
        await createTask(payload)
        alert('Task created successfully')
      }

      resetForm()
      loadTasks()
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

  return (
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <h1 className="text-3xl font-semibold text-stone-800">Task Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Create, update, and manage your tasks from a clean, modern workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-stone-700">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-stone-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Assigned User</label>
              <input
                name="assignedUser"
                value={form.assignedUser}
                onChange={handleChange}
                placeholder="User ID"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Project</label>
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-stone-100 transition duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40 sm:w-auto"
              >
                {editingId ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 py-2.5 text-sm font-medium text-stone-700 transition duration-200 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-zinc-300/40 sm:w-auto"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-stone-100">Task List</h2>

          <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-4 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Filter by Project</label>
                <select
                  name="projectId"
                  value={filters.projectId}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {filters.projectId && (
                  <p className="mt-2 text-sm text-stone-600">
                    Progress: {getProjectProgress(filters.projectId)}%
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Filter by Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
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
                <label className="mb-2 block text-sm font-medium text-stone-700">Filter by Assigned User</label>
                <select
                  name="assignedUser"
                  value={filters.assignedUser}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 text-stone-600 shadow-xl">
                No tasks available yet.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-800">{task.title}</h3>
                      <p className="text-sm text-stone-600">{task.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Project: {getProjectName(task.project_id)}</span>
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Assigned: {getUserName(task.assigned_to)}</span>
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Status: {statusOptions.find(s => s.value === task.status)?.label || task.status}</span>
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Priority: {priorityOptions.find(p => p.value === task.priority)?.label || task.priority}</span>
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Due: {task.due_date ? task.due_date.slice(0, 10) : 'No due date'}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-stone-200/20 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-stone-800 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(task)}
                        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-stone-100 transition duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition duration-200 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => loadComments(task.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                      >
                        Comments ({comments[task.id]?.length || 0})
                      </button>
                    </div>
                  </div>
                  {comments[task.id] && (
                    <div className="mt-4 rounded-2xl border border-stone-200/20 bg-stone-50 p-4">
                      <h4 className="text-sm font-medium text-stone-700 mb-2">Comments</h4>
                      <div className="space-y-2 mb-4">
                        {comments[task.id].map((comment) => (
                          <div key={comment.id} className="rounded-lg bg-white p-3 text-sm">
                            <p className="text-stone-800">{comment.comment}</p>
                            <p className="text-stone-500 text-xs mt-1">By {getUserName(comment.user_id)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentForms[task.id] || ''}
                          onChange={(e) => handleCommentChange(task.id, e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(task.id)}
                          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-stone-100 transition duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
