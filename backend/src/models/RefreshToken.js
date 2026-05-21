import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './User.js'

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  token_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'refresh_tokens',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['expires_at'] },
    { fields: ['revoked_at'] }
  ]
})

RefreshToken.belongsTo(User, { foreignKey: 'user_id' })
User.hasMany(RefreshToken, { foreignKey: 'user_id' })

export default RefreshToken
