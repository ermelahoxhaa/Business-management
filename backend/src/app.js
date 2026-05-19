import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}))

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running...')
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' })
})

import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import dataTransferRoutes from './routes/dataTransferRoutes.js'
import reportRoutes from './routes/reportRoutes.js'

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/data-transfer', dataTransferRoutes)
app.use('/api/reports', reportRoutes)

export default app