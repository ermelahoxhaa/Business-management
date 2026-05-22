import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const TaskStatusHistory = sequelize.define('TaskStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tasks', key: 'id' }
  },
  old_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  timestamps: true,
  updatedAt: false,
  underscored: true,
  tableName: 'task_status_history',
  indexes: [{ fields: ['task_id'] }, { fields: ['changed_by'] }]
})

export default TaskStatusHistory
