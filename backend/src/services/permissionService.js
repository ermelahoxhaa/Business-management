import Role from '../models/Role.js'
import Permission from '../models/Permission.js'
import RolePermission from '../models/RolePermission.js'

export const PERMISSION_CODES = [
  'tasks.read',
  'tasks.create',
  'tasks.update',
  'tasks.delete',
  'projects.read',
  'projects.create',
  'projects.update',
  'projects.delete',
  'employees.read',
  'employees.create',
  'employees.update',
  'departments.read',
  'departments.create',
  'clients.read',
  'clients.create',
  'clients.update',
  'clients.delete',
  'invoices.read',
  'invoices.create',
  'invoices.update',
  'invoices.delete',
  'reports.read',
  'reports.export',
  'data_transfer.export',
  'data_transfer.import',
  'data_transfer.import_staff',
  'users.read',
  'invoices.read',
  'invoices.create',
  'invoices.update',
  'client_projects.manage',
  'notifications.read'
]

const ROLE_PERMISSION_MAP = {
  admin: PERMISSION_CODES,
  team_leader: [
    'tasks.read',
    'tasks.create',
    'tasks.update',
    'tasks.delete',
    'projects.read',
    'projects.create',
    'projects.update',
    'employees.read',
    'departments.read',
    'clients.read',
    'clients.create',
    'clients.update',
    'clients.delete',
    'invoices.read',
    'invoices.create',
    'invoices.update',
    'invoices.delete',
    'reports.read',
    'reports.export',
    'data_transfer.export',
    'data_transfer.import',
    'users.read',
    'invoices.read',
    'invoices.create',
    'invoices.update',
    'client_projects.manage',
    'notifications.read'
  ],
  employee: ['notifications.read']
}

export const seedPermissions = async () => {
  for (const code of PERMISSION_CODES) {
    await Permission.findOrCreate({
      where: { code },
      defaults: { code, description: code.replace(/\./g, ' ') }
    })
  }

  const roles = await Role.findAll()
  const permissions = await Permission.findAll()
  const permissionByCode = Object.fromEntries(permissions.map((item) => [item.code, item]))

  for (const role of roles) {
    const codes = ROLE_PERMISSION_MAP[role.name] || []
    for (const code of codes) {
      const permission = permissionByCode[code]
      if (!permission) continue
      await RolePermission.findOrCreate({
        where: { role_id: role.id, permission_id: permission.id },
        defaults: { role_id: role.id, permission_id: permission.id }
      })
    }
  }
}

export const getPermissionsForRole = async (roleName) => {
  const role = await Role.findOne({
    where: { name: roleName },
    include: [{ model: Permission, attributes: ['code'], through: { attributes: [] } }]
  })

  if (!role) return []
  return role.Permissions?.map((permission) => permission.code) || []
}

export const roleHasPermission = (permissions, code) => permissions.includes(code)
