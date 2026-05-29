import { Op } from "sequelize";
import Invoice from "../models/Invoice.js";

export const createInvoice = (data) => Invoice.create(data);
export const getInvoiceById = (id) => Invoice.findByPk(id);
export const updateInvoice = (id, data) => Invoice.update(data, { where: { id } });
export const deleteInvoice = (id) => Invoice.destroy({ where: { id } });

export const searchInvoices = async ({ search, status, sort, order, limit, offset }) => {
  const where = {}

  if (search) {
    const value = `%${search}%`
    where[Op.or] = [
      { invoice_number: { [Op.iLike]: value } },
      { client_name: { [Op.iLike]: value } },
      { amount: { [Op.iLike]: value } },
      {status: { [Op.iLike]: value } },
      { due_date: { [Op.iLike]: value } }
    ]
  }

  if (status) {
    where.status = status
  }

  return Invoice.findAndCountAll({
    where,
    order: [[sort, order]],
    limit,
    offset
  })
}