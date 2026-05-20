import { searchTasksService } from './taskServices.js'
import { searchProjectsService } from './projectServices.js'
import { searchEmployeesService } from './employeeService.js'
import { searchDepartmentsService, createDepartmentService } from './departmentService.js'
import { searchClientsService, createClientService } from './clientService.js'
import { createTaskService } from './taskServices.js'
import { createProjectService } from './projectServices.js'
import { createEmployeeService } from './employeeService.js'
import { findDepartmentByName } from '../repositories/departmentRepository.js'
import { buildDownload, parseUploadedFile } from '../utils/fileFormats.js'
import { fetchAllPages } from '../utils/queryParser.js'

const allowedEntities = ['tasks', 'projects', 'employees', 'departments', 'clients']
const allowedFormats = ['csv', 'json', 'xlsx']

const entityConfig = {
  tasks: {
    filename: 'tasks',
    headers: [
      { key: 'id', label: 'id' },
      { key: 'title', label: 'title' },
      { key: 'description', label: 'description' },
      { key: 'status', label: 'status' },
      { key: 'priority', label: 'priority' },
      { key: 'due_date', label: 'due_date' },
      { key: 'project_id', label: 'project_id' },
      { key: 'assigned_to', label: 'assigned_to' }
    ],
    mapExport: (task) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
      project_id: task.project_id,
      assigned_to: task.assigned_to
    })
  },
  projects: {
    filename: 'projects',
    headers: [
      { key: 'id', label: 'id' },
      { key: 'name', label: 'name' },
      { key: 'description', label: 'description' }
    ],
    mapExport: (project) => ({
      id: project.id,
      name: project.name,
      description: project.description || ''
    })
  },
  employees: {
    filename: 'employees',
    headers: [
      { key: 'id', label: 'id' },
      { key: 'first_name', label: 'first_name' },
      { key: 'last_name', label: 'last_name' },
      { key: 'email', label: 'email' },
      { key: 'role', label: 'role' },
      { key: 'department_name', label: 'department_name' },
      { key: 'position', label: 'position' },
      { key: 'status', label: 'status' }
    ],
    mapExport: (employee) => ({
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      role: employee.role,
      department_name: employee.department_name,
      position: employee.position,
      status: employee.status
    })
  },
  departments: {
    filename: 'departments',
    headers: [
      { key: 'id', label: 'id' },
      { key: 'name', label: 'name' },
      { key: 'description', label: 'description' },
      { key: 'employee_count', label: 'employee_count' }
    ],
    mapExport: (department) => ({
      id: department.id,
      name: department.name,
      description: department.description || '',
      employee_count: department.employee_count ?? 0
    })
  },
  clients: {
    filename: 'clients',
    headers: [
      { key: 'id', label: 'id' },
      { key: 'contact_name', label: 'contact_name' },
      { key: 'company_name', label: 'company_name' },
      { key: 'email', label: 'email' },
      { key: 'phone', label: 'phone' },
      { key: 'address', label: 'address' },
      { key: 'status', label: 'status' }
    ],
    mapExport: (client) => ({
      id: client.id,
      contact_name: client.contact_name,
      company_name: client.company_name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status
    })
  }
}

const fetchRows = async (entity, query, requester) => {
  const exportQuery = { ...query }

  if (entity === 'tasks') {
    return fetchAllPages(searchTasksService, exportQuery, requester)
  }

  if (entity === 'projects') {
    return fetchAllPages(searchProjectsService, exportQuery, requester)
  }

  if (entity === 'employees') {
    return fetchAllPages(searchEmployeesService, exportQuery, requester)
  }

  if (entity === 'clients') {
    return fetchAllPages(searchClientsService, exportQuery)
  }

  return fetchAllPages(searchDepartmentsService, exportQuery)
}

export const exportEntityService = async (entity, format, query, requester) => {
  if (!allowedEntities.includes(entity)) {
    throw new Error('Invalid export entity')
  }

  if (!allowedFormats.includes(format)) {
    throw new Error('Format must be csv, json, or xlsx')
  }

  const config = entityConfig[entity]
  const items = await fetchRows(entity, query, requester)
  const rows = items.map(config.mapExport)

  return buildDownload(rows, config.headers, format, `${config.filename}-export`)
}

