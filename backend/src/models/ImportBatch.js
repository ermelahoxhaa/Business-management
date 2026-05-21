import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const ImportBatch = sequelize.define('ImportBatch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  total_rows: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  success_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  failed_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('completed', 'partial', 'failed'),
    allowNull: false,
    defaultValue: 'completed'
  },
  error_summary: {
    type: DataTypes.JSONB,
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
  tableName: 'import_batches',
  indexes: [
    { fields: ['entity'] },
    { fields: ['created_by'] },
    { fields: ['created_at'] }
  ]
})

export default ImportBatch
