import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})

export const signupUser = (data) => API.post('/auth/signup', data)

export const loginUser = (data) => API.post('/auth/login', data)

export const getTasks = () => API.get('/tasks')
export const createTask = (data) => API.post('/tasks', data)
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data)
export const deleteTask = (id) => API.delete(`/tasks/${id}`)

export const getProjects = () => API.get('/projects')
export const createProject = (data) => API.post('/projects', data)

export const getUsers = () => API.get('/users')

export const getComments = (taskId) => API.get(`/comments/task/${taskId}`)
export const createComment = (data) => API.post('/comments', data)
