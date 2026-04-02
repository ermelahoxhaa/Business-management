import app from './src/app.js'
import dotenv from 'dotenv'
import sequelize from './src/config/database.js'
import connectMongo from './src/config/mongo.js'

dotenv.config()

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL connected')

    await sequelize.sync({ alter: true })
    console.log('Database synced')

    await connectMongo()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()