import { searchTasksService } from './taskServices.js'
import { searchProjectsService } from './projectServices.js'
import { searchEmployeesService } from './employeeService.js'
import { buildDownload } from '../utils/fileFormats.js'
import { buildReportPdf } from '../utils/reportPdf.js'

const reportTypes = {
  task_summary: {
    title: 'Task summary report',
    description: 'Overview of tasks by status and priority for the selected period.'
  },
  overdue_tasks: {
    title: 'Overdue tasks report',
    description: 'Tasks that are past due date and not completed.'
  },
  project_progress: {
    title: 'Project progress report',
    description: 'Completion progress for each project based on assigned tasks.'
  },
  employee_workload: {
    title: 'Employee workload report',
    description: 'Task distribution per employee in the selected period.'
  }
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const startOfDay = (date) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const isInDateRange = (dateValue, dateFrom, dateTo) => {
  if (!dateValue) return !dateFrom && !dateTo
  const date = startOfDay(dateValue)
  if (dateFrom && date < startOfDay(dateFrom)) return false
  if (dateTo) {
    const end = startOfDay(dateTo)
    end.setHours(23, 59, 59, 999)
    if (date > end) return false
  }
  return true
}

const loadReportData = async (requester) => {
  const query = { limit: 5000, page: 1 }
  const [tasksResult, projectsResult, employeesResult] = await Promise.all([
    searchTasksService(query, requester),
    searchProjectsService(query, requester),
    searchEmployeesService(query, requester)
  ])

  return {
    tasks: tasksResult.data,
    projects: projectsResult.data,
    employees: employeesResult.data
  }
}

const filterTasks = (tasks, filters) => {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.project_id && Number(task.project_id) !== Number(filters.project_id)) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (!isInDateRange(task.due_date || task.created_at, filters.date_from, filters.date_to)) return false
    return true
  })
}

const getProjectName = (projects, projectId) =>
  projects.find((project) => Number(project.id) === Number(projectId))?.name || 'Unknown'

const getEmployeeName = (employees, userId) => {
  const match = employees.find((employee) => Number(employee.user_id) === Number(userId))
  if (!match) return `User ${userId}`
  return [match.first_name, match.last_name].filter(Boolean).join(' ') || match.email
}

const buildTaskSummaryReport = (tasks, projects, filters) => {
  const overdue = tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false
    return startOfDay(task.due_date) < startOfDay()
  })

  const summary = [
    { label: 'Total tasks', value: tasks.length },
    { label: 'To Do', value: tasks.filter((task) => task.status === 'todo').length },
    { label: 'In progress', value: tasks.filter((task) => task.status === 'in_progress').length },
    { label: 'Completed', value: tasks.filter((task) => task.status === 'done').length },
    { label: 'Overdue', value: overdue.length },
    { label: 'High priority', value: tasks.filter((task) => task.priority === 'high').length }
  ]

  const headers = [
    { key: 'title', label: 'Task' },
    { key: 'project', label: 'Project' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'due_date', label: 'Due date' }
  ]

  const rows = tasks.map((task) => ({
    title: task.title,
    project: getProjectName(projects, task.project_id),
    status: task.status,
    priority: task.priority,
    due_date: formatDate(task.due_date)
  }))

  return { summary, headers, rows }
}

const buildOverdueTasksReport = (tasks, projects) => {
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false
    return startOfDay(task.due_date) < startOfDay()
  })

  const summary = [
    { label: 'Overdue tasks', value: overdueTasks.length }
  ]

  const headers = [
    { key: 'title', label: 'Task' },
    { key: 'project', label: 'Project' },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Due date' },
    { key: 'priority', label: 'Priority' }
  ]

  const rows = overdueTasks.map((task) => ({
    title: task.title,
    project: getProjectName(projects, task.project_id),
    status: task.status,
    due_date: formatDate(task.due_date),
    priority: task.priority
  }))

  return { summary, headers, rows }
}

const buildProjectProgressReport = (tasks, projects) => {
  const headers = [
    { key: 'project', label: 'Project' },
    { key: 'total_tasks', label: 'Total tasks' },
    { key: 'completed', label: 'Completed' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'progress', label: 'Progress %' }
  ]

  const rows = projects.map((project) => {
    const projectTasks = tasks.filter((task) => Number(task.project_id) === Number(project.id))
    const completed = projectTasks.filter((task) => task.status === 'done').length
    const inProgress = projectTasks.filter((task) => task.status === 'in_progress').length
    const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0

    return {
      project: project.name,
      total_tasks: projectTasks.length,
      completed,
      in_progress: inProgress,
      progress
    }
  })

  const summary = [
    { label: 'Projects', value: projects.length },
    { label: 'Average progress', value: rows.length ? `${Math.round(rows.reduce((sum, row) => sum + Number(row.progress), 0) / rows.length)}%` : '0%' }
  ]

  return { summary, headers, rows }
}