const importTaskRow = async (row, requester) => {
  await createTaskService({
    title: row.title,
    description: row.description || '',
    status: row.status || 'todo',
    priority: row.priority || 'medium',
    dueDate: row.due_date || null,
    project_id: Number(row.project_id),
    assigned_to: Number(row.assigned_to),
    created_by: requester.id
  }, requester)
}

const importProjectRow = async (row, requester) => {
  await createProjectService({
    name: row.name,
    description: row.description || '',
    created_by: requester.id
  })
}

const importEmployeeRow = async (row, requester) => {
  let departmentId = null
  if (row.department_name) {
    const department = await findDepartmentByName(String(row.department_name).trim())
    departmentId = department?.id || null
  }

  await createEmployeeService({
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    password: row.password,
    role: row.role || 'employee',
    department_id: departmentId,
    position: row.position || '',
    status: row.status || 'active',
    created_by: requester.id
  })
}

const importDepartmentRow = async (row, requester) => {
  await createDepartmentService({
    name: row.name,
    description: row.description || '',
    created_by: requester.id
  })
}

const importClientRow = async (row, requester) => {
  await createClientService({
    contact_name: row.contact_name,
    company_name: row.company_name,
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    status: row.status || 'active',
    created_by: requester.id
  })
}

const rowImporters = {
  tasks: importTaskRow,
  projects: importProjectRow,
  employees: importEmployeeRow,
  departments: importDepartmentRow,
  clients: importClientRow
}

const validateImportRow = (entity, row) => {
  if (entity === 'tasks') {
    if (!row.title?.toString().trim()) throw new Error('title is required')
    if (!row.project_id) throw new Error('project_id is required')
    if (!row.assigned_to) throw new Error('assigned_to is required')
    const status = row.status || 'todo'
    if (!['todo', 'in_progress', 'done'].includes(status)) {
      throw new Error('status must be todo, in_progress, or done')
    }
    const priority = row.priority || 'medium'
    if (!['low', 'medium', 'high'].includes(priority)) {
      throw new Error('priority must be low, medium, or high')
    }
  }

  if (entity === 'projects' && !row.name?.toString().trim()) {
    throw new Error('name is required')
  }

  if (entity === 'employees') {
    if (!row.first_name?.toString().trim()) throw new Error('first_name is required')
    if (!row.last_name?.toString().trim()) throw new Error('last_name is required')
    if (!row.email?.toString().trim()) throw new Error('email is required')
    if (!row.password?.toString().trim()) throw new Error('password is required for new employees')
  }

  if (entity === 'departments' && !row.name?.toString().trim()) {
    throw new Error('name is required')
  }

  if (entity === 'clients') {
    if (!row.contact_name?.toString().trim()) throw new Error('contact_name is required')
    if (!row.company_name?.toString().trim()) throw new Error('company_name is required')
    const status = row.status || 'active'
    if (!['active', 'inactive'].includes(status)) {
      throw new Error('status must be active or inactive')
    }
  }
}

export const importEntityService = async (entity, file, requester) => {
  if (!allowedEntities.includes(entity)) {
    throw new Error('Invalid import entity')
  }

  if (entity === 'employees' && requester.role !== 'admin') {
    throw new Error('Only admins can import employees')
  }

  if (entity === 'departments' && requester.role !== 'admin') {
    throw new Error('Only admins can import departments')
  }

  if (!file) {
    throw new Error('File is required')
  }

  const rows = parseUploadedFile(file)
  if (rows.length === 0) {
    throw new Error('File has no data rows')
  }

  const importRow = rowImporters[entity]
  const errors = []
  let successCount = 0

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2
    const row = rows[index]

    try {
      validateImportRow(entity, row)
      await importRow(row, requester)
      successCount += 1
    } catch (error) {
      errors.push({ row: rowNumber, message: error.message })
    }
  }

  return {
    entity,
    total: rows.length,
    success: successCount,
    failed: errors.length,
    errors
  }
}
