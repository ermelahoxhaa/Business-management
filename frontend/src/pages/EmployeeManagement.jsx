import { useEffect, useMemo, useState } from 'react'
import {
  createDepartment,
  createEmployee,
  getDepartments,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus
} from '../services/api'
import { getUserRole } from '../services/auth'

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

export default function EmployeeManagement() {
  const userRole = getUserRole()
  const isAdmin = userRole === 'admin'
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', role: '', department_id: '' })
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')

  const departmentMap = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department.name])),
    [departments]
  )

  const loadDepartments = async () => {
    const response = await getDepartments()
    setDepartments(response.data || [])
  }

  const loadEmployees = async () => {
    const response = await getEmployees({
      search: filters.search || undefined,
      role: filters.role || undefined,
      department_id: filters.department_id || undefined
    })
    setEmployees(response.data || [])
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadDepartments(), loadEmployees()])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFilterChange = (e) => {
    setFilters((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loadEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to filter employees')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (employee) => {
    setEditId(employee.id)
    setShowForm(true)
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

      await loadEmployees()
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save employee')
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
      await loadEmployees()
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
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create department')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-start justify-center overflow-hidden bg-gradient-to-br from-stone-700 via-neutral-700 to-zinc-800 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-stone-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-zinc-200/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-7xl space-y-8">
        <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-stone-800">Employee Management</h1>
              <p className="mt-2 text-sm text-stone-600">
                {isAdmin ? 'Manage employees, roles, departments, and status.' : 'View employees in your team and department.'}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700"
              >
                Add Employee
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-4">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or email"
              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
            />
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
            >
              <option value="">All roles</option>
              <option value="employee">Employee</option>
              <option value="team_leader">Team Leader</option>
            </select>
            <select
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {isAdmin && (
          <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleCreateDepartment} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Create department"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700 disabled:opacity-50"
              >
                Add Department
              </button>
            </form>
          </div>
        )}

        {showForm && isAdmin && (
          <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-semibold text-stone-800">{editId ? 'Edit Employee' : 'Create Employee'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                name="first_name"
                value={form.first_name}
                onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
                placeholder="First name"
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
                required
              />
              <input
                name="last_name"
                value={form.last_name}
                onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
                placeholder="Last name"
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                placeholder="Email"
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
                required
                disabled={Boolean(editId)}
              />
              {!editId && (
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                  placeholder="Password"
                  className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
                  required
                />
              )}
              <select
                name="role"
                value={form.role}
                onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
              >
                <option value="employee">Employee</option>
                <option value="team_leader">Team Leader</option>
              </select>
              <select
                name="department_id"
                value={form.department_id}
                onChange={(e) => setForm((current) => ({ ...current, department_id: e.target.value }))}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
              >
                <option value="">No department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <input
                name="position"
                value={form.position}
                onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))}
                placeholder="Position"
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
              />
              <select
                name="status"
                value={form.status}
                onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-800"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-zinc-700 disabled:opacity-50"
                >
                  {editId ? 'Update Employee' : 'Create Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="rounded-lg border border-stone-300 bg-stone-50 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl border border-stone-200/30 bg-stone-100/90 p-6 shadow-2xl backdrop-blur-md">
          {loading ? (
            <p className="text-stone-700">Loading employees...</p>
          ) : error ? (
            <p className="text-red-700">{error}</p>
          ) : employees.length === 0 ? (
            <p className="text-stone-700">No employees found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-300 text-stone-600">
                  <tr>
                    <th className="px-3 py-2">First Name</th>
                    <th className="px-3 py-2">Last Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Position</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-stone-200 text-stone-800">
                      <td className="px-3 py-2">{employee.first_name}</td>
                      <td className="px-3 py-2">{employee.last_name}</td>
                      <td className="px-3 py-2">{employee.email}</td>
                      <td className="px-3 py-2">{employee.role === 'team_leader' ? 'Team Leader' : 'Employee'}</td>
                      <td className="px-3 py-2">{employee.department_name || departmentMap[employee.department_id] || 'No department'}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${employee.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{employee.position || '-'}</td>
                      <td className="px-3 py-2">{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-3 py-2">
                        {isAdmin ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(employee)}
                              className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-stone-100 hover:bg-zinc-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(employee)}
                              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                            >
                              {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-500">View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
