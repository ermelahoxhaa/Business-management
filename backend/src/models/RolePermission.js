import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import Role from './Role.js'
import Permission from './Permission.js'

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'roles', key: 'id' }
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'permissions', key: 'id' }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'role_permissions',
  indexes: [
    { unique: true, fields: ['role_id', 'permission_id'] },
    { fields: ['role_id'] },
    { fields: ['permission_id'] }
  ]
})

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id' })
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id' })
RolePermission.belongsTo(Role, { foreignKey: 'role_id' })
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' })

export default RolePermission
