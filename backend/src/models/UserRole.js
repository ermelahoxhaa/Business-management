import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './User.js'
import Role from './Role.js'

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'user_roles'
})


User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' })
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' })

UserRole.belongsTo(User, { foreignKey: 'user_id' })
UserRole.belongsTo(Role, { foreignKey: 'role_id' })

export default UserRole