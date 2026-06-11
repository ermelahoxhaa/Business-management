import http from 'http'
import app from './src/app.js'
import sequelize from './src/config/database.js'
import { Op } from 'sequelize'
import connectMongo from './src/config/mongo.js'
import { initSocket } from './src/config/socket.js'
import './src/models/User.js'
import './src/models/Role.js'
import './src/models/UserRole.js'
import './src/models/Project.js'
import './src/models/Task.js'
import './src/models/TaskComment.js'
import './src/models/Department.js'
import './src/models/Employee.js'
import './src/models/Client.js'
import './src/models/RefreshToken.js'
import './src/models/Permission.js'
import './src/models/RolePermission.js'
import './src/models/ImportBatch.js'
import './src/models/ReportRun.js'
import './src/models/AuditLog.js'
import './src/models/ClientProject.js'
import './src/models/Invoice.js'
import './src/models/Notification.js'
import './src/models/ProjectMember.js'
import './src/models/InvoiceItem.js'
import './src/models/Payment.js'
import './src/models/ClientContact.js'
import './src/models/TaskStatusHistory.js'
import CompanySetting from './src/models/CompanySetting.js'
import User from './src/models/User.js'
import Role from './src/models/Role.js'
import UserRole from './src/models/UserRole.js'
import { ensureEmployeeProfile } from './src/repositories/employeeRepository.js'
import { seedPermissions } from './src/services/permissionService.js'
import bcrypt from 'bcrypt'

const PORT = process.env.PORT || 5000

const seedRolesAndAdmin = async () => {
  try {
    const adminRole = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin' }
    })

    const teamLeaderRole = await Role.findOrCreate({
      where: { name: 'team_leader' },
      defaults: { name: 'team_leader' }
    })

    const employeeRole = await Role.findOrCreate({
      where: { name: 'employee' },
      defaults: { name: 'employee' }
    })

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    let adminUser = null

    if (adminEmail && adminPassword) {
      adminUser = await User.findOne({ where: { email: adminEmail } })
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

    let teamLeaderUser = await User.findOne({ where: { email: teamLeaderEmail } })
    if (!teamLeaderUser) {
      const hashedPassword = await bcrypt.hash(teamLeaderPassword, 10)
      teamLeaderUser = await User.create({
        first_name: 'Team',
        last_name: 'Leader',
        email: teamLeaderEmail,
        password_hash: hashedPassword
      })
    } else {
      const hashedPassword = await bcrypt.hash(teamLeaderPassword, 10)
      await teamLeaderUser.update({ password_hash: hashedPassword })
    }

    const existingTeamLeaderRole = await UserRole.findOne({
      where: { user_id: teamLeaderUser.id, role_id: teamLeaderRole[0].id }
    })
    if (!existingTeamLeaderRole) {
      await UserRole.create({
        user_id: teamLeaderUser.id,
        role_id: teamLeaderRole[0].id
      })
    }

    const seedCreatedBy = adminUser?.id || teamLeaderUser.id

    await ensureEmployeeProfile({
      user_id: teamLeaderUser.id,
      created_by: seedCreatedBy,
      position: 'Team Leader'
    })

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
    } else {
      const existingEmployeeRole = await UserRole.findOne({
        where: { user_id: employeeUser.id, role_id: employeeRole[0].id }
      })
      if (!existingEmployeeRole) {
        await UserRole.create({
          user_id: employeeUser.id,
          role_id: employeeRole[0].id
        })
      }
    }

    await ensureEmployeeProfile({
      user_id: employeeUser.id,
      created_by: seedCreatedBy,
      position: 'Employee'
    })

    await CompanySetting.findOrCreate({
      where: { key: 'company_name' },
      defaults: { key: 'company_name', value: 'Business Management' }
    })
  } catch (error) {
    console.error('Error seeding roles and users:', error)
  }
}

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL connected')

    await sequelize.sync({ alter: true })

    await seedRolesAndAdmin()
    await seedPermissions()

    await connectMongo()

    const httpServer = http.createServer(app)
    initSocket(httpServer)

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`API docs: http://localhost:${PORT}/api/docs`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()
