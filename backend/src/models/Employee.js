import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './User.js'
import Department from './Department.js'

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employment_status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'employees',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['department_id'] },
    { fields: ['employment_status'] },
    { fields: ['created_by'] },
    { fields: ['updated_by'] }
  ]
})

Employee.belongsTo(User, { foreignKey: 'user_id' })
Employee.belongsTo(Department, { foreignKey: 'department_id' })

export default Employee
