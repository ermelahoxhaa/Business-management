import app from './src/app.js'
import dotenv from 'dotenv'
import sequelize from './src/config/database.js'
import { Op } from 'sequelize'
import connectMongo from './src/config/mongo.js'
import User from './src/models/User.js'
import Role from './src/models/Role.js'
import UserRole from './src/models/UserRole.js'
import bcrypt from 'bcrypt'

dotenv.config()

const PORT = process.env.PORT || 5000

const seedRolesAndAdmin = async () => {
  try {
    const adminRole = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin' }
    })
    const employeeRole = await Role.findOrCreate({
      where: { name: 'employee' },
      defaults: { name: 'employee' }
    })

   
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return 
    }

    let adminUser = await User.findOne({ where: { email: adminEmail } })
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      adminUser = await User.create({
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password_hash: hashedPassword
      })
    }

   
    await UserRole.destroy({
      where: {
        user_id: adminUser.id,
        role_id: {
          [Op.ne]: adminRole[0].id
        }
      }
    })

    const existingAdminRole = await UserRole.findOne({
      where: { user_id: adminUser.id, role_id: adminRole[0].id }
    })

    if (!existingAdminRole) {
      await UserRole.create({
        user_id: adminUser.id,
        role_id: adminRole[0].id
      })
    }
  } catch (error) {
    console.error('Error seeding roles and admin user:', error)
  }
}

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL connected')

    await sequelize.sync({ alter: true })
    console.log('Database synced')

    await seedRolesAndAdmin()

    await connectMongo()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()