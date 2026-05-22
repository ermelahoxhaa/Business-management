import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'invoices', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  method: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'payments',
  indexes: [{ fields: ['invoice_id'] }, { fields: ['paid_at'] }]
})

export default Payment
