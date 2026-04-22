import { useEffect, useState } from 'react'
import { getProjects, getTasks, createProject } from '../services/api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)

  const loadProjects = async () => {
    try {
      const response = await getProjects()
      setProjects(response.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to load projects')
    }
  }

  const loadTasks = async () => {
    try {
      const response = await getTasks()
      setTasks(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadProjects(), loadTasks()])
      setLoading(false)
    }
    loadData()
  }, [])

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId)
    const total = projectTasks.length
    const completed = projectTasks.filter(task => task.status === 'done').length
    const inProgress = projectTasks.filter(task => task.status === 'in_progress').length
    const overdue = projectTasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      const now = new Date()
      return dueDate < now && task.status !== 'done'
    }).length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, overdue, progress }
  }

  const resetForm = () => {
    setForm({ name: '', description: '' })
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await createProject({
        name: form.name,
        description: form.description,
        created_by: 1
      })
      alert('Project created successfully')
      resetForm()
      loadProjects()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Unable to create project')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
        <div className="text-stone-100">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <h1 className="text-3xl font-semibold text-stone-800">Project Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            View project progress and task statistics.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <h2 className="text-2xl font-semibold text-stone-800 mb-4">Create New Project</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-stone-700">Project Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter project name"
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
                placeholder="Enter project description"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-stone-100 transition duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300/40 disabled:opacity-50 sm:w-auto"
              >
                {saving ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 py-2.5 text-sm font-medium text-stone-700 transition duration-200 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-zinc-300/40 sm:w-auto"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 text-stone-600 shadow-xl">
              No projects available yet.
            </div>
          ) : (
            projects.map((project) => {
              const stats = getProjectStats(project.id)
              return (
                <div key={project.id} className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-800">{project.name}</h3>
                      <p className="text-sm text-stone-600">{project.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">Total Tasks: {stats.total}</span>
                      <span className="rounded-full bg-green-200 px-3 py-1 text-green-700">Completed: {stats.completed}</span>
                      <span className="rounded-full bg-blue-200 px-3 py-1 text-blue-700">In Progress: {stats.inProgress}</span>
                      <span className="rounded-full bg-red-200 px-3 py-1 text-red-700">Overdue: {stats.overdue}</span>
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-zinc-700">Progress: {stats.progress}%</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-zinc-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}