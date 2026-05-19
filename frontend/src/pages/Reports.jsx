import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileDown } from 'lucide-react'
import {
  exportReport,
  getDepartments,
  getProjects,
  getReportTypes,
  previewReport
} from '../services/api'
import { downloadBlob } from '../utils/downloadFile'
import { unwrapList } from '../utils/listResponse'

const emptyFilters = {
  date_from: '',
  date_to: '',
  status: '',
  priority: '',
  project_id: '',
  department_id: ''
}

export default function Reports() {
  const [reportTypes, setReportTypes] = useState([])
  const [projects, setProjects] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedType, setSelectedType] = useState('task_summary')
  const [filters, setFilters] = useState(emptyFilters)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [typesRes, projectsRes, departmentsRes] = await Promise.all([
          getReportTypes(),
          getProjects({ limit: 200 }),
          getDepartments({ limit: 200 })
        ])
        setReportTypes(typesRes.data || [])
        setProjects(unwrapList(projectsRes).items)
        setDepartments(unwrapList(departmentsRes).items)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load report options.')
      }
    }
    loadOptions()
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const buildFilterParams = () => {
    const params = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value
    })
    return params
  }

  const handleGenerate = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await previewReport(selectedType, buildFilterParams())
      setReport(response.data)
    } catch (err) {
      setReport(null)
      setError(err.response?.data?.message || 'Unable to generate report.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    setExporting(format)
    setError('')
    try {
      const response = await exportReport(selectedType, format, buildFilterParams())
      const disposition = response.headers['content-disposition'] || ''
      const match = disposition.match(/filename="(.+)"/)
      const filename = match?.[1] || `report.${format}`
      downloadBlob(response.data, filename)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to export report.')
    } finally {
      setExporting('')
    }
  }

  const selectedMeta = reportTypes.find((item) => item.id === selectedType)

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <Link
          to="/dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:border-sky-400/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Reports</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Dynamic reports</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Generate reports by date range and filters, preview results, then export for meetings.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Report type</label>
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.title}
                  </option>
                ))}
              </select>
              {selectedMeta && <p className="mt-2 text-sm text-slate-400">{selectedMeta.description}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Date from</label>
                <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Date to</label>
                <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white">
                  <option value="">All</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Priority</label>
                <select name="priority" value={filters.priority} onChange={handleFilterChange} className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white">
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Project</label>
                <select name="project_id" value={filters.project_id} onChange={handleFilterChange} className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white">
                  <option value="">All</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Department</label>
                <select name="department_id" value={filters.department_id} onChange={handleFilterChange} className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white">
                  <option value="">All</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate report'}
            </button>
          </form>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-100 ring-1 ring-rose-500/20">{error}</div>
        )}

        {report && (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{report.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{report.filter_summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['xlsx', 'csv', 'json', 'pdf'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    disabled={Boolean(exporting)}
                    onClick={() => handleExport(format)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-medium text-slate-200 hover:border-sky-500"
                  >
                    <FileDown className="h-4 w-4" />
                    {exporting === format ? 'Exporting...' : format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.summary.map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-900/90 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-xs uppercase text-slate-400">
                    <tr>
                      {report.headers.map((header) => (
                        <th key={header.key} className="px-4 py-3">{header.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.rows.length === 0 ? (
                      <tr>
                        <td colSpan={report.headers.length} className="px-4 py-8 text-center text-slate-400">
                          No records match these criteria.
                        </td>
                      </tr>
                    ) : (
                      report.rows.map((row, index) => (
                        <tr key={index}>
                          {report.headers.map((header) => (
                            <td key={header.key} className="px-4 py-3 text-slate-200">
                              {row[header.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
