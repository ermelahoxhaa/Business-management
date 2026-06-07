import UserPreference from '../mongo/UserPreference.js'
import NotificationEvent from '../mongo/NotificationEvent.js'
import WorkspaceEvent from '../mongo/WorkspaceEvent.js'
import UserPresence from '../mongo/UserPresence.js'
import { isDbReady } from '../mongo/ready.js'

const safeWrite = async (writer) => {
  if (!isDbReady()) return null
  try {
    return await writer()
  } catch {
    return null
  }
}

export const logNotificationEvent = async ({
  notificationId,
  userId,
  eventType,
  channel = 'socket',
  title,
  message
}) =>
  safeWrite(() =>
    NotificationEvent.create({
      notification_id: notificationId,
      user_id: userId,
      event_type: eventType,
      channel,
      title,
      message
    })
  )

export const logWorkspaceEvent = async ({
  userId,
  action,
  entityType,
  entityId,
  message,
  metadata
}) =>
  safeWrite(() =>
    WorkspaceEvent.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      message,
      metadata: metadata || null
    })
  )

export const upsertUserPresence = async ({ userId, status }) =>
  safeWrite(() =>
    UserPresence.findOneAndUpdate(
      { user_id: userId },
      { status, last_seen_at: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  )

export const getUserPreferences = async (userId) => {
  if (!isDbReady()) {
    return {
      email_notifications: true,
      task_updates: true,
      project_updates: true
    }
  }

  const record = await UserPreference.findOne({ user_id: userId }).lean()
  return record || {
    email_notifications: true,
    task_updates: true,
    project_updates: true
  }
}

export const upsertUserPreferences = async (userId, preferences) =>
  safeWrite(() =>
    UserPreference.findOneAndUpdate(
      { user_id: userId },
      {
        email_notifications: preferences.email_notifications ?? true,
        task_updates: preferences.task_updates ?? true,
        project_updates: preferences.project_updates ?? true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  )
