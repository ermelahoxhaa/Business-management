import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Invoice = sequelize.define('Invoice', {
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
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR'
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  issued_at: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'invoices',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['status'] },
    { fields: ['due_date'] },
    { fields: ['invoice_number'] }
  ]
})

export default Invoice
