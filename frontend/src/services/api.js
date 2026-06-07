import axios from 'axios'
import { getToken, getRefreshToken, setAuthData, clearAuthData } from './auth.js'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

API.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearAuthData()
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = API.post('/auth/refresh', { refreshToken })
        .then((response) => {
          const data = response.data
          const accessToken = data.accessToken || data.token
          setAuthData(accessToken, data.user, data.role, data.refreshToken)
          return accessToken
        })
        .catch((refreshError) => {
          clearAuthData()
          throw refreshError
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      const accessToken = await refreshPromise
      originalRequest._retry = true
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return API(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export const signupUser = (data) => API.post('/auth/signup', data)

export const loginUser = (data) => API.post('/auth/login', data)

export const refreshSession = (refreshToken) => API.post('/auth/refresh', { refreshToken })

export const logoutUser = (refreshToken) => API.post('/auth/logout', { refreshToken })

export const getTasks = (params) => API.get('/tasks', { params })
export const getMyTasks = (params) => API.get('/tasks/my-tasks', { params })
export const createTask = (data) => API.post('/tasks', data)
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data)
export const updateMyTaskStatus = (id, status) => API.patch(`/tasks/${id}/status`, { status })
export const deleteTask = (id) => API.delete(`/tasks/${id}`)

export const getProjects = (params) => API.get('/projects', { params })
export const getMyProjects = () => API.get('/projects/my-projects')
export const createProject = (data) => API.post('/projects', data)
export const updateProject = (id, data) => API.put(`/projects/${id}`, data)
export const deleteProject = (id) => API.delete(`/projects/${id}`)

export const getUsers = () => API.get('/auth/users')

export const getComments = (taskId) => API.get(`/comments/task/${taskId}`)
export const createComment = (data) => API.post('/comments', data)

export const getDepartments = (params) => API.get('/departments', { params })
export const createDepartment = (data) => API.post('/departments', data)

export const getMyEmployeeProfile = () => API.get('/employees/me')

export const getClients = (params) => API.get('/clients', { params })
export const getClient = (id) => API.get(`/clients/${id}`)
export const createClient = (data) => API.post('/clients', data)
export const updateClient = (id, data) => API.put(`/clients/${id}`, data)
export const deleteClient = (id) => API.delete(`/clients/${id}`)

export const getInvoices = (params) => API.get('/invoices', { params })
export const getInvoice = (id) => API.get(`/invoices/${id}`)
export const createInvoice = (data) => API.post('/invoices', data)
export const updateInvoice = (id, data) => API.put(`/invoices/${id}`, data)
export const deleteInvoice = (id) => API.delete(`/invoices/${id}`)

export const getEmployees = (params) => API.get('/employees', { params })
export const createEmployee = (data) => API.post('/employees', data)
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data)
export const updateEmployeeStatus = (id, status) => API.patch(`/employees/${id}/status`, { status })

export const exportEntityData = (entity, format, params) =>
  API.get(`/data-transfer/${entity}/export`, {
    params: { format, ...params },
    responseType: 'blob'
  })

export const importEntityData = (entity, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return API.post(`/data-transfer/${entity}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getReportTypes = () => API.get('/reports/types')

export const previewReport = (type, params) =>
  API.get(`/reports/${type}/preview`, { params })

export const exportReport = (type, format, params) =>
  API.get(`/reports/${type}/export`, {
    params: { format, ...params },
    responseType: 'blob'
  })

export const getNotifications = () => API.get('/notifications')

export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`)

export const markAllNotificationsRead = () => API.patch('/notifications/read-all')

export const sendNotification = (payload) => API.post('/notifications/send', payload)

export const getActivity = () => API.get('/activity')

export const getActivityStats = () => API.get('/activity/stats')

export const addInvoiceItem = (invoiceId, data) => API.post(`/invoices/${invoiceId}/items`, data)
export const deleteInvoiceItem = (invoiceId, itemId) => API.delete(`/invoices/${invoiceId}/items/${itemId}`)
export const addInvoicePayment = (invoiceId, data) => API.post(`/invoices/${invoiceId}/payments`, data)

export const getClientContacts = (clientId) => API.get(`/clients/${clientId}/contacts`)
export const addClientContact = (clientId, data) => API.post(`/clients/${clientId}/contacts`, data)
export const deleteClientContact = (clientId, contactId) => API.delete(`/clients/${clientId}/contacts/${contactId}`)
export const getClientProjects = (clientId) => API.get(`/clients/${clientId}/projects`)
export const linkClientProject = (clientId, data) => API.post(`/clients/${clientId}/projects`, data)
export const unlinkClientProject = (clientId, linkId) => API.delete(`/clients/${clientId}/projects/${linkId}`)

export const getProjectMembers = (projectId) => API.get(`/projects/${projectId}/members`)
export const addProjectMember = (projectId, data) => API.post(`/projects/${projectId}/members`, data)
export const removeProjectMember = (projectId, memberId) => API.delete(`/projects/${projectId}/members/${memberId}`)

export const getCompanySettings = () => API.get('/settings/company')
export const updateCompanySettings = (data) => API.put('/settings/company', data)
