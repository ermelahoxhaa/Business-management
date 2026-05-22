import { Op } from 'sequelize'
import Notification from '../models/Notification.js'
import { emitToUser } from '../config/socket.js'
import { logActivity } from './activityService.js'

export const createNotification = async ({ userId, title, message, entityType, entityId }) => {
  const notification = await Notification.create({
    user_id: userId,
    title,
    message,
    entity_type: entityType || null,
    entity_id: entityId || null
  })

  const payload = {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    entity_type: notification.entity_type,
    entity_id: notification.entity_id,
    read_at: notification.read_at,
    created_at: notification.created_at
  }

  emitToUser(userId, 'notification', payload)

  await logActivity({
    userId,
    action: 'notification',
    entityType: entityType || 'notification',
    entityId: notification.id,
    message
  })

  return notification
}

export const listNotifications = async (userId, limit = 50) => {
  const rows = await Notification.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    read_at: row.read_at,
    created_at: row.created_at
  }))
}

export const countUnread = async (userId) =>
  Notification.count({
    where: { user_id: userId, read_at: null }
  })

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId }
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  if (!notification.read_at) {
    await notification.update({ read_at: new Date() })
  }

  return notification
}

export const markAllNotificationsRead = async (userId) => {
  await Notification.update(
    { read_at: new Date() },
    { where: { user_id: userId, read_at: { [Op.is]: null } } }
  )
}
