import {
    createInvoice,
    createInvoiceItem,
    createPayment,
    deleteInvoice,
    deleteInvoiceItem,
    getInvoiceById,
    getInvoiceItems,
    getInvoicePayments,
    searchInvoices,
    updateInvoice
} from "../repositories/invoiceRepository.js";
import { parseListQuery, buildPaginatedResponse } from "../utils/queryParser.js";

const statusWhitelist = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

const normalizeInvoicePayload = ({
    client_id,
    ClientId,
    invoice_number,
    invoiceNumber,
    amount,
    currency,
    status,
    due_date,
    issued_at,
    updated_by
}) => {
    const payload = {}

    const clientId = client_id ?? ClientId
    const invoiceNumberValue = invoice_number ?? invoiceNumber

    if (clientId !== undefined) payload.client_id = Number(clientId)
    if (invoiceNumberValue !== undefined) payload.invoice_number = String(invoiceNumberValue).trim()
    if (amount !== undefined) payload.amount = parseFloat(amount)
    if (currency !== undefined) payload.currency = String(currency).trim().toUpperCase()
    if (status !== undefined) payload.status = status
    if (due_date !== undefined) payload.due_date = due_date ? new Date(due_date) : null
    if (issued_at !== undefined) payload.issued_at = issued_at ? new Date(issued_at) : null
    if (updated_by !== undefined) payload.updated_by = updated_by

    return payload
}

export const searchInvoicesService = async (query) => {
    const listQuery = parseListQuery(query, {
        allowedSort: ['invoice_number', 'amount', 'status', 'due_date', 'created_at', 'updated_at'],
        defaultSort: 'created_at'
    })

    if (query.status && !statusWhitelist.includes(query.status)) {
        throw new Error('Status must be draft, sent, paid, overdue or cancelled')
    }

    const {rows, count} = await searchInvoices({
        search: listQuery.search,
        status: query.status,
        sort: listQuery.sort,
        order: listQuery.order,
        limit: listQuery.limit,
        offset: listQuery.offset
    })

    return buildPaginatedResponse(rows, count, listQuery)
}

export const createInvoiceService = async (payload) => {
    const data = normalizeInvoicePayload(payload)

    if(!data.client_id) {
        throw new Error('Client ID is required')
    }

    if(!data.invoice_number) {
        throw new Error('Invoice number is required')
    }

    if (data.status && !statusWhitelist.includes(data.status)) {
        throw new Error('Status must be draft, sent, paid, overdue or cancelled')
    }

    return createInvoice({
        client_id: data.client_id,
        invoice_number: data.invoice_number,
        amount: data.amount || 0,
        currency: data.currency || 'EUR',
        status: data.status || 'draft',
        due_date: data.due_date || null,
        issued_at: data.issued_at || null,
        created_by: payload.created_by
    })
}

export const getInvoiceByIdService = async (id) => {
    const invoice = await getInvoiceById(id)
    if (!invoice) {
        throw new Error('Invoice not found')
    }

    const [items, payments] = await Promise.all([
        getInvoiceItems(id),
        getInvoicePayments(id)
    ])

    return {
        ...invoice.toJSON(),
        items,
        payments
    }
}

export const addInvoiceItemService = async (invoiceId, payload) => {
    const invoice = await getInvoiceById(invoiceId)
    if (!invoice) throw new Error('Invoice not found')

    const description = String(payload.description || '').trim()
    if (!description) throw new Error('Item description is required')

    const quantity = Number(payload.quantity || 1)
    const unitPrice = Number(payload.unit_price || 0)

    return createInvoiceItem({
        invoice_id: Number(invoiceId),
        description,
        quantity: quantity > 0 ? quantity : 1,
        unit_price: unitPrice
    })
}

export const deleteInvoiceItemService = async (invoiceId, itemId) => {
    const deleted = await deleteInvoiceItem(itemId, invoiceId)
    if (!deleted) throw new Error('Invoice item not found')
    return { deleted: true }
}

export const addInvoicePaymentService = async (invoiceId, payload) => {
    const invoice = await getInvoiceById(invoiceId)
    if (!invoice) throw new Error('Invoice not found')

    const amount = Number(payload.amount)
    if (!amount || amount <= 0) throw new Error('Payment amount must be greater than 0')

    return createPayment({
        invoice_id: Number(invoiceId),
        amount,
        paid_at: payload.paid_at ? new Date(payload.paid_at) : new Date(),
        method: payload.method ? String(payload.method).trim() : null
    })
}

export const updateInvoiceService = async (id, payload) => {
    const existingInvoice = await getInvoiceById(id)
    if (!existingInvoice) {
        throw new Error('Invoice not found')
    }

    const data = normalizeInvoicePayload(payload)

    if (data.status && !statusWhitelist.includes(data.status)) {
        throw new Error('Status must be draft, sent, paid, overdue or cancelled')
    }

    if (data.invoice_number !== undefined && !data.invoice_number) {
        throw new Error('Invoice number is required')
    }

    if (data.client_id !== undefined && !data.client_id) {
        throw new Error('Client ID is required')
    }

    await updateInvoice(id, data)
    return getInvoiceById(id)
}

export const deleteInvoiceService = async (id) => {
    const existingInvoice = await getInvoiceById(id)
    if (!existingInvoice) {
        throw new Error('Invoice not found')
    }
    await deleteInvoice(id)
    return { deleted: true }
}