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
    console.log('Starting role and user seeding...')
    
    const adminRole = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin' }
    })
    console.log('Admin role created/found:', adminRole[0].name)
    
    const teamLeaderRole = await Role.findOrCreate({
      where: { name: 'team_leader' },
      defaults: { name: 'team_leader' }
    })
    console.log('Team leader role created/found:', teamLeaderRole[0].name)
    
    const employeeRole = await Role.findOrCreate({
      where: { name: 'employee' },
      defaults: { name: 'employee' }
    })
    console.log('Employee role created/found:', employeeRole[0].name)

   
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPassword) {
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
    }

    
    const teamLeaderEmail = process.env.TEAM_LEADER_EMAIL || 'team-leader@example.com'
    const teamLeaderPassword = process.env.TEAM_LEADER_PASSWORD || 'teamleader123'

    console.log('Checking for team leader user:', teamLeaderEmail)
    let teamLeaderUser = await User.findOne({ where: { email: teamLeaderEmail } })
    if (!teamLeaderUser) {
      console.log('Creating team leader user...')
      const hashedPassword = await bcrypt.hash(teamLeaderPassword, 10)
      teamLeaderUser = await User.create({
        first_name: 'Team',
        last_name: 'Leader',
        email: teamLeaderEmail,
        password_hash: hashedPassword
      })
      console.log('Team leader user created with ID:', teamLeaderUser.id)
    } else {
      console.log('Team leader user already exists with ID:', teamLeaderUser.id)
      const hashedPassword = await bcrypt.hash(teamLeaderPassword, 10)
      await teamLeaderUser.update({ password_hash: hashedPassword })
      console.log('Team leader password updated')
    }

    const existingTeamLeaderRole = await UserRole.findOne({
      where: { user_id: teamLeaderUser.id, role_id: teamLeaderRole[0].id }
    })
    if (!existingTeamLeaderRole) {
      await UserRole.create({
        user_id: teamLeaderUser.id,
        role_id: teamLeaderRole[0].id
      })
      console.log('Team leader role assigned')
    } else {
      console.log('Team leader already has role assigned')
    }


    const employeeEmail = process.env.EMPLOYEE_EMAIL || 'employee@example.com'
    const employeePassword = process.env.EMPLOYEE_PASSWORD || 'employee123'

    let employeeUser = await User.findOne({ where: { email: employeeEmail } })
    if (!employeeUser) {
      const hashedPassword = await bcrypt.hash(employeePassword, 10)
      employeeUser = await User.create({
        first_name: 'John',
        last_name: 'Doe',
        email: employeeEmail,
        password_hash: hashedPassword
      })

      await UserRole.create({
        user_id: employeeUser.id,
        role_id: employeeRole[0].id
      })
    }
  } catch (error) {
    console.error('Error seeding roles and users:', error)
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