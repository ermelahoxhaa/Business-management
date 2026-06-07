import { Op } from "sequelize";
import Invoice from "../models/Invoice.js";
import InvoiceItem from "../models/InvoiceItem.js";
import Payment from "../models/Payment.js";

export const createInvoice = (data) => Invoice.create(data);
export const getInvoiceById = (id) => Invoice.findByPk(id);
export const getInvoiceItems = (invoiceId) =>
  InvoiceItem.findAll({ where: { invoice_id: invoiceId }, order: [['created_at', 'ASC']] });
export const createInvoiceItem = (data) => InvoiceItem.create(data);
export const deleteInvoiceItem = (id, invoiceId) =>
  InvoiceItem.destroy({ where: { id, invoice_id: invoiceId } });
export const getInvoicePayments = (invoiceId) =>
  Payment.findAll({ where: { invoice_id: invoiceId }, order: [['paid_at', 'DESC']] });
export const createPayment = (data) => Payment.create(data);
export const updateInvoice = (id, data) => Invoice.update(data, { where: { id } });
export const deleteInvoice = (id) => Invoice.destroy({ where: { id } });

export const searchInvoices = async ({ search, status, sort, order, limit, offset }) => {
  const where = {}

  if (search) {
    const value = `%${search}%`
    where[Op.or] = [
      { invoice_number: { [Op.iLike]: value } },
      { status: { [Op.iLike]: value } }
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