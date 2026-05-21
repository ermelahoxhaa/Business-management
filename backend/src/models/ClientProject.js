import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const ClientProject = sequelize.define('ClientProject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clients', key: 'id' }
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'projects', key: 'id' }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'client_projects',
  indexes: [
    { unique: true, fields: ['client_id', 'project_id'] },
    { fields: ['client_id'] },
    { fields: ['project_id'] }
  ]
})

export default ClientProject
