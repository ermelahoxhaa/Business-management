import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  createDepartment,
  createEmployee,
  deleteEmployee,
  getDepartments,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus
} from '../services/api'
import { getUserRole } from '../services/auth'
import ListSearchPanel from '../components/ListSearchPanel'
import DataTransferBar from '../components/DataTransferBar'
import { buildQueryParams, unwrapList } from '../utils/listResponse'
import { scrollToElement } from '../utils/scrollToElement'

const defaultForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'employee',
  department_id: '',
  position: '',
  status: 'active'
}

const emptyFilters = { search: '', role: '', department_id: '', sort: 'created_at', order: 'desc' }
const emptyDepartmentFilters = { search: '', sort: 'name', order: 'asc' }

export default function EmployeeManagement() {
  const userRole = getUserRole()
  const isAdmin = userRole === 'admin'
  const isTeamLeader = userRole === 'team_leader'
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [employeeMeta, setEmployeeMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [employeePage, setEmployeePage] = useState(1)
  const [departmentFilters, setDepartmentFilters] = useState(emptyDepartmentFilters)
  const [departmentMeta, setDepartmentMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [departmentPage, setDepartmentPage] = useState(1)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const employeesListRef = useRef(null)
  const employeeFormRef = useRef(null)
  const departmentsListRef = useRef(null)
  const departmentFormRef = useRef(null)

  const departmentMap = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department.name])),
    [departments]
  )

  const teamLeaderDepartment = isTeamLeader && departments.length > 0 ? departments[0] : null

  const loadDepartments = useCallback(async (activeFilters, page = departmentPage) => {
    const response = await getDepartments(buildQueryParams({ ...activeFilters, page, limit: 50 }))
    const { items, meta } = unwrapList(response)
    setDepartments(items)
    setDepartmentMeta(meta)
    setDepartmentPage(meta.page || page)
  }, [departmentPage])

  const loadEmployees = useCallback(async (activeFilters, page = employeePage) => {
    const response = await getEmployees(buildQueryParams({
      search: activeFilters.search || undefined,
      role: activeFilters.role || undefined,
      department_id: activeFilters.department_id || undefined,
      sort: activeFilters.sort,
      order: activeFilters.order,
      page,
      limit: 50
    }))
    const { items, meta } = unwrapList(response)
    setEmployees(items)
    setEmployeeMeta(meta)
    setEmployeePage(meta.page || page)
  }, [employeePage])

  const loadData = useCallback(async (activeFilters) => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadDepartments(), loadEmployees(activeFilters)])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load employees')
    } finally {
      setLoading(false)
    }
  }, [loadDepartments, loadEmployees])

  useEffect(() => {
    loadData(emptyFilters)
    loadDepartments(emptyDepartmentFilters)
  }, [loadData])

  const handleFilterChange = (e) => {
    setFilters((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    setEmployeePage(1)
    setLoading(true)
    try {
      await loadEmployees(filters, 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to filter employees')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSearchReset = async () => {
    setFilters(emptyFilters)
    setEmployeePage(1)
    setLoading(true)
    try {
      await loadEmployees(emptyFilters, 1)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeePageChange = async (nextPage) => {
    setEmployeePage(nextPage)
    await loadEmployees(filters, nextPage)
  }

  const handleDepartmentSearchSubmit = async (event) => {
    event.preventDefault()
    setDepartmentPage(1)
    await loadDepartments(departmentFilters, 1)
  }

  const handleDepartmentSearchReset = async () => {
    setDepartmentFilters(emptyDepartmentFilters)
    setDepartmentPage(1)
    await loadDepartments(emptyDepartmentFilters, 1)
  }

  const handleDepartmentPageChange = async (nextPage) => {
    setDepartmentPage(nextPage)
    await loadDepartments(departmentFilters, nextPage)
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowForm(true)
    scrollToElement(employeeFormRef)
  }

  const handleEdit = (employee) => {
    setEditId(employee.id)
    setShowForm(true)
    scrollToElement(employeeFormRef)
    setForm({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      password: '',
      role: employee.role || 'employee',
      department_id: employee.department_id ? String(employee.department_id) : '',
      position: employee.position || '',
      status: employee.status || 'active'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return

    if (form.role === 'team_leader' && !form.department_id) {
      setError('Team leader must be assigned to a department')
      return
    }

    setSaving(true)
    try {
      if (editId) {
        await updateEmployee(editId, {
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
          department_id: form.department_id ? Number(form.department_id) : null,
          position: form.position,
          status: form.status
        })
      } else {
        await createEmployee({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          role: form.role,
          department_id: form.department_id ? Number(form.department_id) : null,
          position: form.position,
          status: form.status
        })
      }

      await loadEmployees(filters)
      setShowForm(false)
      resetForm()
      scrollToElement(employeesListRef)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save employee')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (employee) => {
    if (!isAdmin) return

    const label = `${employee.first_name} ${employee.last_name}`.trim() || employee.email
    const confirmed = window.confirm(`Delete ${label}? This cannot be undone.`)
    if (!confirmed) return

    setSaving(true)
    setError('')
    try {
      await deleteEmployee(employee.id)
      if (editId === employee.id) {
        setShowForm(false)
        resetForm()
      }
      await loadEmployees(filters)
      scrollToElement(employeesListRef)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete employee')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async (employee) => {
    if (!isAdmin) return
    const nextStatus = employee.status === 'active' ? 'inactive' : 'active'
    setSaving(true)
    try {
      await updateEmployeeStatus(employee.id, nextStatus)
      await loadEmployees(filters)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update employee status')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateDepartment = async (e) => {
    e.preventDefault()
    if (!isAdmin || !newDepartmentName.trim()) return

    setSaving(true)
    try {
      await createDepartment({ name: newDepartmentName.trim() })
      setNewDepartmentName('')
      await loadDepartments()
      scrollToElement(departmentsListRef)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create department')
    } finally {
      setSaving(false)
    }
  }

  const employeeStats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    teamLeaders: employees.filter(e => e.role === 'team_leader').length
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
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">Employee Management</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Manage your team</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                {isAdmin
                  ? 'Manage employees and team leaders, assign departments, and control account status.'
                  : 'View employees assigned to your department by the administrator.'}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Add Employee
              </button>
            )}
          </div>
        </section>

        {isTeamLeader && (
          <section className={`rounded-[2rem] border p-6 shadow-2xl ring-1 ${
            teamLeaderDepartment
              ? 'border-sky-500/20 bg-sky-500/10 ring-sky-500/20'
              : 'border-amber-500/20 bg-amber-500/10 ring-amber-500/20'
          }`}>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-200/80">Your department</p>
            {teamLeaderDepartment ? (
              <>
                <h2 className="mt-2 text-2xl font-semibold text-white">{teamLeaderDepartment.name}</h2>
                <p className="mt-2 text-sm text-sky-100/80">
                  You only see employees in this department. The administrator assigns your department and team members.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-100">
                No department assigned yet. Ask the administrator to assign you to a department in Employee Management.
              </p>
            )}
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total employees', value: employeeStats.total, icon: '👥', style: 'from-sky-500/10 to-sky-400/10' },
            { label: 'Active', value: employeeStats.active, icon: '✓', style: 'from-emerald-500/10 to-emerald-400/10' },
            { label: 'Inactive', value: employeeStats.inactive, icon: '○', style: 'from-slate-500/10 to-slate-400/10' },
            { label: 'Team leaders', value: employeeStats.teamLeaders, icon: '⭐', style: 'from-amber-500/10 to-amber-400/10' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 p-6 shadow-xl ring-1 ring-white/5">
              <div className={`inline-flex rounded-3xl bg-gradient-to-r ${item.style} px-3 py-2 text-sm font-semibold text-slate-900`}>{item.icon}</div>
              <p className="mt-5 text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <div className="space-y-4 rounded-[2rem] border border-sky-500/15 bg-sky-500/5 p-2 sm:p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/90">
            Employees · search & data transfer
          </p>

        <ListSearchPanel
          title="Search employees"
          subtitle="Filter by name, email, role, or department. Results appear in the employee list below."
          searchPlaceholder="Search employees by name or email..."
          scrollToRef={employeesListRef}
          search={filters.search}
          onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          onSubmit={handleSearchSubmit}
          onReset={handleEmployeeSearchReset}
          sort={filters.sort}
          onSortChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
          order={filters.order}
          onOrderChange={(value) => setFilters((current) => ({ ...current, order: value }))}
          sortOptions={[
            { value: 'created_at', label: 'Created date' },
            { value: 'first_name', label: 'First name' },
            { value: 'last_name', label: 'Last name' },
            { value: 'email', label: 'Email' },
            { value: 'department', label: 'Department' }
          ]}
          resultMeta={employeeMeta}
          page={employeePage}
          onPageChange={handleEmployeePageChange}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {isAdmin && (
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">All roles</option>
                <option value="employee">Employee</option>
                <option value="team_leader">Team Leader</option>
              </select>
            )}
            {isAdmin && (
              <select
                name="department_id"
                value={filters.department_id}
                onChange={handleFilterChange}
                className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </ListSearchPanel>

        <DataTransferBar
          entity="employees"
          title="Export / import employees"
          subtitle="Download the current employee list or upload a CSV, Excel, or JSON file with new staff records."
          filters={buildQueryParams(filters)}
          canImport={isAdmin}
          scrollToRef={employeesListRef}
          onImported={() => loadEmployees(filters)}
        />
        </div>

        {isAdmin && (
        <div className="space-y-4 rounded-[2rem] border border-violet-500/15 bg-violet-500/5 p-2 sm:p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Departments · search & data transfer
          </p>

        <ListSearchPanel
          title="Search departments"
          subtitle="Filter departments by name. Results appear in the departments list below."
          searchPlaceholder="Search departments by name..."
          scrollToRef={departmentsListRef}
          search={departmentFilters.search}
          onSearchChange={(value) => setDepartmentFilters((current) => ({ ...current, search: value }))}
          onSubmit={handleDepartmentSearchSubmit}
          onReset={handleDepartmentSearchReset}
          sort={departmentFilters.sort}
          onSortChange={(value) => setDepartmentFilters((current) => ({ ...current, sort: value }))}
          order={departmentFilters.order}
          onOrderChange={(value) => setDepartmentFilters((current) => ({ ...current, order: value }))}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'created_at', label: 'Created date' },
            { value: 'employee_count', label: 'Team size' }
          ]}
          resultMeta={departmentMeta}
          page={departmentPage}
          onPageChange={handleDepartmentPageChange}
        />

        <DataTransferBar
          entity="departments"
          title="Export / import departments"
          subtitle="Download the department list or upload a file to add departments in bulk."
          filters={buildQueryParams(departmentFilters)}
          canImport={isAdmin}
          scrollToRef={departmentsListRef}
          onImported={() => loadDepartments(departmentFilters)}
        />
        </div>
        )}

        {isAdmin && departments.length > 0 && (
          <section
            ref={departmentsListRef}
            className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">Departments</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <div key={department.id} className="rounded-2xl bg-slate-950/70 p-4 ring-1 ring-white/10">
                  <p className="font-semibold text-white">{department.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {department.employee_count ?? 0} team member{(department.employee_count ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isAdmin && (
        <section
          ref={departmentFormRef}
          className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Create department</h2>
          <form onSubmit={handleCreateDepartment} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="Department name"
              className="flex-1 rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
            >
              Add Department
            </button>
          </form>
        </section>
        )}

        {showForm && isAdmin && (
        <section
          ref={employeeFormRef}
          className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">{editId ? 'Edit Employee' : 'Create Employee'}</h2>
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">First Name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
                  placeholder="First name"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
                  placeholder="Last name"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  required
                  disabled={Boolean(editId)}
                />
              </div>

              {!editId && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                    placeholder="Password"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="employee">Employee</option>
                  <option value="team_leader">Team Leader</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Department{form.role === 'team_leader' ? ' (required for team leader)' : ''}
                </label>
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={(e) => setForm((current) => ({ ...current, department_id: e.target.value }))}
                  required={form.role === 'team_leader'}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">{form.role === 'team_leader' ? 'Select department' : 'No department'}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Position</label>
                <input
                  name="position"
                  value={form.position}
                  onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))}
                  placeholder="Position"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {editId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="flex-1 rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
        )}

        <section
          ref={employeesListRef}
          className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            {isAdmin ? 'Employees & Team Leaders' : 'Department Employees'}
          </h2>
          {loading ? (
            <p className="text-slate-300">Loading employees...</p>
          ) : error ? (
            <p className="text-rose-400">{error}</p>
          ) : employees.length === 0 ? (
            <p className="text-slate-300">No employees found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">First Name</th>
                    <th className="px-4 py-3">Last Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-800 text-slate-200 hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3">{employee.first_name}</td>
                      <td className="px-4 py-3">{employee.last_name}</td>
                      <td className="px-4 py-3 text-slate-400">{employee.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300">
                          {employee.role === 'team_leader' ? 'Team Leader' : 'Employee'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{employee.department_name || departmentMap[employee.department_id] || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${employee.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{employee.position || '-'}</td>
                      <td className="px-4 py-3 text-slate-400">{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(employee)}
                              className="rounded-2xl bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(employee)}
                              className="rounded-2xl bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-600 transition"
                            >
                              {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(employee)}
                              disabled={saving}
                              className="rounded-2xl bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500 transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
