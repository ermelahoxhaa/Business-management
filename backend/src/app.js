import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running...')
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' })
})

export default app