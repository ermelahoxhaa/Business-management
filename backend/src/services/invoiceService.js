import {
    createInvoice,
    deleteInvoice,
    getInvoiceById,
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

    if (clientId !== undefined) payload.client_id = String(clientId).trim()
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
        allowedSort: ['invoice_number', 'client_name', 'amount', 'status', 'due_date', 'created_at', 'updated_at'],
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
    return invoice
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

    await updateInvoice(id, payload)
    return getInvoiceById(id)
}

export const deleteInvoiceService = async (id) => {
    const existingInvoice = await getInvoiceById(id)
    if (!existingInvoice) {
        throw new Error('Invoice not found')
    } 
    await deleteInvocie(id)
    return { deleted: true }
    }