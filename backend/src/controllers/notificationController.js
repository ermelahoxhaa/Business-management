import {
  countUnread,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  sendNotifications
} from '../services/notificationService.js'

export const getNotificationsController = async (req, res) => {
  try {
    const items = await listNotifications(req.user.id)
    const unread = await countUnread(req.user.id)
    res.json({ items, unread })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const markReadController = async (req, res) => {
  try {
    const notification = await markNotificationRead(req.user.id, req.params.id)
    res.json(notification)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const markAllReadController = async (req, res) => {
  try {
    await markAllNotificationsRead(req.user.id)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const sendNotificationsController = async (req, res) => {
  try {
    const result = await sendNotifications({
      title: req.body.title,
      message: req.body.message,
      target: req.body.target,
      role: req.body.role,
      userId: req.body.userId
    })
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
