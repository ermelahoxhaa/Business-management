import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'projects', key: 'id' }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  role: {
    type: DataTypes.ENUM('owner', 'member'),
    allowNull: false,
    defaultValue: 'member'
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'project_members',
  indexes: [
    { unique: true, fields: ['project_id', 'user_id'] },
    { fields: ['project_id'] },
    { fields: ['user_id'] }
  ]
})

export default ProjectMember
