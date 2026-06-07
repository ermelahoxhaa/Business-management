import { Op } from 'sequelize'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import UserRole from '../models/UserRole.js'
import Role from '../models/Role.js'
import { emitToUser } from '../config/socket.js'
import { logActivity } from './activityService.js'
import { logNotificationEvent } from './eventLogService.js'

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

  await logNotificationEvent({
    notificationId: notification.id,
    userId,
    eventType: 'delivered',
    channel: 'socket',
    title: notification.title,
    message: notification.message
  })

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

const resolveTargetUserIds = async ({ target, role, userId }) => {
  if (target === 'user') {
    if (!userId) throw new Error('userId is required for a single-user notification')
    return [Number(userId)]
  }

  if (target === 'all') {
    const users = await User.findAll({ attributes: ['id'] })
    return users.map((user) => user.id)
  }

  if (target === 'role') {
    if (!role) throw new Error('role is required for role-based notifications')
    const roleRecord = await Role.findOne({ where: { name: role } })
    if (!roleRecord) throw new Error('Invalid role')

    const links = await UserRole.findAll({
      where: { role_id: roleRecord.id },
      attributes: ['user_id']
    })
    return links.map((link) => link.user_id)
  }

  throw new Error('Invalid notification target')
}

export const sendNotifications = async ({ title, message, target, role, userId }) => {
  const trimmedTitle = title?.trim()
  const trimmedMessage = message?.trim()

  if (!trimmedTitle || !trimmedMessage) {
    throw new Error('Title and message are required')
  }

  const recipientIds = await resolveTargetUserIds({ target, role, userId })
  if (!recipientIds.length) {
    throw new Error('No recipients found for this notification')
  }

  let sentCount = 0
  for (const recipientId of recipientIds) {
    await createNotification({
      userId: recipientId,
      title: trimmedTitle,
      message: trimmedMessage,
      entityType: 'announcement',
      entityId: null
    })
    sentCount += 1
  }

  return { sentCount, recipientIds }
}
