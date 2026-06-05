import { useCallback, useEffect, useState } from 'react'
import './Header.css'
import {
  getNotifications,
  getUsers,
  markAllNotificationsRead,
  markNotificationRead,
  sendNotification
} from '../services/api'
import { getToken, getUserRole } from '../services/auth'
import { connectSocket, disconnectSocket } from '../services/socket'

const formatTimeAgo = (dateValue) => {
  const date = new Date(dateValue)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const emptySendForm = {
  title: '',
  message: '',
  target: 'role',
  role: 'employee',
  userId: ''
}

export default function NotificationPanel({ showAdminSend = false, onUnreadCountChange }) {
  const role = getUserRole()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState('')
  const [sendForm, setSendForm] = useState(emptySendForm)
  const [users, setUsers] = useState([])
  const [sending, setSending] = useState(false)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getNotifications()
      const items = response.data.items || []
      const unread = response.data.unread || 0
      setNotifications(items)
      setUnreadCount(unread)
      onUnreadCountChange?.(unread)
    } catch {
      setNotifications([])
      setUnreadCount(0)
      onUnreadCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }, [onUnreadCountChange])

  useEffect(() => {
    if (!getToken()) return undefined

    loadNotifications()
    connectSocket((payload) => {
      setNotifications((current) => [payload, ...current])
      setUnreadCount((count) => {
        const next = count + 1
        onUnreadCountChange?.(next)
        return next
      })
    })

    return () => disconnectSocket()
  }, [loadNotifications, onUnreadCountChange])

  useEffect(() => {
    if (!showAdminSend || role !== 'admin') return undefined

    const loadUsers = async () => {
      try {
        const response = await getUsers()
        setUsers(response.data || [])
      } catch {
        setUsers([])
      }
    }

    loadUsers()
  }, [showAdminSend, role])

  const handleMarkRead = async (notification) => {
    if (!notification.read_at) {
      try {
        await markNotificationRead(notification.id)
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        )
        setUnreadCount((count) => {
          const next = Math.max(0, count - 1)
          onUnreadCountChange?.(next)
          return next
        })
      } catch {
        // ignore
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
      )
      setUnreadCount(0)
      onUnreadCountChange?.(0)
      setActionMessage('All notifications marked as read.')
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to mark all notifications as read.')
    }
  }

  const handleSendFormChange = (event) => {
    const { name, value } = event.target
    setSendForm((current) => ({ ...current, [name]: value }))
  }

  const handleSendNotification = async (event) => {
    event.preventDefault()
    setSending(true)
    setActionMessage('')

    try {
      const payload = {
        title: sendForm.title,
        message: sendForm.message,
        target: sendForm.target
      }

      if (sendForm.target === 'role') {
        payload.role = sendForm.role
      }

      if (sendForm.target === 'user') {
        payload.userId = Number(sendForm.userId)
      }

      const response = await sendNotification(payload)
      setSendForm(emptySendForm)
      setActionMessage(`Notification sent to ${response.data.sentCount} user(s).`)
      await loadNotifications()
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Notifications</h2>
          <p className="mt-2 text-sm text-slate-400">Recent updates for your account</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500/15 px-3 py-1 text-sm font-semibold text-rose-200 ring-1 ring-rose-500/20">
              {unreadCount} unread
            </span>
          )}
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Mark all read
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          {actionMessage}
        </div>
      )}

      {showAdminSend && role === 'admin' && (
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white">Send announcement</h3>
          <p className="mt-2 text-sm text-slate-400">
            Create a notification for employees, team leaders, one user, or everyone on the platform.
          </p>

          <form onSubmit={handleSendNotification} className="mt-5 grid gap-4">
            <input
              type="text"
              name="title"
              value={sendForm.title}
              onChange={handleSendFormChange}
              placeholder="Notification title"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
              required
            />

            <textarea
              name="message"
              value={sendForm.message}
              onChange={handleSendFormChange}
              placeholder="Notification message"
              rows={4}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                name="target"
                value={sendForm.target}
                onChange={handleSendFormChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500/50 focus:outline-none"
              >
                <option value="role">By role</option>
                <option value="user">Single user</option>
                <option value="all">Everyone</option>
              </select>

              {sendForm.target === 'role' && (
                <select
                  name="role"
                  value={sendForm.role}
                  onChange={handleSendFormChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500/50 focus:outline-none"
                >
                  <option value="employee">Employees</option>
                  <option value="team_leader">Team leaders</option>
                  <option value="admin">Admins</option>
                </select>
              )}

              {sendForm.target === 'user' && (
                <select
                  name="userId"
                  value={sendForm.userId}
                  onChange={handleSendFormChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500/50 focus:outline-none"
                  required
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-fit rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send notification'}
            </button>
          </form>
        </section>
      )}

      <section className="notification-panel">
        {loading ? (
          <div className="notification-modal__empty">Loading notifications...</div>
        ) : notifications.length ? (
          <div className="notification-panel__content">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleMarkRead(notification)}
                className={`notification-modal__item w-full text-left ${notification.read_at ? 'opacity-75' : ''}`}
              >
                <p className="notification-modal__item-title">{notification.title}</p>
                <p className="text-sm text-slate-500">{notification.message}</p>
                <p className="notification-modal__item-time">{formatTimeAgo(notification.created_at)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="notification-modal__empty">No notifications yet.</div>
        )}
      </section>
    </div>
  )
}
