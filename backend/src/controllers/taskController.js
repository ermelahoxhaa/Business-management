import {
  createTaskService,
  searchTasksService,
  searchMyTasksService,
  getTaskByIdService,
  getTasksByAssignedUserService,
  getTasksByProjectService,
  updateTaskService,
  deleteTaskService
} from '../services/taskServices.js'
import { logAudit } from '../services/auditService.js'
import { createNotification } from '../services/notificationService.js'
import TaskStatusHistory from '../models/TaskStatusHistory.js'

export const createTaskController = async (req, res) => {
  try {
    const task = await createTaskService({
      ...req.body,
      created_by: req.user.id
    }, req.user)
    await logAudit({
      userId: req.user.id,
      action: 'create',
      entityType: 'task',
      entityId: task.id,
      ipAddress: req.ip
    })
    if (task.assigned_to) {
      await createNotification({
        userId: task.assigned_to,
        title: 'New task assigned',
        message: `You were assigned: ${task.title}`,
        entityType: 'task',
        entityId: task.id
      })
    }
    res.status(201).json(task)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllTasksController = async (req, res) => {
  try {
    const result = await searchTasksService(req.query, req.user)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getMyTasksController = async (req, res) => {
  try {
    const result = await searchMyTasksService(req.user.id, req.query)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTaskByIdController = async (req, res) => {
  try {
    const task = await getTaskByIdService(req.params.id)
    res.json(task)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTasksByAssignedUserController = async (req, res) => {
  try {
    const tasks = await getTasksByAssignedUserService(req.params.userId)
    res.json(tasks)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getTasksByProjectController = async (req, res) => {
  try {
    const tasks = await getTasksByProjectService(req.params.projectId)
    res.json(tasks)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateMyTaskStatusController = async (req, res) => {
  try {
    const task = await getTaskByIdService(req.params.id)

    if (Number(task.assigned_to) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'You can update only your own task status' })
    }

    const allowedTransitions = {
      todo: ['in_progress'],
      in_progress: ['done'],
      done: []
    }
    const nextStatus = req.body.status

    if (!allowedTransitions[task.status]?.includes(nextStatus)) {
      return res.status(400).json({ message: 'Employees can only move tasks from pending to in progress, then to completed' })
    }

    const result = await updateTaskService(req.params.id, {
      status: nextStatus,
      updated_by: req.user.id
    })
    await TaskStatusHistory.create({
      task_id: task.id,
      old_status: task.status,
      new_status: nextStatus,
      changed_by: req.user.id
    })
    if (task.created_by && Number(task.created_by) !== Number(req.user.id)) {
      await createNotification({
        userId: task.created_by,
        title: 'Task status updated',
        message: `${task.title} is now ${nextStatus.replace('_', ' ')}`,
        entityType: 'task',
        entityId: task.id
      })
    }
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateTaskController = async (req, res) => {
  try {
    const result = await updateTaskService(req.params.id, {
      ...req.body,
      updated_by: req.user.id
    }, req.user)
    await logAudit({
      userId: req.user.id,
      action: 'update',
      entityType: 'task',
      entityId: Number(req.params.id),
      ipAddress: req.ip
    })
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const deleteTaskController = async (req, res) => {
  try {
    const result = await deleteTaskService(req.params.id, req.user)
    await logAudit({
      userId: req.user.id,
      action: 'delete',
      entityType: 'task',
      entityId: Number(req.params.id),
      ipAddress: req.ip
    })
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