const buildEmployeeWorkloadReport = (tasks, employees, filters) => {
  let scopedEmployees = employees
  if (filters.department_id) {
    scopedEmployees = employees.filter(
      (employee) => Number(employee.department_id) === Number(filters.department_id)
    )
  }

  const headers = [
    { key: 'employee', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'total_tasks', label: 'Total tasks' },
    { key: 'completed', label: 'Completed' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'overdue', label: 'Overdue' }
  ]

  const rows = scopedEmployees.map((employee) => {
    const employeeTasks = tasks.filter((task) => Number(task.assigned_to) === Number(employee.user_id))
    const overdue = employeeTasks.filter((task) => {
      if (!task.due_date || task.status === 'done') return false
      return startOfDay(task.due_date) < startOfDay()
    })

    return {
      employee: [employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.email,
      department: employee.department_name,
      total_tasks: employeeTasks.length,
      completed: employeeTasks.filter((task) => task.status === 'done').length,
      in_progress: employeeTasks.filter((task) => task.status === 'in_progress').length,
      overdue: overdue.length
    }
  }).filter((row) => row.total_tasks > 0 || !filters.department_id)

  const summary = [
    { label: 'Employees in report', value: rows.length },
    { label: 'Total assigned tasks', value: rows.reduce((sum, row) => sum + row.total_tasks, 0) }
  ]

  return { summary, headers, rows }
}

const reportBuilders = {
  task_summary: (tasks, projects, employees, filters) => buildTaskSummaryReport(tasks, projects, filters),
  overdue_tasks: (tasks, projects) => buildOverdueTasksReport(tasks, projects),
  project_progress: (tasks, projects) => buildProjectProgressReport(tasks, projects),
  employee_workload: (tasks, projects, employees, filters) =>
    buildEmployeeWorkloadReport(tasks, employees, filters)
}

export const getReportTypesService = () =>
  Object.entries(reportTypes).map(([id, config]) => ({
    id,
    title: config.title,
    description: config.description
  }))

export const generateReportService = async (type, filters, requester) => {
  if (!reportTypes[type]) {
    throw new Error('Invalid report type')
  }

  const { tasks, projects, employees } = await loadReportData(requester)
  const scopedTasks = filterTasks(tasks, filters)
  const builder = reportBuilders[type]
  const { summary, headers, rows } = builder(scopedTasks, projects, employees, filters)

  const filterSummary = []
  if (filters.date_from) filterSummary.push(`From ${filters.date_from}`)
  if (filters.date_to) filterSummary.push(`To ${filters.date_to}`)
  if (filters.status) filterSummary.push(`Status: ${filters.status}`)
  if (filters.project_id) filterSummary.push(`Project ID: ${filters.project_id}`)
  if (filters.department_id) filterSummary.push(`Department ID: ${filters.department_id}`)

  return {
    type,
    title: reportTypes[type].title,
    description: reportTypes[type].description,
    generated_at: new Date().toISOString(),
    filters: {
      date_from: filters.date_from || '',
      date_to: filters.date_to || '',
      status: filters.status || '',
      project_id: filters.project_id || '',
      department_id: filters.department_id || '',
      priority: filters.priority || ''
    },
    filter_summary: filterSummary.join(' · ') || 'All records in your access scope',
    summary,
    headers,
    rows
  }
}

export const exportReportService = async (type, format, filters, requester) => {
  const report = await generateReportService(type, filters, requester)
  const filenameBase = `${type}-report`

  if (format === 'pdf') {
    const buffer = await buildReportPdf({
      title: report.title,
      subtitle: `${report.filter_summary} · Generated ${formatDate(report.generated_at)}`,
      summary: report.summary,
      rows: report.rows,
      headers: report.headers
    })

    return {
      buffer,
      mimeType: 'application/pdf',
      filename: `${filenameBase}.pdf`
    }
  }

  return buildDownload(report.rows, report.headers, format, filenameBase)
}
