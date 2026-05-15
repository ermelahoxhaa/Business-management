import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getProjects, getTasks, createProject, updateProject, deleteProject, getUsers } from '../services/api'
import { getUserRole, getCurrentUser } from '../services/auth'
import ListSearchPanel from '../components/ListSearchPanel'
import { buildQueryParams, unwrapList } from '../utils/listResponse'

export default function Projects() {
  const userRole = getUserRole()
  const currentUser = getCurrentUser()
  const isTeamLeader = userRole === 'team_leader'
  const isAdmin = userRole === 'admin'
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: ''
  })
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)
  const [listMeta, setListMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const emptySearch = { search: '', sort: 'created_at', order: 'desc' }
  const [searchQuery, setSearchQuery] = useState(emptySearch)

  const loadProjects = async (query = searchQuery) => {
    try {
      const response = await getProjects(buildQueryParams({ ...query, limit: 100 }))
      const { items, meta } = unwrapList(response)
      setProjects(items)
      setListMeta(meta)
    } catch (err) {
      console.error('Error loading projects:', err)
      alert(err.response?.data?.message || 'Unable to load projects')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      setUsers(response.data || [])
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await getTasks({ limit: 500 })
      setTasks(unwrapList(response).items)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadProjects(emptySearch), loadTasks(), loadUsers()])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadProjects(searchQuery)
  }

  const handleSearchReset = () => {
    setSearchQuery(emptySearch)
    loadProjects(emptySearch)
  }

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

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditProject = (project) => {
    setEditingId(project.id)
    setEditForm({
      name: project.name || '',
      description: project.description || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', description: '' })
  }

  const handleUpdateProject = async (projectId) => {
    if (!editForm.name.trim()) {
      alert('Project name is required')
      return
    }

    setSaving(true)
    try {
      await updateProject(projectId, {
        name: editForm.name,
        description: editForm.description
      })
      setEditingId(null)
      setEditForm({ name: '', description: '' })
      await loadProjects()
    } catch (err) {
      console.error('Error updating project:', err)
      alert(err.response?.data?.message || 'Unable to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    setSaving(true)
    try {
      await deleteProject(projectId)
      await loadProjects()
    } catch (err) {
      console.error('Error deleting project:', err)
      alert(err.response?.data?.message || 'Unable to delete project')
    } finally {
      setSaving(false)
    }
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user && user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user && user.first_name) {
      return user.first_name
    }
    return userId ? `User #${userId}` : 'Unknown user'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await createProject({
        name: form.name,
        description: form.description,
        created_by: currentUser?.id
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

  const totalProjects = projects.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    const now = new Date()
    return dueDate < now && task.status !== 'done'
  }).length

  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 sm:px-6">
        <div className="text-white text-lg font-medium">Loading projects...</div>
      </div>
    )
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
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Project Workspace</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Manage your projects</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Overview of project progress, tasks, and team ownership all in one place.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Total projects</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalProjects}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-200 ring-1 ring-white/10">
                <p className="text-slate-400">Total tasks</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalTasks}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Completed tasks', value: completedTasks, icon: '✔️', style: 'from-emerald-500/10 to-emerald-400/10' },
            { label: 'In progress', value: inProgressTasks, icon: '⏳', style: 'from-amber-500/10 to-amber-400/10' },
            { label: 'Overdue', value: overdueTasks, icon: '⚠️', style: 'from-rose-500/10 to-rose-400/10' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
              <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.style} px-3 py-2 text-sm font-semibold text-slate-900`}>{item.icon}</div>
              <p className="mt-5 text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        {(isAdmin || isTeamLeader) && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Create new project</h2>
                <p className="mt-2 text-sm text-slate-400">Add a new project for your team to work on.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Project Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter project name"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the project"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-3xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                >
                  Reset
                </button>
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
            { value: 'name', label: 'Name' },
            { value: 'updated_at', label: 'Updated date' }
          ]}
          resultMeta={listMeta}
        />

        <section className="grid gap-6">
          {projects.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400 shadow-xl">
              No projects available yet.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {projects.map((project) => {
                const stats = getProjectStats(project.id)
                return (
                  <div key={project.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-2xl font-semibold text-white">{project.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{project.description || 'No project description provided.'}</p>
                        {project.created_by && (
                          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Created by {getUserName(project.created_by)}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-200">Tasks {stats.total}</span>
                        <span className="rounded-full bg-emerald-800/60 px-3 py-2 text-sm text-emerald-100">Done {stats.completed}</span>
                        <span className="rounded-full bg-amber-800/60 px-3 py-2 text-sm text-amber-100">In progress {stats.inProgress}</span>
                        <span className="rounded-full bg-rose-800/60 px-3 py-2 text-sm text-rose-100">Overdue {stats.overdue}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="w-full overflow-hidden rounded-full bg-slate-800/80 h-3">
                        <div className="h-3 rounded-full bg-sky-400 transition-all duration-300" style={{ width: `${stats.progress}%` }} />
                      </div>
                      <p className="text-sm text-slate-400">Progress: {stats.progress}%</p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {editingId === project.id ? (
                        <>
                          <div className="space-y-3">
                            <input
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              placeholder="Project name"
                              className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            />
                            <textarea
                              name="description"
                              value={editForm.description}
                              onChange={handleEditChange}
                              placeholder="Project description"
                              rows="3"
                              className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            />
                          </div>
                          <div className="grid gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateProject(project.id)}
                              disabled={saving}
                              className="rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {(isAdmin || isTeamLeader) && (
                            <button
                              type="button"
                              onClick={() => handleEditProject(project)}
                              className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                              Edit
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project.id)}
                              disabled={saving}
                              className="rounded-3xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
