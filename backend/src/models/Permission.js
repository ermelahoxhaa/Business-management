import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'permissions',
  indexes: [{ fields: ['code'] }]
})

export default Permission
