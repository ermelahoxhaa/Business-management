import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const ReportRun = sequelize.define('ReportRun', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  format: {
    type: DataTypes.STRING,
    allowNull: true
  },
  filters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  row_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  run_mode: {
    type: DataTypes.ENUM('preview', 'export'),
    allowNull: false,
    defaultValue: 'preview'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'report_runs',
  indexes: [
    { fields: ['report_type'] },
    { fields: ['created_by'] },
    { fields: ['created_at'] }
  ]
})

export default ReportRun
