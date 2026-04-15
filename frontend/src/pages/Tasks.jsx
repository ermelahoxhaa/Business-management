import { useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks, updateTask } from '../services/api'

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
    assignedUser: ''
  })
  const [tasks, setTasks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadTasks = async () => {
    try {
      const response = await getTasks()
      setTasks(response.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to load tasks')
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedUser: ''
    })
    setEditingId(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
      assignedUser: task.assigned_to ? String(task.assigned_to) : ''
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
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 text-stone-600 shadow-xl">
                No tasks available yet.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-800">{task.title}</h3>
                      <p className="text-sm text-stone-600">{task.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-stone-700">
                      <span className="rounded-full bg-stone-200 px-3 py-1">{task.status}</span>
                      <span className="rounded-full bg-stone-200 px-3 py-1">{task.priority}</span>
                      <span className="rounded-full bg-stone-200 px-3 py-1">Assigned: {task.assigned_to ?? '-'}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-stone-200/20 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-stone-500">
                      Due: {task.due_date ? task.due_date.slice(0, 10) : 'No due date'}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
