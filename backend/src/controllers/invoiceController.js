import {
    addInvoiceItemService,
    addInvoicePaymentService,
    createInvoiceService,
    deleteInvoiceItemService,
    getInvoiceByIdService,
    updateInvoiceService,
    deleteInvoiceService,
    searchInvoicesService
} from "../services/invoiceService.js"
import { logAudit } from "../services/auditService.js"


export const getInvoiceController = async (req, res) => {
    try {
        const result = await searchInvoicesService(req.query)
        res.json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const getInvoiceByIdController = async (req, res) => {
    try {
        const invoice = await getInvoiceByIdService(req.params.id)
        res.json(invoice)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const createInvoiceController = async (req, res) => {
    try {
        const invoice = await createInvoiceService({
            ...req.body,
            created_by: req.user.id
        })
        await logAudit({
            userId: req.user.id,
            action: 'create',
            entityType: 'invoice',
            entityId: invoice.id,
            ipAddress: req.ip
        })
        res.status(201).json(invoice)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateInvoiceController = async (req, res) => {
    try {
        const invoice = await updateInvoiceService(req.params.id, {
            ...req.body,
            updated_by: req.user.id
        })
        await logAudit({
            userId: req.user.id,
            action: 'update',
            entityType: 'invoice',
            entityId: Number(req.params.id),
            ipAddress: req.ip
        })
        res.json(invoice)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const addInvoiceItemController = async (req, res) => {
    try {
        const item = await addInvoiceItemService(req.params.id, req.body)
        res.status(201).json(item)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const deleteInvoiceItemController = async (req, res) => {
    try {
        const result = await deleteInvoiceItemService(req.params.id, req.params.itemId)
        res.json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const addInvoicePaymentController = async (req, res) => {
    try {
        const payment = await addInvoicePaymentService(req.params.id, req.body)
        res.status(201).json(payment)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const deleteInvoiceController = async (req, res) => {
    try {
        await deleteInvoiceService(req.params.id)
        await logAudit({
            userId: req.user.id,
            action: 'delete',
            entityType: 'invoice',
            entityId: Number(req.params.id),
            ipAddress: req.ip
        })
        res.json({ message: 'Invoice deleted successfully' })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}