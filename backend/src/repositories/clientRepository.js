import { Op } from 'sequelize'
import Client from '../models/Client.js'

export const createClient = (data) => Client.create(data)
export const getClientById = (id) => Client.findByPk(id)
export const updateClient = (id, data) => Client.update(data, { where: { id } })
export const deleteClient = (id) => Client.destroy({ where: { id } })

export const searchClients = async ({ search, status, sort, order, limit, offset }) => {
  const where = {}

  if (search) {
    const value = `%${search}%`
    where[Op.or] = [
      { contact_name: { [Op.iLike]: value } },
      { company_name: { [Op.iLike]: value } },
      { email: { [Op.iLike]: value } },
      { phone: { [Op.iLike]: value } },
      { address: { [Op.iLike]: value } }
    ]
  }

  if (status) {
    where.status = status
  }

  return Client.findAndCountAll({
    where,
    order: [[sort, order]],
    limit,
    offset
  })
}
