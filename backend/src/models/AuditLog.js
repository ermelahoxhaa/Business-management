import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: false,
  underscored: true,
  tableName: 'audit_logs',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['entity_type'] },
    { fields: ['action'] },
    { fields: ['created_at'] }
  ]
})

export default AuditLog
