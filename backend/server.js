import app from './src/app.js'
import dotenv from 'dotenv'
import sequelize from './src/config/database.js'
import connectMongo from './src/config/mongo.js'
import User from './src/models/User.js'
import bcrypt from 'bcrypt'

dotenv.config()

const PORT = process.env.PORT || 5000

const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@example.com'
    const existingAdmin = await User.findOne({ where: { email: adminEmail } })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await User.create({
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'admin'
      })
      console.log('Default admin user created')
    }
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL connected')

    await sequelize.sync({ alter: true })
    console.log('Database synced')

    await seedAdminUser()

    await connectMongo()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()