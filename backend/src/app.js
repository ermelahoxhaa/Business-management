import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
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
app.use('/api/auth', authRoutes)

export default app